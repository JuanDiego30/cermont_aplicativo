/**
 * Global Constants - Constantes Globales del Sistema
 * @description Constantes centralizadas para CERMONT ATG
 * @version 1.0.0 - November 2025
 *
 * ✅ Single source of truth para todas las constantes
 * ✅ Evita duplicación y inconsistencias
 * ✅ Fácil mantenimiento y actualización
 */

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export const ROLES = [
  'root',
  'admin',
  'engineer',
  'supervisor',
  'technician',
] as const;

export const ROLE_HIERARCHY = {
  root: 5,
  admin: 4,
  engineer: 3,
  supervisor: 2,
  technician: 1,
} as const;

// ============================================================================
// PASSWORD CONFIGURATION
// ============================================================================

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SYMBOLS: true,
  SALT_ROUNDS: 12,
  RESET_TOKEN_EXPIRY: '15m', // 15 minutos
  CHANGE_TOKEN_EXPIRY: '24h', // 24 horas
} as const;

// ============================================================================
// JWT CONFIGURATION
// ============================================================================

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m', // 15 minutos
  REFRESH_TOKEN_EXPIRY: '7d', // 7 días
  ISSUER: 'cermont-atg-backend',
  AUDIENCE: 'cermont-atg-frontend',
  ALGORITHM: 'HS256',
} as const;

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const SECURITY_CONFIG = {
  BCRYPT_ROUNDS: 12,
  SESSION_TIMEOUT: '24h',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: '15m',
  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://cermont-atg.vercel.app',
  ],
  HELMET_CONFIG: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  },
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  ACCOUNT_DISABLED: 'AUTH_002',
  TOKEN_EXPIRED: 'AUTH_003',
  TOKEN_INVALID: 'AUTH_004',
  INSUFFICIENT_PERMISSIONS: 'AUTH_005',
  ACCOUNT_LOCKED: 'AUTH_006',

  // Validation
  VALIDATION_ERROR: 'VAL_001',
  REQUIRED_FIELD: 'VAL_002',
  INVALID_FORMAT: 'VAL_003',
  DUPLICATE_ENTRY: 'VAL_004',

  // Database
  DATABASE_ERROR: 'DB_001',
  CONNECTION_FAILED: 'DB_002',
  NOT_FOUND: 'DB_003',

  // Security
  RATE_LIMIT_EXCEEDED: 'SEC_001',
  SUSPICIOUS_ACTIVITY: 'SEC_002',

  // System
  INTERNAL_ERROR: 'SYS_001',
  SERVICE_UNAVAILABLE: 'SYS_002',
} as const;

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100, // requests por ventana
  STANDARD_LIMITS: {
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 intentos login por 15min
    API: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests API por 15min
    PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 resets por hora
  },
} as const;

// ============================================================================
// PUBLIC ROUTES (no requieren autenticación)
// ============================================================================

export const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/docs',
] as const;

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
  CEDULA: /^\d{8,10}$/,
  NAME: /^[a-zA-ZÀ-ÿ\s]{2,50}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// ============================================================================
// FILE UPLOAD CONFIG
// ============================================================================

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  UPLOAD_PATH: 'uploads/',
  MAX_FILES: 5,
} as const;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  TTL: 300,                    // 5 min
  CHECK_PERIOD: 60,            // 60 seg
  MAX_KEYS: 1000,
  ENABLED: process.env.CACHE_ENABLED !== 'false',
} as const;

export const CACHE_TTL = CACHE_CONFIG.TTL;
export const CACHE_CHECK_PERIOD = CACHE_CONFIG.CHECK_PERIOD;
export const CACHE_MAX_KEYS = CACHE_CONFIG.MAX_KEYS;
export const CACHE_ENABLED = CACHE_CONFIG.ENABLED;

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================

export const EMAIL_CONFIG = {
  ENABLED: process.env.EMAIL_ENABLED !== 'false',
  REPLY_TO: process.env.SMTP_REPLY_TO || 'noreply@cermont.com',
  TEMPLATES_DIR: './src/templates/emails',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
} as const;

export const EMAIL_ENABLED = EMAIL_CONFIG.ENABLED;
export const EMAIL_REPLY_TO = EMAIL_CONFIG.REPLY_TO;
export const EMAIL_TEMPLATES_DIR = EMAIL_CONFIG.TEMPLATES_DIR;
export const EMAIL_SUBJECTS = {
  WELCOME: 'Bienvenido a CERMONT ATG',
  PASSWORD_RESET: 'Recuperación de contraseña',
  PASSWORD_CHANGED: 'Contraseña actualizada',
  ORDER_ASSIGNED: 'Nueva orden asignada',
  WORKPLAN_APPROVED: 'Plan de trabajo aprobado',
  ORDER_STATUS_CHANGED: 'Estado de la orden actualizado',
} as const;

export const FRONTEND_URL = EMAIL_CONFIG.FRONTEND_URL;

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_NOTE_ADDED: 'order_note_added',
  WORKPLAN_APPROVED: 'workplan_approved',
  WORKPLAN_REJECTED: 'workplan_rejected',
  ACTIVITY_COMPLETED: 'activity_completed',
  SYSTEM_ALERT: 'system_alert',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// ============================================================================
// AUDIT LOG LEVELS
// ============================================================================

export const AUDIT_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;

export type AuditLevel = typeof AUDIT_LEVELS[keyof typeof AUDIT_LEVELS];

// ============================================================================
// LOGGING CONFIGURATION
// ============================================================================

export const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: 'json',
  MAX_SIZE: '20m',
  MAX_FILES: '14d',
  SILENT: process.env.NODE_ENV === 'test',
} as const;

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 30000, // 30 segundos
  QUERY_TIMEOUT: 15000, // 15 segundos
  MAX_POOL_SIZE: 10,
  MIN_POOL_SIZE: 2,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;