/**
 * Typed Configuration with Zod Validation
 *
 * This module provides type-safe configuration management using Zod schemas.
 * All environment variables are validated at application startup.
 */
import { z } from 'zod';

// ============ Database Configuration ============
const DatabaseConfigSchema = z.object({
  url: z.string().url().describe('PostgreSQL connection URL'),
  maxConnections: z.coerce.number().min(1).max(100).default(10),
  enableLogging: z.coerce.boolean().default(false),
});

// ============ JWT Configuration ============
const JwtConfigSchema = z.object({
  secret: z.string().min(32).describe('JWT secret key (min 32 chars)'),
  expiresIn: z.string().default('1h').describe('Access token expiration'),
  refreshExpiresIn: z.string().default('7d').describe('Refresh token expiration'),
});

// ============ Server Configuration ============
const ServerConfigSchema = z.object({
  port: z.coerce.number().min(1).max(65535).default(3000),
  host: z.string().default('0.0.0.0'),
  corsOrigins: z
    .string()
    .default('http://localhost:4200')
    .transform(val => val.split(',')),
  apiPrefix: z.string().default('api'),
  enableSwagger: z.coerce.boolean().default(true),
});

// ============ Storage Configuration ============
const StorageConfigSchema = z.object({
  type: z.enum(['local', 's3', 'gcs']).default('local'),
  basePath: z.string().default('./storage'),
  maxFileSize: z.coerce.number().default(10 * 1024 * 1024), // 10MB
  allowedMimeTypes: z
    .string()
    .default('image/jpeg,image/png,application/pdf')
    .transform(val => val.split(',')),
});

// ============ Redis Configuration (Optional) ============
const RedisConfigSchema = z
  .object({
    enabled: z.coerce.boolean().default(false),
    url: z.string().url().optional(),
    ttl: z.coerce.number().default(3600),
  })
  .refine(data => !data.enabled || data.url, {
    message: 'Redis URL is required when Redis is enabled',
  });

// ============ Email Configuration (Optional) ============
const EmailConfigSchema = z
  .object({
    enabled: z.coerce.boolean().default(false),
    host: z.string().optional(),
    port: z.coerce.number().optional(),
    user: z.string().optional(),
    password: z.string().optional(),
    from: z.string().email().optional(),
  })
  .refine(data => !data.enabled || (data.host && data.user), {
    message: 'Email host and user are required when email is enabled',
  });

// ============ Environment Type ============
const EnvironmentSchema = z.enum(['development', 'staging', 'production', 'test']);

// ============ Complete Application Config ============
export const AppConfigSchema = z.object({
  nodeEnv: EnvironmentSchema.default('development'),
  database: DatabaseConfigSchema,
  jwt: JwtConfigSchema,
  server: ServerConfigSchema,
  storage: StorageConfigSchema,
  redis: RedisConfigSchema,
  email: EmailConfigSchema,
});

// ============ Type Exports ============
export type AppConfig = z.infer<typeof AppConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type JwtConfig = z.infer<typeof JwtConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type EmailConfig = z.infer<typeof EmailConfigSchema>;
export type Environment = z.infer<typeof EnvironmentSchema>;

/**
 * Parse and validate environment configuration
 * Throws ZodError if validation fails
 */
export function parseConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return AppConfigSchema.parse({
    nodeEnv: env['NODE_ENV'],
    database: {
      url: env['DATABASE_URL'],
      maxConnections: env['DB_MAX_CONNECTIONS'],
      enableLogging: env['DB_LOGGING'],
    },
    jwt: {
      secret: env['JWT_SECRET'],
      expiresIn: env['JWT_EXPIRES_IN'],
      refreshExpiresIn: env['JWT_REFRESH_EXPIRES_IN'],
    },
    server: {
      port: env['PORT'],
      host: env['HOST'],
      corsOrigins: env['CORS_ORIGINS'],
      apiPrefix: env['API_PREFIX'],
      enableSwagger: env['ENABLE_SWAGGER'],
    },
    storage: {
      type: env['STORAGE_TYPE'],
      basePath: env['STORAGE_PATH'],
      maxFileSize: env['MAX_FILE_SIZE'],
      allowedMimeTypes: env['ALLOWED_MIME_TYPES'],
    },
    redis: {
      enabled: env['REDIS_ENABLED'],
      url: env['REDIS_URL'],
      ttl: env['REDIS_TTL'],
    },
    email: {
      enabled: env['EMAIL_ENABLED'],
      host: env['SMTP_HOST'],
      port: env['SMTP_PORT'],
      user: env['SMTP_USER'],
      password: env['SMTP_PASSWORD'],
      from: env['EMAIL_FROM'],
    },
  });
}

/**
 * Safe parse that returns validation result
 */
export function safeParseConfig(env: NodeJS.ProcessEnv = process.env) {
  return AppConfigSchema.safeParse({
    nodeEnv: env['NODE_ENV'],
    database: {
      url: env['DATABASE_URL'],
      maxConnections: env['DB_MAX_CONNECTIONS'],
      enableLogging: env['DB_LOGGING'],
    },
    jwt: {
      secret: env['JWT_SECRET'],
      expiresIn: env['JWT_EXPIRES_IN'],
      refreshExpiresIn: env['JWT_REFRESH_EXPIRES_IN'],
    },
    server: {
      port: env['PORT'],
      host: env['HOST'],
      corsOrigins: env['CORS_ORIGINS'],
      apiPrefix: env['API_PREFIX'],
      enableSwagger: env['ENABLE_SWAGGER'],
    },
    storage: {
      type: env['STORAGE_TYPE'],
      basePath: env['STORAGE_PATH'],
      maxFileSize: env['MAX_FILE_SIZE'],
      allowedMimeTypes: env['ALLOWED_MIME_TYPES'],
    },
    redis: {
      enabled: env['REDIS_ENABLED'],
      url: env['REDIS_URL'],
      ttl: env['REDIS_TTL'],
    },
    email: {
      enabled: env['EMAIL_ENABLED'],
      host: env['SMTP_HOST'],
      port: env['SMTP_PORT'],
      user: env['SMTP_USER'],
      password: env['SMTP_PASSWORD'],
      from: env['EMAIL_FROM'],
    },
  });
}
