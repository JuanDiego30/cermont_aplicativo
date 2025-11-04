import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
const WHITELIST_IPS = new Set([
    ...(process.env.NODE_ENV !== 'production' ? ['127.0.0.1', '::1', '::ffff:127.0.0.1'] : []),
    ...(process.env.RATE_LIMIT_WHITELIST?.split(',').map((ip) => ip.trim()).filter(Boolean) || []),
]);
const BLACKLIST_IPS = new Set([
    ...(process.env.RATE_LIMIT_BLACKLIST?.split(',').map((ip) => ip.trim()).filter(Boolean) || []),
]);
class RateLimitStore {
    requests = new Map();
    violations = new Map();
    blocked = new Map();
    cleanupInterval = null;
    constructor() {
        if (process.env.NODE_ENV !== 'test') {
            this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
        }
        logger.info('[RateLimitStore] Initialized');
    }
    increment(key, windowMs) {
        const now = Date.now();
        let data = this.requests.get(key);
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
    get(key) {
        return this.requests.get(key);
    }
    reset(key) {
        this.requests.delete(key);
        this.violations.delete(key);
        this.blocked.delete(key);
        logger.debug('[RateLimit] Reset key', { key });
    }
    recordViolation(key) {
        const now = Date.now();
        let violations = this.violations.get(key) || { count: 0, firstViolation: now, lastViolation: now };
        violations.count++;
        violations.lastViolation = now;
        this.violations.set(key, violations);
        return violations;
    }
    shouldBlock(key) {
        const violations = this.violations.get(key);
        if (!violations || violations.count <= 10)
            return false;
        const timeSinceFirst = Date.now() - violations.firstViolation;
        return timeSinceFirst < 30 * 60 * 1000;
    }
    cleanup() {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, data] of this.requests.entries()) {
            if (now - data.resetTime > 60 * 60 * 1000) {
                this.requests.delete(key);
                cleaned++;
            }
        }
        for (const [key, v] of this.violations.entries()) {
            if (now - v.lastViolation > 60 * 60 * 1000) {
                this.violations.delete(key);
            }
        }
        for (const [key, expire] of this.blocked.entries()) {
            if (now > expire) {
                this.blocked.delete(key);
                BLACKLIST_IPS.delete(key);
            }
        }
        if (cleaned > 0) {
            logger.debug('[RateLimit] Cleanup', { cleaned, totalKeys: this.requests.size });
        }
    }
    getStats() {
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
const store = new RateLimitStore();
export const stopRateLimiter = () => {
    if (store.cleanupInterval) {
        clearInterval(store.cleanupInterval);
        store.cleanupInterval = null;
    }
    store['requests'].clear();
    store['violations'].clear();
    store['blocked'].clear();
    logger.info('[RateLimit] Stopped (test)');
};
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip']?.trim() ||
        req.ip ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        'unknown');
};
const isWhitelisted = (ip) => WHITELIST_IPS.has(ip);
const isBlacklisted = (ip) => BLACKLIST_IPS.has(ip);
export const rateLimiter = (options = {}) => {
    const { windowMs: windowMsRaw = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '0') || 15 * 60 * 1000, max: maxRaw = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '0') || 100, message = 'Demasiadas peticiones. Intenta más tarde.', statusCode = HTTP_STATUS.TOO_MANY_REQUESTS, skipSuccessfulRequests = false, skipFailedRequests = false, keyGenerator, skip, } = options;
    const windowMs = windowMsRaw;
    const max = maxRaw;
    return (req, res, next) => {
        const ip = getClientIp(req);
        if (isBlacklisted(ip)) {
            logger.warn('[RateLimit] Blacklisted IP', { ip, path: req.path });
            errorResponse(res, 'Acceso denegado (IP bloqueada)', HTTP_STATUS.FORBIDDEN, undefined, 'IP_BLOCKED');
            return;
        }
        if (isWhitelisted(ip) || (skip && skip(req, res))) {
            next();
            return;
        }
        const identifier = keyGenerator ? keyGenerator(req) : (req.user?.userId ? `user:${req.user.userId}:${req.path}` : `ip:${ip}:${req.path}`);
        const data = store.increment(identifier, windowMs);
        const timeUntilReset = Math.ceil((data.resetTime + windowMs - Date.now()) / 1000);
        res.set({
            'RateLimit-Limit': max.toString(),
            'RateLimit-Remaining': Math.max(0, max - data.count).toString(),
            'RateLimit-Reset': Math.ceil((data.resetTime + windowMs) / 1000).toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': Math.max(0, max - data.count).toString(),
            'X-RateLimit-Reset': Math.ceil((data.resetTime + windowMs) / 1000).toString(),
        });
        if (data.count > max) {
            const violations = store.recordViolation(identifier);
            if (store.shouldBlock(identifier)) {
                BLACKLIST_IPS.add(ip);
                store['blocked'].set(ip, Date.now() + 24 * 60 * 60 * 1000);
                logger.error('[RateLimit] Auto-blocked', { ip, violations: violations.count, path: req.path });
            }
            const severity = violations.count > 5 ? 'HIGH' : 'MEDIUM';
            const userAgent = req.get('User-Agent') || 'unknown';
            createAuditLog({
                userId: req.user?.userId || null,
                userEmail: req.user?.email || 'unknown',
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
            }).catch(() => { });
            logger.warn('[RateLimit] Exceeded', { identifier, ip, path: req.path, count: data.count, max, violations: violations.count });
            res.set('Retry-After', timeUntilReset.toString());
            errorResponse(res, message, statusCode, { retryAfter: timeUntilReset, limit: max, current: data.count }, 'RATE_LIMIT_EXCEEDED');
            return;
        }
        const originalSend = res.send;
        res.send = function (body) {
            const shouldDecrement = (skipSuccessfulRequests && res.statusCode < 400) || (skipFailedRequests && res.statusCode >= 400);
            if (shouldDecrement) {
                const current = store.get(identifier);
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
export const loginLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Demasiados intentos de login. Espera 15min.',
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
        const ip = getClientIp(req);
        const email = req.body?.email?.toLowerCase()?.trim() || '';
        return email ? `login:${ip}:${email}` : `login:${ip}`;
    },
});
export const strictLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Acceso limitado. Intenta más tarde.',
});
export const apiRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
export const uploadRateLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: 'Demasiadas subidas. Espera.',
    keyGenerator: (req) => {
        const ip = getClientIp(req);
        return req.user?.userId ? `upload:user:${req.user.userId}` : `upload:ip:${ip}`;
    },
});
export const createRateLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: 'Demasiadas creaciones.',
});
export const searchLimiter = rateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: 'Demasiadas búsquedas.',
});
export const blacklistMiddleware = (req, res, next) => {
    const ip = getClientIp(req);
    if (isBlacklisted(ip)) {
        logger.warn('[Blacklist] Blocked', { ip, path: req.path });
        errorResponse(res, 'IP bloqueada', HTTP_STATUS.FORBIDDEN, undefined, 'IP_BLOCKED');
        return;
    }
    next();
};
export const blockIp = (ip, reason = 'Manual') => {
    BLACKLIST_IPS.add(ip);
    store['blocked'].set(ip, Date.now() + 24 * 60 * 60 * 1000);
    logger.warn('[RateLimit] Blocked IP', { ip, reason });
    return true;
};
export const unblockIp = (ip) => {
    BLACKLIST_IPS.delete(ip);
    store['blocked'].delete(ip);
    logger.info('[RateLimit] Unblocked IP', { ip });
    return true;
};
export const whitelistIp = (ip) => {
    WHITELIST_IPS.add(ip);
    logger.info('[RateLimit] Whitelisted IP', { ip });
    return true;
};
export const removeFromWhitelist = (ip) => {
    WHITELIST_IPS.delete(ip);
    logger.info('[RateLimit] Removed from whitelist', { ip });
    return true;
};
export const resetIpLimit = (ip) => {
    const keys = Array.from(store['requests'].keys()).filter((k) => k.includes(`ip:${ip}:`));
    keys.forEach((key) => store.reset(key));
    logger.info('[RateLimit] Reset IP', { ip, keys: keys.length });
    return keys.length;
};
export const getRateLimitStats = () => store.getStats();
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
export const __store__ = process.env.NODE_ENV === 'test' ? store : undefined;
export default rateLimiter;
//# sourceMappingURL=rateLimiter.js.map