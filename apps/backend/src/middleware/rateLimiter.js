/**
 * Rate Limiter Middleware (Intelligent - October 2025)
 * @description Rate limiting inteligente con whitelist/blacklist y detección de abuso
 */

import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Whitelist de IPs (no aplicar rate limit)
 * NOTE: por seguridad en tests no incluimos localhost por defecto para que los tests de rate limiting funcionen.
 */
const WHITELIST_IPS = new Set([
  ...(process.env.NODE_ENV === 'test' ? [] : ['127.0.0.1', '::1', '::ffff:127.0.0.1']),
  ...(process.env.RATE_LIMIT_WHITELIST?.split(',').filter(Boolean) || []),
]);

/**
 * Blacklist de IPs (bloqueo total)
 */
const BLACKLIST_IPS = new Set([
  ...(process.env.RATE_LIMIT_BLACKLIST?.split(',').filter(Boolean) || []),
]);

/**
 * Store en memoria mejorado
 */
class RateLimitStore {
  constructor() {
    this.requests = new Map();
    this.blocked = new Map();
    this.violations = new Map();
    this.cleanupInterval = null;

    // Inicializar cleanup solo si NO es test para evitar open handles en Jest
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    logger.info('Rate limiter store initialized');
  }

  /**
   * Incrementar contador de requests
   */
  increment(key, windowMs) {
    const now = Date.now();
    let data = this.requests.get(key);
    
    // Inicializar o resetear si el window expiró
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
   * Obtener datos del store
   */
  get(key) {
    return this.requests.get(key);
  }

  /**
   * Resetear key específica
   */
  reset(key) {
    this.requests.delete(key);
    this.violations.delete(key);
    logger.debug(`Rate limit reset for key: ${key}`);
  }

  /**
   * Registrar violación
   */
  recordViolation(key) {
    const violations = this.violations.get(key) || { count: 0, firstViolation: Date.now() };
    violations.count++;
    violations.lastViolation = Date.now();
    this.violations.set(key, violations);
    
    return violations;
  }

  /**
   * Verificar si una IP debe ser bloqueada por abuso persistente
   */
  shouldBlock(key) {
    const violations = this.violations.get(key);
    if (!violations) return false;
    
    // Bloquear si: más de 10 violaciones en los últimos 30 minutos
    const threshold = 10;
    const timeWindow = 30 * 60 * 1000; // 30 minutos
    
    if (violations.count > threshold) {
      const timeSinceFirst = Date.now() - violations.firstViolation;
      if (timeSinceFirst < timeWindow) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Limpiar datos antiguos
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    // Limpiar requests antiguos (más de 1 hora)
    for (const [key, data] of this.requests.entries()) {
      if (now - data.resetTime > 60 * 60 * 1000) {
        this.requests.delete(key);
        cleaned++;
      }
    }
    
    // Limpiar violaciones antiguas (más de 1 hora)
    for (const [key, violations] of this.violations.entries()) {
      if (now - violations.lastViolation > 60 * 60 * 1000) {
        this.violations.delete(key);
      }
    }
    
    if (cleaned > 0) {
      logger.debug(`Rate limiter cleanup: ${cleaned} entries removed`);
    }
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    return {
      totalKeys: this.requests.size,
      totalViolations: this.violations.size,
      whitelistSize: WHITELIST_IPS.size,
      blacklistSize: BLACKLIST_IPS.size,
      topAbusers: this.getTopAbusers(10),
    };
  }

  /**
   * Obtener IPs con más violaciones
   */
  getTopAbusers(limit = 10) {
    return Array.from(this.violations.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([key, violations]) => ({
        key,
        violations: violations.count,
        firstViolation: new Date(violations.firstViolation).toISOString(),
        lastViolation: new Date(violations.lastViolation).toISOString(),
      }));
  }
}

const store = new RateLimitStore();

/**
 * Cleanup manual para tests
 */
export const stopRateLimiter = () => {
  try {
    if (store.cleanupInterval) {
      clearInterval(store.cleanupInterval);
      store.cleanupInterval = null;
    }
    store.requests.clear();
    store.violations.clear();
    store.blocked.clear();
    logger.info('Rate limiter stopped (test cleanup)');
  } catch (e) {
    logger.error('Error stopping rate limiter', { error: e.message });
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obtener IP real del cliente
 */
const getClientIp = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
};

/**
 * Verificar si IP está en whitelist
 */
const isWhitelisted = (ip) => {
  return WHITELIST_IPS.has(ip);
};

/**
 * Verificar si IP está en blacklist
 */
const isBlacklisted = (ip) => {
  return BLACKLIST_IPS.has(ip);
};

// ============================================================================
// RATE LIMITER PRINCIPAL
// ============================================================================

/**
 * Rate limiter genérico mejorado
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde',
    statusCode = HTTP_STATUS.TOO_MANY_REQUESTS || 429,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = null, // Función personalizada para generar key
    skip = null, // Función personalizada para skip
  } = options;

  return (req, res, next) => {
    const ip = getClientIp(req);
    
    // Bloquear IPs en blacklist
    if (isBlacklisted(ip)) {
      logger.warn(`Blocked request from blacklisted IP: ${ip} on ${req.path}`);
      return errorResponse(
        res,
        'Acceso denegado. Tu IP ha sido bloqueada.',
        HTTP_STATUS.FORBIDDEN
      );
    }
    
    // Skip para IPs whitelisted
    if (isWhitelisted(ip)) {
      return next();
    }
    
    // Skip personalizado
    if (skip && skip(req, res)) {
      return next();
    }
    
    // Generar key única
    const identifier = keyGenerator 
      ? keyGenerator(req) 
      : req.userId 
        ? `user:${req.userId}:${req.path}` 
        : `ip:${ip}:${req.path}`;
    
    // Incrementar contador
    const data = store.increment(identifier, windowMs);
    
    // Calcular tiempo restante para reset
    const timeUntilReset = Math.ceil((data.resetTime + windowMs - Date.now()) / 1000);
    
    // Headers informativos (RFC 6585 estándar + legacy X- para compatibilidad)
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader('RateLimit-Reset', Math.ceil((data.resetTime + windowMs) / 1000));
    // Legacy headers para compatibilidad
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((data.resetTime + windowMs) / 1000));
    
    // Verificar si excedió el límite
    if (data.count > max) {
      // Registrar violación
      const violations = store.recordViolation(identifier);
      
      // Verificar si debe ser bloqueado permanentemente
      if (store.shouldBlock(identifier)) {
        BLACKLIST_IPS.add(ip);
        logger.error(`IP auto-blocked for persistent abuse: ${ip}`, {
          violations: violations.count,
          path: req.path,
        });
      }
      
      logger.warn(`Rate limit exceeded for ${identifier}`, {
        ip,
        userId: req.userId,
        path: req.path,
        count: data.count,
        limit: max,
        violations: violations.count,
      });
      
      res.setHeader('Retry-After', timeUntilReset);
      
      return errorResponse(res, message, statusCode, {
        retryAfter: timeUntilReset,
        limit: max,
        current: data.count,
      });
    }
    
    // Manejar skip de peticiones exitosas/fallidas
    const originalSend = res.send;
    res.send = function (data) {
      const shouldDecrement =
        (skipSuccessfulRequests && res.statusCode < 400) ||
        (skipFailedRequests && res.statusCode >= 400);

      if (shouldDecrement) {
        const current = store.get(identifier);
        if (current && current.count > 0) {
          current.count--;
        }
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// ============================================================================
// RATE LIMITERS PRECONFIGURADOS
// ============================================================================

/**
 * Rate limiter para autenticación (login, register)
 * 10 requests por 15 minutos
 */
export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    const email = req.body?.email;
    // Limitar por IP + email para prevenir ataques distribuidos
    return email ? `login:${ip}:${email}` : `login:${ip}`;
  },
});

/**
 * Rate limiter estricto para endpoints sensibles
 * 5 requests por 15 minutos
 */
export const strictLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Límite de solicitudes alcanzado. Por favor, intenta más tarde.',
});

/**
 * Rate limiter para API general
 * 100 requests por 15 minutos
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/**
 * Rate limiter para uploads
 * 20 requests por hora
 */
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Demasiadas subidas de archivos. Por favor intenta de nuevo más tarde',
  keyGenerator: (req) => {
    const ip = getClientIp(req);
    return req.userId ? `upload:user:${req.userId}` : `upload:ip:${ip}`;
  },
});

/**
 * Rate limiter para creación de recursos
 * 50 requests por hora
 */
export const createRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Demasiadas creaciones de recursos. Por favor espera un momento',
});

/**
 * Rate limiter para búsquedas
 * 30 requests por 5 minutos
 */
export const searchLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: 'Demasiadas búsquedas. Por favor, intenta más tarde.',
});

// ============================================================================
// MIDDLEWARE DE BLACKLIST
// ============================================================================

/**
 * Middleware para verificar blacklist (aplicar globalmente)
 */
export const blacklistMiddleware = (req, res, next) => {
  const ip = getClientIp(req);
  
  if (isBlacklisted(ip)) {
    logger.warn(`Blocked request from blacklisted IP: ${ip} on ${req.path}`);
    
    return errorResponse(
      res,
      'Acceso denegado',
      HTTP_STATUS.FORBIDDEN,
      { code: 'IP_BLOCKED' }
    );
  }
  
  next();
};

// ============================================================================
// FUNCIONES DE GESTIÓN
// ============================================================================

/**
 * Agregar IP a blacklist
 */
export const blockIp = (ip, reason = 'Manual block') => {
  BLACKLIST_IPS.add(ip);
  logger.warn(`IP blocked: ${ip} - Reason: ${reason}`);
  return true;
};

/**
 * Remover IP de blacklist
 */
export const unblockIp = (ip) => {
  BLACKLIST_IPS.delete(ip);
  logger.info(`IP unblocked: ${ip}`);
  return true;
};

/**
 * Agregar IP a whitelist
 */
export const whitelistIp = (ip) => {
  WHITELIST_IPS.add(ip);
  logger.info(`IP whitelisted: ${ip}`);
  return true;
};

/**
 * Remover IP de whitelist
 */
export const removeFromWhitelist = (ip) => {
  WHITELIST_IPS.delete(ip);
  logger.info(`IP removed from whitelist: ${ip}`);
  return true;
};

/**
 * Resetear límite para una IP
 */
export const resetIpLimit = (ip) => {
  const keys = Array.from(store.requests.keys()).filter(k => k.includes(ip));
  keys.forEach(key => store.reset(key));
  logger.info(`Rate limit reset for IP: ${ip} (${keys.length} keys)`);
  return keys.length;
};

/**
 * Obtener estadísticas
 */
export const getRateLimitStats = () => {
  return store.getStats();
};

/**
 * Exportar manager completo
 */
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

// Exportar store para testing (opcional)
export const __store__ = process.env.NODE_ENV === 'test' ? store : undefined;
