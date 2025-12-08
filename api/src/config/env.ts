/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ENVIRONMENT VARIABLES VALIDATION & CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PROPÓSITO:
 * Valida y carga todas las variables de entorno al iniciar la aplicación usando
 * Zod schema validation. Previene errores en runtime y garantiza tipado fuerte.
 * 
 * CARACTERÍSTICAS PRINCIPALES:
 * ✓ Validación estricta con Zod (type-safe)
 * ✓ Valores por defecto inteligentes
 * ✓ Mensajes de error descriptivos
 * ✓ Falla rápido (fast-fail) en development si faltan variables críticas
 * ✓ Singleton pattern para acceso global
 * ✓ Exports individuales para conveniencia
 * 
 * VALIDACIONES:
 * - NODE_ENV: development | production | test
 * - JWT_SECRET: Mínimo 32 caracteres (seguridad criptográfica)
 * - DATABASE_URL: URL válida de PostgreSQL
 * - BCRYPT_ROUNDS: Entre 10-14 para balance seguridad/performance
 * - MAX_FILE_SIZE: Máximo tamaño de uploads (10MB default)
 * 
 * FLUJO:
 * 1. En import: Ejecuta loadEnv()
 * 2. Parsea process.env con schema de Zod
 * 3. Si hay errores: Lista todas las variables inválidas
 * 4. En test mode: permite fallos para tests unitarios
 * 5. En otros modos: falla y cierra aplicación
 * 
 * EJEMPLO .ENV:
 * ```
 * NODE_ENV=production
 * PORT=3001
 * DATABASE_URL=postgresql://user:pass@localhost:5432/cermont
 * JWT_SECRET=your-secret-key-minimum-32-characters-long-secure
 * FRONTEND_URL=https://app.cermont.com
 * ```
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMA DE VALIDACIÓN CON ZOD
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Define la estructura esperada y validaciones para todas las variables de entorno
 * 
 * TIPOS DE VALIDACIÓN:
 * - z.enum(): Lista cerrada de valores permitidos
 * - z.string().url(): Valida formato URL
 * - z.string().min(): Longitud mínima de string
 * - z.coerce.number(): Convierte string a número
 * - .default(): Valor por defecto si no está definido
 */
const envSchema = z.object({
  // ─ SERVER
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001), // ✓ MEJORADO: Validar rango puerto
  API_URL: z.string().url().default('http://localhost:3001'),

  // ─ DATABASE
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida de PostgreSQL'),

  // ─ JWT (JSON Web Tokens)
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres (recomendado 64)'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'), // ✓ MEJORADO: Agregar refresh token expiry

  // ─ SECURITY (Encriptación)
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),

  // ─ FRONTEND
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // ─ FILE UPLOADS
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(10 * 1024 * 1024), // 10MB

  // ─ EXTERNAL SERVICES
  OPENWEATHER_API_KEY: z.string().optional(), // ✓ MEJORADO: Agregar variables externas
  OPENAI_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),

  // ─ LOGGING
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // ─ CORS (Seguridad)
  CORS_ORIGIN: z.string().default('http://localhost:3000'), // ✓ MEJORADO: Configurable
});

// Inferir tipo TypeScript del schema
type Env = z.infer<typeof envSchema>;


function loadEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    // ✓ MEJORADO: Validación adicional de seguridad
    if (env.NODE_ENV === 'production' && !env.SENTRY_DSN) {
      console.warn('⚠️  WARNING: SENTRY_DSN not configured for production error tracking');
    }

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(
        (e: z.ZodIssue): string =>
          `${e.path.join('.')}: ${e.message}` // ✓ MEJORADO: Mejor formato
      );

      console.error('❌ Environment validation failed:');
      missingVars.forEach((v: string) => console.error(`   - ${v}`));

      // ✓ MEJORADO: Mostrar ejemplo de .env.example
      console.error('\n📋 Please check your .env file against .env.example\n');

      // Detener aplicación excepto en tests
      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT SINGLETON CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const env = loadEnv();

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS INDIVIDUALES (para conveniencia)
// ─────────────────────────────────────────────────────────────────────────────

export const {
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
} = env;

export default env;

