/**
 * Express Application Configuration (Optimized - October 2025)
 * @description Configuración con rate limiting, sanitización y seguridad avanzada
 */

import express from 'express';
import httpsRedirect from './middleware/httpsRedirect.js';
import { advancedSecurityHeaders, permissionsPolicy } from './config/securityHeaders.js';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import path from 'path';
import { morganStream, logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import routes from './routes/index.js';

// Swagger/OpenAPI
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

// Rate limiting
import { 
  blacklistMiddleware, 
  apiRateLimiter 
} from './middleware/rateLimiter.js';

// NUEVO: Sanitización
import {
  mongoSanitization,
  xssClean,
  sanitizeAll,
  detectThreats,
} from './middleware/sanitize.js';

// Crear aplicación Express
const app = express();

// ====================
// MIDDLEWARES DE SEGURIDAD (ORDEN CRÍTICO)
// ====================


// ========================================
// SECURITY HEADERS AVANZADOS
// ========================================
// Redirección HTTPS (solo en producción)
app.use(httpsRedirect);
// Headers de seguridad avanzados
app.use(advancedSecurityHeaders());
app.use(permissionsPolicy);

/**
 * 2. CORS: Control de orígenes permitidos
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    // Permitir requests sin origin (Postman, mobile apps, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // En lugar de lanzar error, indicar que no está permitido (no añadir headers)
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 horas
};

app.use(cors(corsOptions));

/**
 * 3. Blacklist middleware (bloquear IPs bloqueadas)
 */
app.use(blacklistMiddleware);

// ====================
// MIDDLEWARES DE PARSEO
// ====================

/**
 * 4. Body parser: JSON y URL-encoded
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// COMPRESSION MIDDLEWARE
// ========================================

// Configuración de compresión gzip/brotli
app.use(compression({
  // Nivel de compresión (0-9, 6 es balance entre velocidad y ratio)
  level: 6,
  
  // Umbral mínimo para comprimir (1KB)
  threshold: 1024,
  
  // Filtrar qué respuestas comprimir
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Usar filtro por defecto de compression
    return compression.filter(req, res);
  },
  
  // Comprimir solo estos content-types
  // (por defecto compression ya filtra text/*, json, etc.)
}));

logger.info('✅ Compression middleware habilitado');

/**
 * 5. Cookie parser: Gestión de cookies
 */
app.use(cookieParser());

// ====================
// SANITIZACIÓN (NUEVO - ORDEN CRÍTICO)
// ====================

/**
 * 6. MongoDB Sanitization (prevenir NoSQL injection)
 * Reemplaza operadores MongoDB ($, .) en keys
 */
app.use(mongoSanitization);

/**
 * 7. XSS Clean (limpiar HTML/Scripts maliciosos)
 * Limpia req.body, req.query, req.params
 */
app.use(xssClean);

/**
 * 8. Sanitización completa de inputs
 * Sanitiza body, query y params recursivamente
 */
app.use(sanitizeAll());

/**
 * 9. Detección de amenazas (logging de patrones peligrosos)
 * Solo registra, no bloquea
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(detectThreats);
}

// ====================
// LOGGING
// ====================

/**
 * 10. Morgan: Logging de peticiones HTTP
 */
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// ====================
// ARCHIVOS ESTÁTICOS
// ====================

/**
 * Servir archivos estáticos de uploads (solo autenticados)
 */
import { authenticate } from './middleware/auth.js';
const uploadsPath = path.join(process.cwd(), process.env.STORAGE_DIR || 'uploads');
app.use('/uploads', authenticate, express.static(uploadsPath));

/**
 * Servir archivos estáticos públicos
 */
const publicPath = path.join(process.cwd(), 'public');
app.use('/public', express.static(publicPath));

// ====================
// HEALTH CHECK (sin rate limit ni sanitización)
// ====================

/**
 * Endpoint de health check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
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

/**
 * Endpoint raíz
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CERMONT ATG API',
    version: '1.0.0',
    documentation: '/api/v1',
    status: 'operational',
  });
});

// ====================
// RATE LIMITING
// ====================

/**
 * Aplicar rate limiter a todas las rutas /api/
 * 100 requests por 15 minutos por IP
 */
app.use('/api/', apiRateLimiter);

// ====================
// RUTAS DE LA API
// ====================

/**
 * Montar todas las rutas bajo /api/v1
 */
app.use('/api/v1', routes);

// ====================
// MANEJO DE ERRORES
// ====================

/**
 * 404 - Ruta no encontrada
 */
app.use(notFound);

/**
 * Error handler global
 */
app.use(errorHandler);

// ====================
// MANEJO DE ERRORES NO CAPTURADOS
// ====================

/**
 * Capturar errores no manejados en promesas
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Capturar excepciones no capturadas
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Manejo de señales de terminación
 */
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor gracefully...');
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT recibido. Cerrando servidor gracefully...');
  process.exit(0);
});

export default app;
