/**
 * @file env.validation.ts
 * @description Validación estricta de variables de entorno usando Zod.
 *
 * Uso: Llamar `validateEnv()` al inicio de la aplicación (main.ts).
 * Si las variables son inválidas, la aplicación termina con error.
 */
import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

/**
 * Esquema de validación para variables de entorno.
 * Define todas las variables requeridas y opcionales con sus tipos y restricciones.
 */
const envSchema = z.object({
    // Entorno de ejecución
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Servidor
    PORT: z.coerce.number().min(1).max(65535).default(4000),

    // Base de datos (obligatorio)
    DATABASE_URL: z.string().url().min(1, 'DATABASE_URL es requerido'),

    // JWT (obligatorio, mínimo 32 caracteres para seguridad)
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Frontend URL (para CORS)
    FRONTEND_URL: z.string().url().optional(),

    // Google OAuth (opcional)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().url().optional(),

    // Email (opcional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().min(1).max(65535).optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno al inicio de la aplicación.
 * @returns Objeto tipado con las variables de entorno validadas.
 * @throws Error si las variables son inválidas (termina el proceso).
 */
export function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        logger.error('❌ Variables de entorno inválidas:');
        const formatted = parsed.error.format();
        logger.error(JSON.stringify(formatted, null, 2));
        process.exit(1);
    }

    logger.log('✅ Variables de entorno validadas correctamente');
    return parsed.data;
}
