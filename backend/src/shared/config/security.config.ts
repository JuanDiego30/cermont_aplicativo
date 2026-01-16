/**
 * @config SecurityConfig
 *
 * Configuración centralizada de seguridad para la aplicación.
 *
 * Basado en mejores prácticas:
 * - OWASP Top 10
 * - NIST Guidelines
 * - CIS Benchmarks
 */

/**
 * Configuración de cookies de sesión
 */
const refreshTokenDays = Number.parseInt(
  (process.env.JWT_REFRESH_EXPIRES_IN || '7d').replace('d', ''),
  10
);

const refreshTokenMaxAgeMs = refreshTokenDays * 24 * 60 * 60 * 1000;

export const COOKIE_CONFIG = {
  REFRESH_TOKEN: {
    name: 'refreshToken',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: refreshTokenMaxAgeMs,
      path: '/',
    },
  },
} as const;

/**
 * Configuración de tokens JWT
 */
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_DAYS: refreshTokenDays,
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS) || 12,
} as const;

/**
 * Configuración de rate limiting
 */
export const RATE_LIMIT_CONFIG = {
  // Límites globales
  GLOBAL: {
    SHORT: { ttl: 10000, limit: 20 }, // 10s - burst
    MEDIUM: { ttl: 60000, limit: 100 }, // 1min
    LONG: { ttl: 3600000, limit: 1000 }, // 1h
  },
  // Límites por tipo de endpoint
  AUTH: {
    LOGIN: { limit: 5, ttl: 60000 }, // 5 intentos/min
    REGISTER: { limit: 3, ttl: 60000 }, // 3 registros/min
    REFRESH: { limit: 10, ttl: 60000 }, // 10 refresh/min
  },
  UPLOAD: {
    limit: 10,
    ttl: 60000, // 10 archivos/min
  },
} as const;

/**
 * Headers de seguridad HTTP (Helmet config)
 */
export const SECURITY_HEADERS = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
} as const;

/**
 * Configuración de CORS
 */
export const CORS_CONFIG = {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id'],
  exposedHeaders: ['x-request-id'],
  credentials: true,
} as const;

/**
 * Roles del sistema (para RBAC)
 */
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  ADMINISTRATIVO = 'administrativo',
}

/**
 * Permisos por rol (Least Privilege Principle)
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['*'], // Acceso total
  [UserRole.SUPERVISOR]: [
    'orders:read',
    'orders:write',
    'usuarios:read',
    'reports:read',
    'reports:write',
    'dashboard:read',
  ],
  [UserRole.TECNICO]: ['orders:read', 'orders:write:own', 'evidence:write', 'ejecucion:write:own'],
  [UserRole.ADMINISTRATIVO]: ['orders:read', 'reports:read', 'costos:read', 'costos:write'],
} as const;
