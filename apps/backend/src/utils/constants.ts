/**
 * Constants (TypeScript - November 2025)
 * @description Constantes globales para CERMONT ATG: roles RBAC (hierarchy levels), ORDER_STATUS/WORKPLAN_STATUS/EVIDENCE_TYPES enums, priorities/business units, file types/sizes (ALLOWED_FILE_TYPES: jpeg/png/pdf..., MAX_FILE_SIZE: 10MB images), TOOLKIT_CATEGORIES, NOTIFICATION_TYPES, PAGINATION (default 1/10 max 100), TOKEN_EXPIRATION (15m access/7d refresh), ERROR_CODES/MESSAGES (VALIDATION_ERROR, UNAUTHORIZED), REGEX_PATTERNS (email/phone/cedula), DATE_FORMATS (ISO/Display), CACHE_DURATIONS (1min-24h), HTTP_STATUS (200-503), RATE_LIMITS (auth 5/15min, api 100/15min).
 * Uso: En models: rol: { type: String, enum: Object.values(ROLES) }, estado: { type: String, enum: Object.values(ORDER_STATUS) }; En Joi schemas: rol: Joi.string().valid(...Object.values(ROLES)), email: Joi.string().pattern(REGEX_PATTERNS.EMAIL); En rateLimiter: { windowMs: RATE_LIMITS.API.windowMs, max: RATE_LIMITS.API.max }; En jwt: expiresIn: TOKEN_EXPIRATION.ACCESS_TOKEN; En upload: fileFilter: (req, file, cb) => { if (!ALLOWED_FILE_TYPES.ALL.includes(file.mimetype)) cb(new AppError('Invalid type', 400)); if (file.size > MAX_FILE_SIZE.IMAGE) cb(new AppError('Too large', 413)); cb(null, true); }.
 * Integra con: Middleware (validation: enum checks, rateLimit: RATE_LIMITS, sanitization: REGEX), services (auth: role hierarchy check, order: status transitions), controllers (res.status(HTTP_STATUS.UNAUTHORIZED)), utils (date: moment(DATE_FORMATS.ISO), cache: node-cache TTL=CACHE_DURATIONS.MEDIUM). Performance: Const readonly no runtime overhead, as const literals. Secure: Enums prevent invalid states, file types whitelist OWASP A08, rate limits anti-DDoS.
 * Extensible: Add ENV constants (e.g. export const ENV = { JWT_SECRET: process.env.JWT_SECRET!, PORT: Number(process.env.PORT) || 3000 }), geo: { LAT_MIN: -90, LAT_MAX: 90 }, risk levels (LOW/MED/HIGH). Para ATG: CCTV specific (RESOLUTION: '1080p' | '4K'), SLA days { P1: 24h, P2: 72h }. Types: Readonly<{ ROOT: 'root'; ... }>, type Role = keyof typeof ROLES; type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS].
 * Fixes: As const para literal types, Object.freeze optional. Alias HTTPSTATUS minimal legacy. Regex: test() safe, no DoS (short patterns). Messages Spanish consistent. No mutations. Export individual si needed (e.g. import { ROLES, ORDER_STATUS } from '../utils/constants').
 * Integrate: En User model: rol: { type: String, enum: ROLES as readonly string[], default: ROLES.CLIENT, required: true }, virtual 'hierarchyLevel': { get() { return ROLE_HIERARCHY[this.rol as keyof typeof ROLE_HIERARCHY]; } }. En RBAC middleware: const requiredLevel = 50; if (req.user.hierarchyLevel < requiredLevel) throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN, { code: ERROR_CODES.AUTHORIZATION_ERROR }); En pagination: const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = req.query; if (Number(limit) > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT.
 * Missing: Validation helpers: export const validateRole = (rol: string): rol is Role => Object.values(ROLES).includes(rol); export const compareRoles = (userRole: Role, required: Role): boolean => (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[required] ?? 0); File size dynamic: export const getMaxSize = (type: keyof typeof ALLOWED_FILE_TYPES): number => { switch(type) { case 'IMAGES': return MAX_FILE_SIZE.IMAGE; ... } }; Env validation: import Joi from 'joi'; const envSchema = Joi.object({ JWT_SECRET: Joi.string().required(), ... }); const { error } = envSchema.validate(process.env); if (error) throw new Error('Env validation failed').
 * Usage: import { ROLES, HTTP_STATUS, ERROR_CODES } from '../utils/constants.ts'; npm run lint (check enums). Barrel: utils/index.ts export * from './constants.ts'.
 */

import type { AppError } from './errorHandler.ts'; // For type reference if needed

// ============================================================================
// ROLES AND HIERARCHY
// ============================================================================

/**
 * Roles de usuarios (jerárquico de mayor a menor)
 */
export const ROLES = {
  ROOT: 'root',
  ADMIN: 'admin',
  COORDINATOR_HES: 'coordinator_hes',
  ENGINEER: 'engineer',
  SUPERVISOR: 'supervisor',
  TECHNICIAN: 'technician',
  ACCOUNTANT: 'accountant',
  CLIENT: 'client',
} as const;

export type Role = keyof typeof ROLES;

/**
 * Jerarquía de roles (para comparación de permisos)
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  ROOT: 100,
  ADMIN: 90,
  COORDINATOR_HES: 80,
  ENGINEER: 70,
  SUPERVISOR: 60,
  TECHNICIAN: 50,
  ACCOUNTANT: 40,
  CLIENT: 10,
} as const;

// ============================================================================
// PASSWORD CONSTRAINTS
// ============================================================================

export const MIN_PASSWORD_LENGTH = 8;

// ============================================================================
// ORDER AND WORKPLAN STATES
// ============================================================================

/**
 * Estados de órdenes de trabajo
 */
export const ORDER_STATUS = {
  PENDING: 'pendiente',
  PLANNING: 'planificacion',
  IN_PROGRESS: 'en_progreso',
  COMPLETED: 'completada',
  INVOICING: 'facturacion',
  INVOICED: 'facturada',
  PAID: 'pagada',
  CANCELLED: 'cancelada',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

/**
 * Estados de planes de trabajo
 */
export const WORKPLAN_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export type WorkplanStatus = (typeof WORKPLAN_STATUS)[keyof typeof WORKPLAN_STATUS];

/**
 * Tipos de evidencia
 */
export const EVIDENCE_TYPES = {
  BEFORE: 'antes',
  DURING: 'durante',
  AFTER: 'despues',
} as const;

export type EvidenceType = (typeof EVIDENCE_TYPES)[keyof typeof EVIDENCE_TYPES];

/**
 * Prioridades de órdenes
 */
export const ORDER_PRIORITY = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
  URGENT: 'urgente',
} as const;

export type OrderPriority = (typeof ORDER_PRIORITY)[keyof typeof ORDER_PRIORITY];

/**
 * Unidades de negocio
 */
export const BUSINESS_UNITS = {
  IT: 'IT',
  MNT: 'MNT',
  SC: 'SC',
  GEN: 'GEN',
  OTHERS: 'Otros',
} as const;

export type BusinessUnit = (typeof BUSINESS_UNITS)[keyof typeof BUSINESS_UNITS];

// ============================================================================
// FILE AND UPLOAD CONSTANTS
// ============================================================================

/**
 * Tipos de archivos permitidos
 */
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;
const SPREADSHEET_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] as const;

export const ALLOWED_FILE_TYPES = {
  IMAGES: IMAGE_TYPES,
  DOCUMENTS: DOCUMENT_TYPES,
  SPREADSHEETS: SPREADSHEET_TYPES,
  ALL: [
    ...IMAGE_TYPES,
    ...DOCUMENT_TYPES,
    ...SPREADSHEET_TYPES,
  ] as const,
} as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES.ALL)[number];

/**
 * Tamaños máximos de archivos (en bytes)
 */
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  DOCUMENT: 20 * 1024 * 1024, // 20 MB
  DEFAULT: 15 * 1024 * 1024, // 15 MB
} as const;

export type MaxFileSizeKey = keyof typeof MAX_FILE_SIZE;

/**
 * Categorías de kits de herramientas
 */
export const TOOLKIT_CATEGORIES = {
  ELECTRICAL: 'electrico',
  TELECOM: 'telecomunicaciones',
  CCTV: 'CCTV',
  INSTRUMENTATION: 'instrumentacion',
  GENERAL: 'general',
} as const;

export type ToolkitCategory = (typeof TOOLKIT_CATEGORIES)[keyof typeof TOOLKIT_CATEGORIES];

// ============================================================================
// NOTIFICATIONS AND PAGINATION
// ============================================================================

/**
 * Tipos de notificación
 */
export const NOTIFICATION_TYPES = {
  ORDER_ASSIGNED: 'order_assigned',
  ORDER_STATUS_CHANGED: 'order_status_changed',
  ORDER_NOTE_ADDED: 'order_note_added',
  WORKPLAN_APPROVED: 'workplan_approved',
  WORKPLAN_REJECTED: 'workplan_rejected',
  REPORT_APPROVED: 'report_approved',
  DEADLINE_APPROACHING: 'deadline_approaching',
  USER_MENTIONED: 'user_mentioned',
  SYSTEM_ALERT: 'system_alert',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export type PaginationConfig = typeof PAGINATION;

// ============================================================================
// AUDIT AND SECURITY
// ============================================================================

/**
 * Severidades de auditoría
 */
export const AUDIT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type AuditSeverity = (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];

// ============================================================================
// TOKENS, ERRORS, AND REGEX
// ============================================================================

/**
 * Duraciones de tokens JWT
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_PASSWORD: '1h',
} as const;

export type TokenType = keyof typeof TOKEN_EXPIRATION;

/**
 * Razones para revocación de tokens
 */
export const TOKEN_REASONS = {
  INVALID_REFRESH: 'INVALID_REFRESH',
} as const;

export type TokenReason = (typeof TOKEN_REASONS)[keyof typeof TOKEN_REASONS];

/**
 * Configuración de email
 */
export const EMAIL_FROM = 'noreply@cermont.com';

/**
 * Códigos de error personalizados
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  RETRY_EXHAUSTED: 'RETRY_EXHAUSTED',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_CEDULA: 'DUPLICATE_CEDULA',
  INVALID_OBJECTID: 'INVALID_OBJECTID',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Mensajes de error comunes (Spanish)
 */
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Error de validación en los datos proporcionados',
  UNAUTHORIZED: 'No autorizado. Por favor, inicia sesión',
  FORBIDDEN: 'No tienes permisos para realizar esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
  DATABASE_ERROR: 'Error en la base de datos',
  INTERNAL_ERROR: 'Error interno del servidor',
  RATE_LIMIT: 'Demasiadas solicitudes. Por favor, intenta más tarde',
  SUCCESS: 'Operación realizada exitosamente',
  WEAK_PASSWORD: 'La contraseña es demasiado débil',
  CONFLICT: 'Conflicto con el estado actual del recurso',
  CREATED_SUCCESS: 'Recurso creado exitosamente',
  RATE_LIMIT_EXCEEDED: 'Límite de solicitudes excedido',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Patrones de regex comunes (no DoS-prone)
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s-()]{7,20}$/,
  CEDULA: /^[0-9]{6,12}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
} as const;

export type RegexPatternKey = keyof typeof REGEX_PATTERNS;

/**
 * Longitud mínima de contraseña
 */
export const PASSWORD_MIN_LENGTH = 8;

// ============================================================================
// DATE AND CACHE
// ============================================================================

/**
 * Formatos de fecha (para moment/dayjs)
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
} as const;

export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];

/**
 * Configuración de caché (TTL en segundos)
 */
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  DAY: 86400, // 24 horas
} as const;

export type CacheDuration = (typeof CACHE_DURATIONS)[keyof typeof CACHE_DURATIONS];

// ============================================================================
// HTTP STATUS AND RATE LIMITS
// ============================================================================

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

/**
 * Límites de rate limiting (para express-rate-limit)
 */
export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50, // 50 uploads
  },
  CREATE: {
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 50, // 50 creaciones
  },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/**
 * Configuración de cache
 */
export const CACHE_TTL = 300; // 5 minutes default
export const CACHE_CHECK_PERIOD = 60; // Check for expired keys every 60 seconds
export const CACHE_MAX_KEYS = 1000; // Maximum number of keys
export const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false'; // Default true

// ============================================================================
// Legacy Alias (for compatibility)
// ============================================================================

/**
 * Alias de compatibilidad: HTTPSTATUS (minimal for legacy auth.js etc.)
 */
export const HTTPSTATUS = {
  OK: HTTP_STATUS.OK,
  CREATED: HTTP_STATUS.CREATED,
  BAD_REQUEST: HTTP_STATUS.BAD_REQUEST,
  UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
  FORBIDDEN: HTTP_STATUS.FORBIDDEN,
  NOT_FOUND: HTTP_STATUS.NOT_FOUND,
  INTERNAL_SERVER_ERROR: HTTP_STATUS.INTERNAL_SERVER_ERROR,
} as const;
