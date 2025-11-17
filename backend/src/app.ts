/**
 * Configuración de la aplicación Express
 *
 * @file backend/src/app.ts
 */

import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './infra/http/routes';
import { errorHandler } from './shared/middlewares/errorHandler';
import { notFound } from './shared/middlewares/notFound';
import { auditMiddleware } from './shared/middlewares/auditMiddleware';
import { metricsMiddleware } from './shared/middlewares/metricsMiddleware';
import { adaptiveRateLimit } from './shared/middlewares/adaptiveRateLimit';
import { logger } from './shared/utils/logger';

/**
 * Crea y configura la aplicación Express
 */
export function createApp(): Express {
  const app = express();

  // Configuración de seguridad
  // Configuración de seguridad mejorada para producción
  const isProduction = process.env.NODE_ENV === 'production';
  
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
      reportOnly: !isProduction, // Solo warnings en desarrollo
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

  // CORS mejorado - acepta múltiples orígenes
  const allowedOrigins: (string | RegExp)[] = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

  // En desarrollo, aceptar más orígenes (tuneles, etc)
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000');
    allowedOrigins.push('http://127.0.0.1:3000');
    // Aceptar cualquier tunnel de devtunnels (dev tunnels de VS Code)
    allowedOrigins.push(/\.devtunnels\.ms$/);
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Verificar si el origen está permitido
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return origin === allowedOrigin;
      });

      if (isAllowed || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`CORS no permitido para origen: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 horas
  }));

  // Rate limiting adaptativo
  app.use(adaptiveRateLimit());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging HTTP
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));
  }

  // Métricas
  app.use(metricsMiddleware);

  // Auditoría
  app.use(auditMiddleware());

  // Rutas
  app.use('/api', routes);

  // Manejadores de errores
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Exportar la función para compatibilidad
export default createApp;
