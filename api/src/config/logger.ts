/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * LOGGER CONFIGURATION - WINSTON
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Configura Winston como logger centralizado para toda la aplicación.
 * Diferencia entre development (con logs en console) y production (solo archivos).
 * Proporciona métodos convenientes para logging (logInfo, logError, logWarn, logDebug).
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✓ Logs en archivos separados: error.log y combined.log
 * ✓ Rotación automática (5MB máximo, 5 archivos)
 * ✓ Formato JSON para fácil parseo en logs agregados (ELK, Splunk)
 * ✓ Formato coloreado en console para legibilidad en desarrollo
 * ✓ Metadata automática (timestamp, service)
 * ✓ Stack traces de errores
 * ✓ Métodos de conveniencia tipados
 * 
 * NIVELES DE LOG (por orden de severidad):
 * 1. error: Errores críticos que requieren atención
 * 2. warn: Advertencias sobre comportamiento inusual
 * 3. info: Eventos normales importantes (startup, requests)
 * 4. debug: Información detallada para debugging
 * 
 * ARCHIVOS DE SALIDA:
 * - logs/error.log: Solo errores (más pequeño, fácil de revisar)
 * - logs/combined.log: Todos los logs (completo para auditoría)
 * 
 * FLUJO:
 * 1. Crea instancia de Winston con transportes
 * 2. En development: Agrega console transport con colores
 * 3. En production: Solo archivos (mejor performance)
 * 4. Proporciona métodos de conveniencia reutilizables
 * 
 * EJEMPLO DE SALIDA:
 * ```
 * Development (console):
 *   14:23:45 [info]: User logged in { userId: "123", email: "user@example.com" }
 * 
 * Production (file):
 *   {
 *     "level": "error",
 *     "message": "Database connection failed",
 *     "timestamp": "2025-12-08T14:23:45.123Z",
 *     "service": "cermont-api",
 *     "error": "ECONNREFUSED",
 *     "stack": "Error: connect ECONNREFUSED..."
 *   }
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import winston from 'winston';

// ─────────────────────────────────────────────────────────────────────────────
// DESESTRUCTURACIÓN DE FORMATOS
// ─────────────────────────────────────────────────────────────────────────────

const { combine, timestamp, json, colorize, printf } = winston.format;

// ─────────────────────────────────────────────────────────────────────────────
// FORMATO PERSONALIZADO PARA CONSOLE
// ─────────────────────────────────────────────────────────────────────────────

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Agregar metadata si existe
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata, null, 0)}`; // ✓ MEJORADO: Sin indentación para console
  }

  return msg;
});

// ─────────────────────────────────────────────────────────────────────────────
// CREAR INSTANCIA DE LOGGER
// ─────────────────────────────────────────────────────────────────────────────


export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // ✓ Formato readable
    json() // Formato JSON para parsing
  ),
  defaultMeta: {
    service: 'cermont-api',
    environment: process.env.NODE_ENV, // ✓ MEJORADO: Agregar environment
  },
  transports: [
    // ─ Error logs en archivo separado (fácil revisar problemas)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Total: 25MB
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
    }),

    // ─ Todos los logs en archivo combinado (auditoría completa)
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Total: 25MB
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
    }),

    // ✓ MEJORADO: Agregar transport para logs de aplicación específicos
    new winston.transports.File({
      filename: 'logs/application.log',
      level: 'info',
      maxsize: 5242880,
      maxFiles: 5,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        json()
      ),
    }),
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// AGREGAR CONSOLE TRANSPORT EN DESARROLLO
// ─────────────────────────────────────────────────────────────────────────────


if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize(), // Colorear por nivel
        timestamp({ format: 'HH:mm:ss' }), // Timestamp corto
        consoleFormat // Formato personalizado
      ),
    })
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MÉTODOS DE CONVENIENCIA
// ─────────────────────────────────────────────────────────────────────────────


export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta || {});
};


export const logError = (message: string, error?: Error | object) => {
  if (error instanceof Error) {
    logger.error(message, {
      error: error.message,
      stack: error.stack,
      // ✓ MEJORADO: Agregar más detalles
      name: error.name,
      cause: error.cause,
    });
  } else {
    logger.error(message, error || {});
  }
};


export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta || {});
};


export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta || {});
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT DEFAULT
// ─────────────────────────────────────────────────────────────────────────────


export default logger;

