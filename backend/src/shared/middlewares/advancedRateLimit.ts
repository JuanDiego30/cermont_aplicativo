import rateLimit from 'express-rate-limit';
import RedisStore, { type RedisReply, type SendCommandFn } from 'rate-limit-redis';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger.js';

// Configuración de Redis (Opcional)
const redisUrl = process.env.REDIS_URL;
let redisClient: Redis | undefined;
let redisSendCommand: SendCommandFn | undefined;

if (redisUrl) {
    try {
        redisClient = new Redis(redisUrl, {
            enableOfflineQueue: false,
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
        });

        redisSendCommand = async (...args: Parameters<SendCommandFn>) => {
            return redisClient!.call(
                ...(args as unknown as [string, ...Array<string | number | Buffer>])
            ) as Promise<RedisReply>;
        };

        redisClient.on('error', (err: Error) => {
            logger.warn('⚠️ Redis connection error for Rate Limiting, falling back to memory', { error: err.message });
        });

        redisClient.on('connect', () => {
            logger.info('✅ Redis connected for Rate Limiting');
        });
    } catch (error) {
        logger.warn('⚠️ Could not initialize Redis for Rate Limiting', { error });
    }
}

/**
 * Rate Limiter para Autenticación (Login/Register)
 * Estricto: 5 intentos cada 15 minutos
 */
export const authRateLimiter = rateLimit({
    store: redisClient
        ? new RedisStore({
            sendCommand: redisSendCommand!,
            prefix: 'rl:auth:',
        })
        : undefined, // Fallback to memory store
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        status: 'error',
        message: 'Demasiados intentos de inicio de sesión. Por favor, intenta nuevamente en 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar logins exitosos (opcional, depende de la estrategia)
    handler: (req, res, next, options) => {
        logger.warn(`🚫 Auth Rate Limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    },
});

/**
 * Rate Limiter para API General
 * Moderado: 100 peticiones por minuto
 */
export const apiRateLimiter = rateLimit({
    store: redisClient
        ? new RedisStore({
            sendCommand: redisSendCommand!,
            prefix: 'rl:api:',
        })
        : undefined,
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // 100 peticiones
    message: {
        status: 'error',
        message: 'Has excedido el límite de peticiones. Por favor, intenta más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
