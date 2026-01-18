import { z } from 'zod';

/**
 * Schema de validación para variables de entorno del backend
 *
 * Valida todas las variables requeridas al inicio de la aplicación.
 * Si alguna variable falta o es inválida, la aplicación fallará con un mensaje claro.
 *
 * @example
 * ```typescript
 * const env = validateEnv();
 * console.log(env.PORT); // number
 * ```
 */
const envSchema = z.object({
  // Aplicación
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3000'),

  // Base de datos
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // 2FA (opcional)
  TOTP_ISSUER: z.string().default('CERMONT'),

  // CORS (opcional)
  ALLOWED_ORIGINS: z
    .string()
    .transform(str => str.split(','))
    .optional(),

  // Email (opcional en desarrollo)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

export type Environment = z.infer<typeof envSchema>;

/**
 * Valida y parsea las variables de entorno
 *
 * @returns Variables de entorno validadas y tipadas
 * @throws Error con mensaje detallado si la validación falla
 */
export function validateEnv(): Environment {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');

    console.error(`
╔════════════════════════════════════════════════════════════════╗
║                 ❌ ENVIRONMENT VALIDATION FAILED                ║
╚════════════════════════════════════════════════════════════════╝

The following environment variables are missing or invalid:

${errorMessages}

Please check your .env file and ensure all required variables are set.
See .env.example for reference.
`);

    throw new Error('Environment validation failed');
  }

  return result.data;
}

/**
 * Instancia singleton del environment validado
 * Lazy-loaded para evitar errores en tiempo de importación
 */
let cachedEnv: Environment | null = null;

/**
 * Obtiene el environment validado (cached)
 */
export function getEnv(): Environment {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
