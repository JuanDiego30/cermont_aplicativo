// ============================================
// Rate Limiting Middleware - Cermont FSM
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { getCacheManager, isRedisConnected } from '../../config/redis.js';
import { logger } from '../../config/logger.js';

interface RateLimitOptions {
  windowMs: number; // Ventana de tiempo en ms
  maxRequests: number; // Máximo de requests por ventana
  keyGenerator?: (req: Request) => string;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  skip?: (req: Request) => boolean;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,
  message: 'Too many requests, please try again later',
};

// In-memory fallback cuando Redis no está disponible
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

function cleanupInMemoryStore() {
  const now = Date.now();
  for (const [key, value] of inMemoryStore.entries()) {
    if (value.resetTime < now) {
      inMemoryStore.delete(key);
    }
  }
}

// Limpiar cada minuto
setInterval(cleanupInMemoryStore, 60000);

export function createRateLimiter(options: Partial<RateLimitOptions> = {}) {
  const config = { ...defaultOptions, ...options };

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip si está configurado
    if (config.skip?.(req)) {
      return next();
    }

    const keyGenerator = config.keyGenerator || ((r: Request) => 
      r.ip || r.connection?.remoteAddress || 'unknown'
    );

    const key = `rate-limit:${keyGenerator(req)}`;
    const windowSeconds = Math.ceil(config.windowMs / 1000);

    try {
      let current: number;
      let resetTime: number;

      if (isRedisConnected()) {
        // Usar Redis
        const cache = getCacheManager();
        current = await cache.increment(key, windowSeconds);
        const ttl = await cache.ttl(key.replace('cermont:', ''));
        resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : config.windowMs);
      } else {
        // Fallback a memoria
        const now = Date.now();
        const record = inMemoryStore.get(key);

        if (!record || record.resetTime < now) {
          inMemoryStore.set(key, { count: 1, resetTime: now + config.windowMs });
          current = 1;
          resetTime = now + config.windowMs;
        } else {
          record.count++;
          current = record.count;
          resetTime = record.resetTime;
        }
      }

      // Headers de rate limit
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current));
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (current > config.maxRequests) {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          current,
          limit: config.maxRequests,
        });

        return res.status(429).json({
          status: 'error',
          message: config.message,
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        });
      }

      next();
    } catch (error) {
      // Si hay error, permitir el request (fail-open)
      logger.error('Rate limiter error:', error);
      next();
    }
  };
}

// ============================================
// Rate Limiters Predefinidos
// ============================================

// API general
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100,
  message: 'Demasiadas solicitudes. Intente de nuevo en 15 minutos.',
});

// Auth (más estricto)
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5,
  message: 'Demasiados intentos de autenticación. Intente de nuevo en 15 minutos.',
  keyGenerator: (req) => `auth:${req.ip}:${req.body?.email || 'unknown'}`,
});

// Password reset (muy estricto)
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 3,
  message: 'Demasiadas solicitudes de recuperación. Intente de nuevo en 1 hora.',
});

// Upload (limitado)
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 50,
  message: 'Límite de uploads alcanzado. Intente de nuevo en 1 hora.',
});

// Reports (costosos en recursos)
export const reportLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  maxRequests: 10,
  message: 'Límite de reportes alcanzado. Intente de nuevo en 5 minutos.',
});

// Export default
export default {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  reportLimiter,
};
