import { z } from 'zod';

const envSchema = z.object({
  production: z.boolean(),
  apiUrl: z.string().url(),
  wsUrl: z.string().url(),
  appName: z.string().default('Cermont'),
  version: z.string().default('1.0.0'),
  enableDebug: z.boolean().default(false),
  features: z.object({
    weatherModule: z.boolean().default(false),
    offlineMode: z.boolean().default(false),
    analytics: z.boolean().default(false),
  }),
  cache: z.object({
    ttl: z.number().int().positive().default(300000),
    maxSize: z.number().int().positive().default(100),
  }),
  pagination: z.object({
    defaultPageSize: z.number().int().positive().default(10),
    maxPageSize: z.number().int().positive().default(100),
  }),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(env: any): Environment {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error('❌ Configuración de entorno inválida:', result.error.format());
    throw new Error('Configuración de entorno inválida');
  }
  return result.data;
}
