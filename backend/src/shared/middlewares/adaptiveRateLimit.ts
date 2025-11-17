import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * ADAPTIVE RATE LIMITING
 * ========================================
 * Rate limiting adaptativo basado en el rol del usuario.
 * Usuarios con mayor privilegio tienen límites más altos.
 * 
 * **Límites por defecto:**
 * - ROOT: 500 req/min
 * - ADMIN: 500 req/min
 * - COORDINADOR: 200 req/min
 * - OPERARIO: 50 req/min
 * - ANONYMOUS: 20 req/min
 */

/**
 * Límites por rol (requests por minuto)
 * Configurables por variables de entorno
 */
const RATE_LIMITS: Record<string, number> = {
  ROOT: parseInt(process.env.RATE_LIMIT_ROOT || '500', 10),
  ADMIN: parseInt(process.env.RATE_LIMIT_ADMIN || '500', 10),
  COORDINADOR: parseInt(process.env.RATE_LIMIT_COORDINADOR || '200', 10),
  OPERARIO: parseInt(process.env.RATE_LIMIT_OPERARIO || '50', 10), // ✅ CORREGIDO
  anonymous: parseInt(process.env.RATE_LIMIT_ANONYMOUS || '20', 10),
};

/**
 * Middleware de rate limiting adaptativo
 * 
 * @example
 * ```
 * import { adaptiveRateLimit } from './middlewares/adaptiveRateLimit.js';
 * 
 * app.use(adaptiveRateLimit());
 * ```
 */
export function adaptiveRateLimit() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: (req: Request) => {
      const userRole = req.user?.role?.toUpperCase() || 'anonymous';
      const limit = RATE_LIMITS[userRole] || RATE_LIMITS.anonymous;

      logger.debug('Rate limit check', {
        role: userRole,
        limit,
        ip: req.ip,
      });

      return limit;
    },
    message: {
      type: 'https://httpstatuses.com/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Has excedido el límite de peticiones. Intenta más tarde.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    // Handler cuando se excede el límite
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        role: req.user?.role || 'anonymous',
        path: req.path,
        method: req.method,
      });

      res.status(429).json({
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Has excedido el límite de peticiones. Intenta más tarde.',
        retryAfter: '60s',
      });
    },
  });
}

/**
 * Rate limit más estricto para endpoints sensibles (login, registro, etc.)
 * 
 * @example
 * ```
 * router.post('/login', strictRateLimit(), authController.login);
 * ``` 
 */
export function strictRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos máximo
    message: {
      type: 'https://httpstatuses.com/429',
      title: 'Too Many Requests',
      status: 429,
      detail: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos
    handler: (req: Request, res: Response) => {
      logger.warn('Strict rate limit exceeded', {
        ip: req.ip,
        path: req.path,
      });

      res.status(429).json({
        type: 'https://httpstatuses.com/429',
        title: 'Too Many Requests',
        status: 429,
        detail: 'Demasiados intentos. Intenta nuevamente en 15 minutos.',
        retryAfter: '900s',
      });
    },
  });
}
