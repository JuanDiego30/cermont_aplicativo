/**
 * Constants
 * @description Constantes globales de la aplicación
 */

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
};

/**
 * Jerarquía de roles (para comparación de permisos)
 */
export const ROLE_HIERARCHY = {
  root: 100,
  admin: 90,
  coordinator_hes: 80,
  engineer: 70,
  supervisor: 60,
  technician: 50,
  accountant: 40,
  client: 10,
};

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
};

/**
 * Estados de planes de trabajo
 */
export const WORKPLAN_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

/**
 * Tipos de evidencia
 */
export const EVIDENCE_TYPES = {
  BEFORE: 'antes',
  DURING: 'durante',
  AFTER: 'despues',
};

/**
 * Prioridades de órdenes
 */
export const ORDER_PRIORITY = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
  URGENT: 'urgente',
};

/**
 * Unidades de negocio
 */
export const BUSINESS_UNITS = {
  IT: 'IT',
  MNT: 'MNT',
  SC: 'SC',
  GEN: 'GEN',
  OTHERS: 'Otros',
};

/**
 * Tipos de archivos permitidos
 */
export const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ALL: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

/**
 * Tamaños máximos de archivos (en bytes)
 */
export const MAX_FILE_SIZE = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  DOCUMENT: 20 * 1024 * 1024, // 20 MB
  DEFAULT: 15 * 1024 * 1024, // 15 MB
};

/**
 * Categorías de kits de herramientas
 */
export const TOOLKIT_CATEGORIES = {
  ELECTRICAL: 'electrico',
  TELECOM: 'telecomunicaciones',
  CCTV: 'CCTV',
  INSTRUMENTATION: 'instrumentacion',
  GENERAL: 'general',
};

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
};

/**
 * Configuración de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * Duraciones de tokens JWT
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_PASSWORD: '1h',
};

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
};

/**
 * Mensajes de error comunes
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
};

/**
 * Patrones de regex comunes
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s-()]{7,20}$/,
  CEDULA: /^[0-9]{6,12}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};

/**
 * Formatos de fecha
 */
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
};

/**
 * Configuración de caché
 */
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  DAY: 86400, // 24 horas
};


// ============================================================================
// HTTP STATUS CODES
// ============================================================================
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
  SERVICE_UNAVAILABLE: 503
};

/**
 * Límites de rate limiting
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
};

// ============================================================================
// Alias de compatibilidad: HTTPSTATUS
// Algunas partes del código pueden importar { HTTPSTATUS } en lugar de { HTTP_STATUS }.
// Se expone un alias mínimo con los códigos estándar requeridos por auth.js y otros módulos.
// ============================================================================
export const HTTPSTATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
