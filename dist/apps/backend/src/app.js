import express from 'express';
import httpsRedirect from './middleware/httpsRedirect';
import { advancedSecurityHeaders, permissionsPolicy } from './config/securityHeaders';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { morganStream, logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import routes from './routes/index';
import { blacklistMiddleware, apiRateLimiter } from './middleware/rateLimiter';
import { xssCleanMiddleware, mongoSanitization, sanitizeAll, detectThreats } from './middleware/sanitize';
import { authenticate } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
const validateEnv = () => {
    logger.info('✅ Env validation passed');
    return true;
};
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400,
};
const shouldCompress = (req, res) => {
    if (req.headers['x-no-compression'])
        return false;
    return compression.filter(req, res);
};
const app = express();
if (!validateEnv()) {
    process.exit(1);
}
app.use(httpsRedirect);
app.use(advancedSecurityHeaders());
app.use(permissionsPolicy);
app.use(cors(corsOptions));
app.use(blacklistMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: shouldCompress,
}));
logger.info('✅ Compression middleware enabled');
app.use(cookieParser());
app.use(mongoSanitization);
app.use(xssCleanMiddleware);
app.use(sanitizeAll());
if (process.env.NODE_ENV !== 'production') {
    app.use(detectThreats);
}
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));
const uploadsPath = path.join(process.cwd(), process.env.STORAGE_DIR || 'uploads');
app.use('/uploads', authenticate, express.static(uploadsPath, {
    maxAge: '1d',
    setHeaders: (res, path) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
    },
}));
const publicPath = path.join(process.cwd(), 'public');
app.use('/public', express.static(publicPath, { maxAge: '1y' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
        security: {
            helmet: true,
            cors: true,
            rateLimiting: true,
            sanitization: true,
            mongoSanitization: true,
            xssProtection: true,
        },
    });
});
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CERMONT ATG API',
        version: process.env.APP_VERSION || '1.0.0',
        documentation: '/api-docs' + (process.env.NODE_ENV !== 'production' ? ' (Swagger)' : ''),
        status: 'operational',
    });
});
app.use('/api/', apiRateLimiter);
if (process.env.NODE_ENV !== 'production' && process.env.SWAGGER_ENABLED !== 'false') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    logger.info('📚 Swagger docs available at /api-docs');
}
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
process.on('unhandledRejection', (reason, promise) => {
    logger.error('❌ Unhandled Rejection at:', { promise, reason: reason });
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
process.on('uncaughtException', (error) => {
    logger.error('❌ Uncaught Exception:', error);
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});
const gracefulShutdown = (server) => {
    logger.info('👋 Shutdown signal received. Closing gracefully...');
    server.close((err) => {
        if (err) {
            logger.error('Server close error:', err);
            process.exit(1);
        }
        logger.info('✅ Closed out clean.');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('⚠️ Could not close connections in time, forcefully shutting down.');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown);
process.on('SIGINT', () => gracefulShutdown);
export default app;
export { gracefulShutdown };
//# sourceMappingURL=app.js.map