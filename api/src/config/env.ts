import { z } from 'zod';

// Esquema de validación para variables de entorno
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_URL: z.string().url().default('http://localhost:3001'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL válida'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('15m'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(14).default(12),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Uploads
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(10 * 1024 * 1024), // 10MB

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

type Env = z.infer<typeof envSchema>;

// Cargar y validar variables de entorno
function loadEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`);
      console.error('❌ Environment validation failed:');
      missingVars.forEach((v: string) => console.error(`   - ${v}`));

      if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
      }
    }
    throw error;
  }
}

// Export singleton config
export const env = loadEnv();

// Export individual values for convenience
export const {
  NODE_ENV,
  PORT,
  API_URL,
  DATABASE_URL,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_ROUNDS,
  FRONTEND_URL,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  LOG_LEVEL,
} = env;

export default env;
