/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CONFIGURATION BARREL EXPORT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Centraliza y expone todos los módulos de configuración en un único punto.
 * Simplifica los imports en toda la aplicación usando un patrón "barrel export".
 * 
 * VENTAJAS:
 * ✓ Imports más limpios y organizados
 * ✓ Fácil mantención centralizada
 * ✓ Reduce paths relativos profundos (../../..)
 * ✓ Encapsulación de detalles internos
 * 
 * PATRÓN BARREL:
 * En lugar de:
 *   import { prisma } from '../../../config/database';
 *   import { env } from '../../../config/env';
 *   import { logger } from '../../../config/logger';
 * 
 * Usar:
 *   import { prisma, env, logger } from '../config';
 * 
 * ESTRUCTURA:
 * - Database exports: prisma, connectDatabase, disconnectDatabase, checkDatabaseHealth
 * - Environment exports: env, NODE_ENV, PORT, DATABASE_URL, etc.
 * - Logger exports: logger, logInfo, logError, logWarn, logDebug
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Exports desde database.ts:
 * - prisma: Instancia global de PrismaClient (singleton)
 * - connectDatabase(): Conecta a la base de datos
 * - disconnectDatabase(): Desconecta de la base de datos
 * - checkDatabaseHealth(): Valida salud de la conexión
 * - runMigrations(): Ejecuta migraciones pendientes
 */
export {
  prisma,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
  runMigrations,
} from './database.js';

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export {
  env,
  NODE_ENV,
  PORT,
  API_URL,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  BCRYPT_ROUNDS,
  FRONTEND_URL,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  OPENWEATHER_API_KEY,
  OPENAI_API_KEY,
  SENTRY_DSN,
  LOG_LEVEL,
  CORS_ORIGIN,
} from './env.js';

// ─────────────────────────────────────────────────────────────────────────────
// LOGGER CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

export {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
} from './logger.js';



