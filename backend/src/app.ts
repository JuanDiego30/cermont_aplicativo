/** 
 * Configuración de la aplicación Express
 *
 * @file backend/src/app.ts
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './infra/http/routes/index.js';
import { errorHandler } from './shared/middlewares/errorHandler.js';
import { notFound } from './shared/middlewares/notFound.js';
import { auditMiddleware } from './shared/middlewares/auditMiddleware.js';
import { metricsMiddleware } from './shared/middlewares/metricsMiddleware.js';
import { adaptiveRateLimit } from './shared/middlewares/adaptiveRateLimit.js';
import { logger } from './shared/utils/logger.js';
import { setupSwagger } from './infra/http/swagger.js';

// ==========================================
// Configuraciones Extraídas
// ==========================================

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

function configureSecurityHeaders(app: Express) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'http://localhost:5000', 'https://'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
      reportOnly: !isProduction,
    },
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: isProduction,
      preload: isProduction,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
  }));
}

function configureCors(app: Express) {
  const corsEnvOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
    : [];

  const allowedOrigins: (string | RegExp)[] = [
    ...corsEnvOrigins,
    process.env.FRONTEND_URL || 'http://localhost:3000',
  ];

  // Regex para redes locales
  const localNetworkOriginRegex = /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01]))(:\d+)?$/i;

  if (isDevelopment) {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://127.0.0.1:3000');
    allowedOrigins.push(/\.devtunnels\.ms$/);
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile, curl)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(allowed =>
        allowed instanceof RegExp ? allowed.test(origin) : origin === allowed
      );

      const isLocalNetwork = localNetworkOriginRegex.test(origin);

      if (isAllowed || isLocalNetwork || isDevelopment) {
        callback(null, true);
      } else {
        callback(new Error(`CORS no permitido para origen: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24h cache
  }));
}

function configureMiddleware(app: Express) {
  // Rate limiting general
  app.use(adaptiveRateLimit());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) },
    }));
  }

  // Custom middlewares
  app.use(metricsMiddleware);
  app.use(auditMiddleware());
}

// ==========================================
// Función Principal
// ==========================================

/**
 * Crea y configura la aplicación Express
 */
export function createApp(): Express {
  const app = express();

  // 1. Seguridad y Headers Base
  configureSecurityHeaders(app);
  configureCors(app);

  // 2. Middlewares Generales
  configureMiddleware(app);

  // 3. Swagger API Documentation (antes de rutas)
  setupSwagger(app);

  // 4. Rutas
  app.use('/api', routes);

  // 5. Manejo de Errores (Siempre al final)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;

