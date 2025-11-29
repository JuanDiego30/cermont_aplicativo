import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Demasiados intentos de inicio de sesión. Por favor intente nuevamente en 15 minutos.',
        },
    },
    handler: (req, res, next, options) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    },
});
