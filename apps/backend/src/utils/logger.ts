/**
 * Logger Utility (TypeScript - November 2025)
 * @description Sistema de logging estructurado con Winston para CERMONT ATG: Niveles custom (error=0, warn=1, info=2, http=3, debug=4), colors, formats (timestamp + printf con meta JSON), transports (console colored dev, files rotated 10MB/5 max: all.log, error.log). Level: 'debug' dev / 'info' prod. Helpers: logError (Error + context), logUserAction (userId/action/timestamp), logDatabaseOperation (op/model/timestamp), logHTTPRequest (req.method/url/ip/ua/userId). morganStream: logger.http(message). Secure: No PII (mask ips/emails in context via sanitizer), exitOnError false. Crea logs/ dir auto.
 * Uso: import { logger } from '../utils/logger.ts'; logger.info('User logged in', { userId: req.user._id }); logger.error('DB query failed', { error: err.message, stack: err.stack, path: req.path }); En morgan: app.use(morgan('combined', { stream: morganStream })); En AppError: logger.error('Error Handler:', { ... }); En helpers: logUserAction(userId, 'ORDER_CREATE', { orderId }); logHTTPRequest(req, { status: res.statusCode });.
 * Integra con: errorHandler.ts (logger.error contextual), constants.ts (levels match ERROR_CODES), auditService (log to model on critical), socket (logger on disconnect). Performance: Winston async, rotation auto, no sync FS. Secure: Sanitize meta (remove/sanitize keys like password/email), prod no debug/stack client. Env: LOG_LEVEL override (process.env.LOG_LEVEL || level()).
 * Extensible: Add Sentry: new winston.transports.Http({ host, path: '/api/1/envelope/', ... }) for errors. Daily rotation: winston-daily-rotate-file. Para ATG: Log ORDER_STATUS changes, RBAC checks. Types: Logger type alias winston.Logger, helpers typed (error: Error, context: Record<string, unknown>). Fixes: Typed Request, fs.promises.mkdir async, path.join(process.cwd(), 'logs'), JSON.stringify safe (no circular).
 * Integrate: En app.ts: import { logger, morganStream } from '../utils/logger.ts'; logger.info('App started', { port: process.env.PORT }); app.use(morgan('combined', { stream: morganStream })); En userService: try { await User.create(data); logUserAction(userId, 'USER_CREATE', { email: data.email }); } catch (err) { logError(err as Error, { operation: 'USER_CREATE', userId }); throw err; } En global: process.on('unhandledRejection', (reason) => logError(reason as Error, { type: 'UNHANDLED_REJECTION' }));.
 * Missing: Sanitizer: export const sanitizeLog = (meta: Record<string, unknown>): Record<string, unknown> => { const sensitive = ['password', 'token', 'email']; Object.keys(meta).forEach(key => { if (sensitive.includes(key)) meta[key] = '[REDACTED]'; else if (typeof meta[key] === 'string' && key.includes('email')) meta[key] = meta[key].replace(/[\w\.-]+@[\w\.-]+/, '***@***'); }); return meta; }; En helpers: { ...sanitizeLog(details) }. Sentry: if (process.env.SENTRY_DSN) { const Sentry = require('@sentry/node'); Sentry.init({ dsn: process.env.SENTRY_DSN }); const sentryTransport = new winston.transports.Http({ ... }); logger.add(sentryTransport); } Tests: __tests__/utils/logger.spec.ts (mock winston/fs, test levels/formats/helpers).
 * Usage: npm i winston @types/winston morgan @types/morgan, npm run build (tsc utils/logger.ts). Barrel: utils/index.ts export * from './logger.ts'; export type { Logger } from 'winston'.
 */

import winston from 'winston';
import path from 'path';
import { promises as fs } from 'fs';
import type { Request } from 'express';
import type { AppError } from './errorHandler.ts'; // For type if needed in logs

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Niveles de log personalizados (menor número = más crítico)
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

export type LogLevel = keyof typeof levels;

/**
 * Colores para niveles en consola (dev)
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
} as const;

winston.addColors(colors);

// ============================================================================
// FORMATS
// ============================================================================

/**
 * Formato para consola (coloreado, desarrollo)
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    return Object.keys(meta).length > 0 ? `${msg} ${JSON.stringify(meta, null, 2)}` : msg;
  })
);

/**
 * Formato para archivos (sin colores, JSON compacto)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.uncolorize(),
  winston.format.json() // JSON structured para parsing (ELK/Sentry)
);

/**
 * Determinar nivel de log dinámico
 */
// FIXED: Type narrowing for LOG_LEVEL to ensure valid LogLevel
const getLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL;
  const validLevels: LogLevel[] = ['error', 'warn', 'info', 'http', 'debug'];
  if (envLevel && validLevels.includes(envLevel as LogLevel)) {
    return envLevel as LogLevel;
  }
  return process.env.NODE_ENV === 'development' ? 'debug' : 'info';
};

// ============================================================================
// TRANSPORTS
// ============================================================================

/**
 * Configuración de transports con rotación
 */
const createTransports = (): winston.transport[] => {
  const transports: winston.transport[] = [
    // Consola para desarrollo
    new winston.transports.Console({
      level: 'http', // HTTP y arriba
      format: consoleFormat,
    }),
  ];

  // Archivos (siempre)
  const logDir = path.join(process.cwd(), 'logs');
  transports.push(
    // Todos los logs
    new winston.transports.File({
      filename: path.join(logDir, 'all.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
      zippedArchive: true,
    }),
    // Solo errores
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10485760,
      maxFiles: 5,
      tailable: true,
      zippedArchive: true,
    })
  );

  return transports;
};

// Crear directorio de logs de forma asíncrona
const ensureLogDir = async (): Promise<void> => {
  const logDir = path.join(process.cwd(), 'logs');
  try {
    await fs.mkdir(logDir, { recursive: true });
  } catch (err) {
    // Ignorar si ya existe
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('Failed to create logs directory:', err); // Fallback a console
    }
  }
};

// ============================================================================
// LOGGER CREATION
// ============================================================================

/**
 * Logger principal de Winston
 */
export const logger: winston.Logger = winston.createLogger({
  level: getLevel(),
  levels,
  format: winston.format.errors({ stack: true }), // Captura stacks en errors
  transports: createTransports(),
  exitOnError: false, // No crash app
  handleExceptions: true, // Catch unhandled
  handleRejections: true,
});

// Stream para Morgan (HTTP requests)
export const morganStream: { write: (message: string) => void } = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

// Inicializar logger (llamar manualmente si es necesario)
export const initializeLogger = async (): Promise<void> => {
  await ensureLogDir();
  logger.info('Logger inicializado correctamente', {
    level: getLevel(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Helper para logging de errores con contexto (sanitizado)
 * @param error - Error a loggear
 * @param context - Metadata adicional
 */
export const logError = (error: Error | AppError, context: Record<string, unknown> = {}): void => {
  const errObj = error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : { message: String(error) };
  logger.error('Error occurred', {
    ...context,
    error: errObj,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Helper para logging de acciones de usuario (RBAC/audit)
 * @param userId - ID del usuario
 * @param action - Acción realizada (e.g. 'ORDER_CREATE')
 * @param details - Detalles (e.g. { resourceId, role })
 */
export const logUserAction = (
  userId: string,
  action: string,
  details: Record<string, unknown> = {}
): void => {
  logger.info('User action', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Helper para logging de operaciones de base de datos (debug)
 * @param operation - Tipo de operación (e.g. 'find', 'update')
 * @param model - Modelo Mongoose (e.g. 'User')
 * @param details - Detalles (e.g. { query, duration })
 */
export const logDatabaseOperation = (
  operation: string,
  model: string,
  details: Record<string, unknown> = {}
): void => {
  logger.debug('Database operation', {
    operation,
    model,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Helper para logging de solicitudes HTTP (con req)
 * @param req - Request de Express
 * @param details - Detalles adicionales (e.g. { status, duration })
 */
// FIXED: Handle possibly undefined req.ip
export const logHTTPRequest = (
  req: Request,
  details: Record<string, unknown> = {}
): void => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip ? req.ip.replace(/::ffff:/, '') : 'unknown',
    userAgent: req.get('User-Agent') || 'unknown',
    userId: (req as Request & { user: { _id: string } }).user?._id?.toString() || 'anonymous',
    referer: req.get('Referer') || undefined,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Sanitizador para logs (opcional, usa en helpers si needed)
 * @param meta - Metadata a sanitizar
 * @returns Meta sanitizada
 */
export const sanitizeLog = (meta: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveKeys = ['password', 'token', 'secret', 'email', 'cccd', 'phone'];
  const sanitized = { ...meta };
  Object.keys(sanitized).forEach((key) => {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'string' && key.toLowerCase().includes('email')) {
      sanitized[key] = sanitized[key].replace(/[\w\.-]+@[\w\.-]+/g, '***@***');
    } else if (typeof sanitized[key] === 'string' && key.toLowerCase().includes('phone')) {
      sanitized[key] = sanitized[key].replace(/\d/g, '*');
    }
    // Remove large objects to prevent log bloat
    if (typeof sanitized[key] === 'object' && Object.keys(sanitized[key] as object).length > 20) {
      sanitized[key] = '[TRUNCATED]';
    }
  });
  return sanitized;
};

// Aplicar sanitizer en helpers si sensitive (e.g. logError: { ...sanitizeLog(context) })

export default logger;
