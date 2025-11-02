/**
 * Logger Utility
 * @description Sistema de logging con Winston para producción
 */

import winston from 'winston';
import path from 'path';
// fileURLToPath not required here

// __filename / __dirname not required here; using process.cwd() for paths

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Definir colores para cada nivel
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Formato personalizado para logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.uncolorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    
    return msg;
  })
);

// Determinar nivel de log según entorno
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Transports (destinos de logs)
const transports = [
  // Consola para desarrollo
  new winston.transports.Console({
    format,
  }),
  
  // Archivo para todos los logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'all.log'),
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
  
  // Archivo solo para errores
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
];

// Crear logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // No salir en errores no capturados
  exitOnError: false,
});

// Stream para Morgan (logging HTTP)
export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Helper para logging de errores con contexto
 */
export const logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

/**
 * Helper para logging de acciones de usuario
 */
export const logUserAction = (userId, action, details = {}) => {
  logger.info('User action', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Helper para logging de operaciones de base de datos
 */
export const logDatabaseOperation = (operation, model, details = {}) => {
  logger.debug('Database operation', {
    operation,
    model,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Helper para logging de solicitudes HTTP importantes
 */
export const logHTTPRequest = (req, details = {}) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.userId,
    ...details,
  });
};

// Crear directorio de logs si no existe
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log de inicio
logger.info('Logger inicializado correctamente', {
  level: level(),
  environment: process.env.NODE_ENV || 'development',
});

export default logger;


