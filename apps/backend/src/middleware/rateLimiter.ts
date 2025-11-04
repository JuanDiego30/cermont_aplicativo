/**
 * Rate Limiter Middleware (Intelligent - TypeScript - November 2025)
 * @description Rate limiting inteligente con in-memory store (Redis-ready), whitelist/blacklist,
 * auto-block por abuso persistente, y headers RFC 6585. Soporta user/IP keys, skip success/fail.
 * Logs/audit violations. Para ATG: Protege auth/uploads/orders vs DDoS/brute-force.
 * Uso: app.use('/api', apiRateLimiter); router.post('/login', loginLimiter, login);
 * Admin: GET /admin/rate-stats (con requireAdmin). Nota: In-memory (single instance); para cluster/prod, integra Redis (ver comment en Store).
 * Pruebas: Jest mock store, increment > max (expect 429 + headers + audit), whitelist (next), blacklist (403), skipSuccess (count-- on 200).
 * Types: @types/express. RateLimitStore class full typed. RateLimiterOptions interface. TypedRequest from auth.
 * Fixes: Maps: Map<string, RateLimitData>, etc. Env: parseInt safe (|| fallback). getClientIp: string always. res.send override typed (any for body). Auto-block sync BLACKLIST_IPS.
 * Assumes: HTTP_STATUS { TOO_MANY_REQUESTS: 429, FORBIDDEN: 403 }. errorResponse(res: Response, msg: string, status: number, details?: any[], code?: string): void.
 * Redis: For distributed, replace Map with redis.incr/hincrby (e.g., key: `rate:{identifier}`, expire: windowMs).
 */


import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

import type { TypedRequest } from '../types'; // For req.user

// Infer AuthUser (from auth.ts)
interface AuthUser {
  userId: string;
  email?: string;
}

// Audit options partial (assume full in auditLogger.ts)
interface AuditOptions {
  userId: string | null;
  userEmail?: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  status: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  metadata?: any;
}

// Rate limit data types
interface RateLimitData {
  count: number;
  resetTime: number;
  windowMs: number;
  firstRequest: number;
  lastRequest?: number;
}

interface ViolationData {
  count: number;
  firstViolation: number;
  lastViolation: number;
}

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request, res: Response) => boolean;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Whitelist de IPs (skip rate limit)
 * Dev/test: Incluye localhost; prod: Env var.
 */
const WHITELIST_IPS: Set<string> = new Set<string>([
  ...(process.env.NODE_ENV !== 'production' ? ['127.0.0.1', '::1', '::ffff:127.0.0.1'] : []),
  ...(process.env.RATE_LIMIT_WHITELIST?.split(',').map((ip: string) => ip.trim()).filter(Boolean) || []),
]);

/**
 * Blacklist de IPs (block total, 403)
 * In-memory; para persistencia, usa DB/Redis on admin endpoints.
 */
const BLACKLIST_IPS: Set<string> = new Set<string>([
  ...(process.env.RATE_LIMIT_BLACKLIST?.split(',').map((ip: string) => ip.trim()).filter(Boolean) || []),
]);

/**
 * In-Memory Store (Redis-ready via ioredis or similar)
 * Para distributed: Reemplaza Map con Redis client (e.g., this.requests = new Map() -> redis.hincrby).
 */
class RateLimitStore {
  private requests: Map<string, RateLimitData> = new Map<string, RateLimitData>();
  private violations: Map<string, ViolationData> = new Map<string, ViolationData>();
  private blocked: Map<string, number> = new Map<string, number>(); // key: expire time
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Interval solo no-test (Jest open handles)
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000); // 5min
    }

    logger.info('[RateLimitStore] Initialized');
  }

  /**
   * Increment request count (window-based)
   * @param key Identifier
   * @param windowMs Time window
   * @returns Data
   */
  increment(key: string, windowMs: number): RateLimitData {
    const now: number = Date.now();
    let data: RateLimitData | undefined = this.requests.get(key);

    if (!data || now - data.resetTime > windowMs) {
      data = {
        count: 0,
        resetTime: now,
        windowMs,
        firstRequest: now,
      };
    }

    data.count++;
    data.lastRequest = now;
    this.requests.set(key, data);

    return data;
  }

  /**
   * Get data for key
   * @param key 
   * @returns Data or null
   */
  get(key: string): RateLimitData | undefined {
    return this.requests.get(key);
  }

  /**
   * Reset specific key
   * @param key 
   */
  reset(key: string): void {
    this.requests.delete(key);
    this.violations.delete(key);
    this.blocked.delete(key);
    logger.debug('[RateLimit] Reset key', { key });
  }

  /**
   * Record violation
   * @param key 
   * @returns Violations data
   */
  recordViolation(key: string): ViolationData {
    const now: number = Date.now();
    let violations: ViolationData = this.violations.get(key) || { count: 0, firstViolation: now, lastViolation: now };
    violations.count++;
    violations.lastViolation = now;
    this.violations.set(key, violations);

    return violations;
  }

  /**
   * Check if should auto-block (persistent abuse)
   * @param key 
   * @returns true if block
   */
  shouldBlock(key: string): boolean {
    const violations: ViolationData | undefined = this.violations.get(key);
    if (!violations || violations.count <= 10) return false; // Threshold 10

    const timeSinceFirst: number = Date.now() - violations.firstViolation;
    return timeSinceFirst < 30 * 60 * 1000; // <30min
  }

  /**
   * Cleanup old entries (>1h)
   */
  cleanup(): void {
    const now: number = Date.now();
    let cleaned: number = 0;

    // Requests
    for (const [key, data] of this.requests.entries()) {
      if (now - data.resetTime > 60 * 60 * 1000) {
        this.requests.delete(key);
        cleaned++;
      }
    }

    // Violations (>1h since last)
    for (const [key, v] of this.violations.entries()) {
      if (now - v.lastViolation > 60 * 60 * 1000) {
        this.violations.delete(key);
      }
    }

    // Blocked (>24h)
    for (const [key, expire] of this.blocked.entries()) {
      if (now > expire) {
        this.blocked.delete(key);
        BLACKLIST_IPS.delete(key); // Sync
      }
    }

    if (cleaned > 0) {
      logger.debug('[RateLimit] Cleanup', { cleaned, totalKeys: this.requests.size });
    }
  }

  /**
   * Get stats
   * @returns Stats object
   */
  getStats(): {
    totalKeys: number;
    totalViolations: number;
    blocked: number;
    whitelist: number;
    blacklist: number;
    topAbusers: Array<{ key: string; count: number; first: string }>;
  } {
    return {
      totalKeys: this.requests.size,
      totalViolations: this.violations.size,
      blocked: this.blocked.size,
      whitelist: WHITELIST_IPS.size,
      blacklist: BLACKLIST_IPS.size,
      topAbusers: Array.from(this.violations.entries())
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .map(([key, v]) => ({ key, count: v.count, first: new Date(v.firstViolation).toISOString() })),
    };
  }
}

const store: RateLimitStore = new RateLimitStore();

/**
 * Test cleanup (export for Jest)
 */
export const stopRateLimiter = (): void => {
  if (store.cleanupInterval) {
    clearInterval(store.cleanupInterval);
    store.cleanupInterval = null;
  }
  store['requests'].clear(); // Private access via bracket
  store['violations'].clear();
  store['blocked'].clear();
  logger.info('[RateLimit] Stopped (test)');
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get real client IP (proxy-safe)
 * @param req 
 * @returns IP string
 */
const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string)?.trim() ||
    req.ip ||
    (req.connection?.remoteAddress as string) ||
    (req.socket?.remoteAddress as string) ||
    'unknown'
  );
};

/**
 * Is IP whitelisted?
 * @param ip 
 * @returns true if whitelisted
 */
const isWhitelisted = (ip: string): boolean => WHITELIST_IPS.has(ip);

/**
 * Is IP blacklisted?
 * @param ip 
 * @returns true if blacklisted
 */
const isBlacklisted = (ip: string): boolean => BLACKLIST_IPS.has(ip);

// ============================================================================
// RATE LIMITER PRINCIPAL
// ============================================================================

/**
 * Generic rate limiter
 * @param options Config
 * @returns Middleware
 */
export const rateLimiter = (options: RateLimiterOptions = {}): ((req: Request, res: Response, next: NextFunction) => void) => {
  const {
    windowMs: windowMsRaw = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '0') || 15 * 60 * 1000,
    max: maxRaw = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '0') || 100,
    message = 'Demasiadas peticiones. Intenta más tarde.',
    statusCode = HTTP_STATUS.TOO_MANY_REQUESTS,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator,
    skip,
  } = options;

  const windowMs: number = windowMsRaw;
  const max: number = maxRaw;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip: string = getClientIp(req);

    // Blacklist check (403)
    if (isBlacklisted(ip)) {
      logger.warn('[RateLimit] Blacklisted IP', { ip, path: req.path });
      errorResponse(res, 'Acceso denegado (IP bloqueada)', HTTP_STATUS.FORBIDDEN, undefined, 'IP_BLOCKED');
      return;
    }

    // Whitelist/skip
    if (isWhitelisted(ip) || (skip && skip(req, res))) {
      next();
      return;
    }

    // Key gen
    const identifier: string = keyGenerator ? keyGenerator(req) : ((req as TypedRequest).user?.userId ? `user:${(req as TypedRequest).user.userId}:${req.path}` : `ip:${ip}:${req.path}`);

    // Increment
    const data: RateLimitData = store.increment(identifier, windowMs);
    const timeUntilReset: number = Math.ceil((data.resetTime + windowMs - Date.now()) / 1000);

    // Headers (RFC 6585 + legacy)
    res.set({
      'RateLimit-Limit': max.toString(),
      'RateLimit-Remaining': Math.max(0, max - data.count).toString(),
      'RateLimit-Reset': Math.ceil((data.resetTime + windowMs) / 1000).toString(),
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - data.count).toString(),
      'X-RateLimit-Reset': Math.ceil((data.resetTime + windowMs) / 1000).toString(),
    });

    // Exceeded?
    if (data.count > max) {
      const violations: ViolationData = store.recordViolation(identifier);

      // Auto-block if persistent
      if (store.shouldBlock(identifier)) {
        BLACKLIST_IPS.add(ip);
        store['blocked'].set(ip, Date.now() + 24 * 60 * 60 * 1000); // 24h TTL
        logger.error('[RateLimit] Auto-blocked', { ip, violations: violations.count, path: req.path });
      }

      // Audit violation (MEDIUM if >threshold)
      const severity: 'HIGH' | 'MEDIUM' = violations.count > 5 ? 'HIGH' : 'MEDIUM';
      const userAgent: string = req.get('User-Agent') || 'unknown';
      createAuditLog({
        userId: (req as TypedRequest).user?.userId || null,
        userEmail: (req as TypedRequest).user?.email || 'unknown',
        action: 'RATE_LIMIT_VIOLATION',
        resource: 'Security',
        ipAddress: ip,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method,
        status: 'DENIED',
        severity,
        description: `Rate limit excedido: ${violations.count} violations`,
        metadata: { identifier, limit: max, current: data.count },
      } as Partial<AuditOptions>).catch(() => {}); // Silent

      logger.warn('[RateLimit] Exceeded', { identifier, ip, path: req.path, count: data.count, max, violations: violations.count });

      res.set('Retry-After', timeUntilReset.toString());
      errorResponse(
        res,
        message,
        statusCode,
        { retryAfter: timeUntilReset, limit: max, current: data.count },
        'RATE_LIMIT_EXCEEDED'
      );
      return;
    }

    // Skip logic (override res.send)
    const originalSend: (body: any) => Response = res.send;
    res.send = function (this: Response, body: any): Response {
      const shouldDecrement: boolean = (skipSuccessfulRequests && res.statusCode < 400) || (skipFailedRequests && res.statusCode >= 400);
      if (shouldDecrement) {
        const current: RateLimitData | undefined = store.get(identifier);
        if (current?.count > 0) {
          current.count--;
          store['requests'].set(identifier, current);
        }
      }
      return originalSend.call(this, body);
    };

    next();
  };
};

// ============================================================================
// PRECONFIGURED LIMITERS
// ============================================================================

/**
 * Login limiter (per IP/email)
 */
export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de login. Espera 15min.',
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request): string => {
    const ip: string = getClientIp(req);
    const email: string = (req.body as any)?.email?.toLowerCase()?.trim() || '';
    return email ? `login:${ip}:${email}` : `login:${ip}`;
  },
});

/**
 * Strict for sensitive (admin/reset)
 */
export const strictLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Acceso limitado. Intenta más tarde.',
});

/**
 * General API
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Uploads (per user/IP)
 */
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Demasiadas subidas. Espera.',
  keyGenerator: (req: Request): string => {
    const ip: string = getClientIp(req);
    return (req as TypedRequest).user?.userId ? `upload:user:${(req as TypedRequest).user.userId}` : `upload:ip:${ip}`;
  },
});

/**
 * Creates (orders/workplans)
 */
export const createRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Demasiadas creaciones.',
});

/**
 * Searches
 */
export const searchLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Demasiadas búsquedas.',
});

// ============================================================================
// BLACKLIST MIDDLEWARE
// ============================================================================

/**
 * Global blacklist check (use early)
 */
export const blacklistMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const ip: string = getClientIp(req);
  if (isBlacklisted(ip)) {
    logger.warn('[Blacklist] Blocked', { ip, path: req.path });
    errorResponse(res, 'IP bloqueada', HTTP_STATUS.FORBIDDEN, undefined, 'IP_BLOCKED');
    return;
  }
  next();
};

// ============================================================================
// MANAGEMENT FUNCTIONS (Admin use)
// ============================================================================

/**
 * Block IP (adds to Set + blocked TTL)
 * @param ip 
 * @param reason 
 * @returns true
 */
export const blockIp = (ip: string, reason: string = 'Manual'): boolean => {
  BLACKLIST_IPS.add(ip);
  store['blocked'].set(ip, Date.now() + 24 * 60 * 60 * 1000); // 24h
  logger.warn('[RateLimit] Blocked IP', { ip, reason });
  return true;
};

/**
 * Unblock IP
 * @param ip 
 * @returns true
 */
export const unblockIp = (ip: string): boolean => {
  BLACKLIST_IPS.delete(ip);
  store['blocked'].delete(ip);
  logger.info('[RateLimit] Unblocked IP', { ip });
  return true;
};

/**
 * Whitelist IP
 * @param ip 
 * @returns true
 */
export const whitelistIp = (ip: string): boolean => {
  WHITELIST_IPS.add(ip);
  logger.info('[RateLimit] Whitelisted IP', { ip });
  return true;
};

/**
 * Remove from whitelist
 * @param ip 
 * @returns true
 */
export const removeFromWhitelist = (ip: string): boolean => {
  WHITELIST_IPS.delete(ip);
  logger.info('[RateLimit] Removed from whitelist', { ip });
  return true;
};

/**
 * Reset limit for IP
 * @param ip 
 * @returns Keys reset count
 */
export const resetIpLimit = (ip: string): number => {
  const keys: string[] = Array.from(store['requests'].keys()).filter((k: string) => k.includes(`ip:${ip}:`));
  keys.forEach((key: string) => store.reset(key));
  logger.info('[RateLimit] Reset IP', { ip, keys: keys.length });
  return keys.length;
};

/**
 * Get stats
 * @returns Stats
 */
export const getRateLimitStats = (): ReturnType<RateLimitStore['getStats']> => store.getStats();

export const rateLimitManager = {
  blockIp,
  unblockIp,
  whitelistIp,
  removeFromWhitelist,
  resetIpLimit,
  getStats: getRateLimitStats,
  isBlacklisted,
  isWhitelisted,
  getClientIp,
};

// Test export
export const __store__ = process.env.NODE_ENV === 'test' ? store : undefined;

export default rateLimiter;
