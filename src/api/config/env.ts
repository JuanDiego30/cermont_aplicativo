import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

const candidatePaths = [
  process.env.API_ENV_FILE,
  process.env.BACKEND_ENV_FILE,
  path.resolve(process.cwd(), 'src/api/.env'),
  path.resolve(process.cwd(), '.env'),
].filter((p): p is string => Boolean(p));

for (const filePath of [...new Set(candidatePaths)]) {
  if (fs.existsSync(filePath)) {
    loadEnv({ path: filePath });
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatorio'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es obligatorio'),
  FRONTEND_ORIGIN: z.string().min(1, 'FRONTEND_ORIGIN es obligatorio'),
  STORAGE_DIR: z.string().min(1, 'STORAGE_DIR es obligatorio'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info')
    .optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuración inválida de variables de entorno:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

const storageDir = path.isAbsolute(raw.STORAGE_DIR)
  ? raw.STORAGE_DIR
  : path.resolve(process.cwd(), raw.STORAGE_DIR);

const frontendOrigins = raw.FRONTEND_ORIGIN.split(',')
  .map((entry) => entry.trim())
  .filter((entry) => entry.length > 0);

if (frontendOrigins.length === 0 || frontendOrigins.includes('*')) {
  console.error('❌ FRONTEND_ORIGIN debe contener al menos un origen válido y no puede usar "*".');
  process.exit(1);
}

export const env = {
  nodeEnv: raw.NODE_ENV,
  port: raw.PORT,
  databaseUrl: raw.DATABASE_URL,
  jwtSecret: raw.JWT_SECRET,
  frontendOrigins,
  storageDir,
  logLevel: raw.LOG_LEVEL ?? 'info',
} as const;

export type Env = typeof env;
