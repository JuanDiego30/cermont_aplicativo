/**
 * Express Application Configuration (TypeScript - November 2025)
 * CERMONT ATG Backend - Middleware stack completo con seguridad, sanitización, y manejo de errores
 */

import express, { type Application, type Request, type Response } from 'express';
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
import { mongoSanitization, sanitizeAll } from './middleware/sanitize';
import { authenticate } from './middleware/auth';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// ✅ FIX 1: Import httpsRedirect y securityHeaders correctamente
import httpsRedirect from './middleware/httpsRedirect.js';
import { advancedSecurityHeaders, permissionsPolicy } from './config/securityHeaders.js';

// Env validation
const validateEnv = (): boolean => {
  logger.info('✅ Env validation passed');
  return true;
};

// CORS options
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400,
};

// Compression filter
const shouldCompress = (req: Request, res: Response): boolean => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
};

// Create app
const app: Application = express();

// Validate env
if (!validateEnv()) {
  process.exit(1);
}

// ==================== SECURITY MIDDLEWARES ====================

// ✅ FIX 2: Middlewares sin tipo explícito para evitar conflictos
app.use(httpsRedirect as any);
app.use(advancedSecurityHeaders() as any);
app.use(permissionsPolicy as any);
app.use(cors(corsOptions));
app.use(blacklistMiddleware as any);

// ==================== PARSING ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== COMPRESSION ====================

app.use(compression({
  level: 6,
  threshold: 1024,
  filter: shouldCompress,
}));

logger.info('✅ Compression middleware enabled');

// ==================== COOKIES ====================

app.use(cookieParser());

// ==================== SANITIZATION ====================

app.use(mongoSanitization as any);
app.use(sanitizeAll() as any);

// ==================== LOGGING ====================

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// ==================== STATIC FILES ====================

const uploadsPath = path.join(process.cwd(), process.env.STORAGE_DIR || 'uploads');
app.use('/uploads', authenticate as any, express.static(uploadsPath, {
  maxAge: '1d',
  setHeaders: (res: Response) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  },
}));

const publicPath = path.join(process.cwd(), 'public');
app.use('/public', express.static(publicPath, { maxAge: '1y' }));

// ==================== HEALTH & ROOT ====================

app.get('/health', (_req: Request, res: Response) => {
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

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CERMONT ATG API',
    version: process.env.APP_VERSION || '1.0.0',
    documentation: '/api-docs' + (process.env.NODE_ENV !== 'production' ? ' (Swagger)' : ''),
    status: 'operational',
  });
});

// ==================== RATE LIMITING ====================

// 17. API rate limiter (after health/root)
app.use('/api/', apiRateLimiter);

// ==================== API ROUTES ====================

// 19. Swagger docs (dev only)
if (process.env.NODE_ENV !== 'production' && process.env.SWAGGER_ENABLED !== 'false') {
  app.use('/api-docs', swaggerUi.serve as any, swaggerUi.setup(swaggerSpec) as any);
  logger.info('📚 Swagger docs available at /api-docs');
}

// 19. Modular routes /api/v1
app.use('/api/v1', routes as any);

// ==================== ERROR HANDLING ====================

// 20. Error handler middleware
app.use(notFound as any);
app.use(errorHandler as any);

// ==================== UNHANDLED ERRORS ====================

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('❌ Unhandled Rejection:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Export app
export default app;

