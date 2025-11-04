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
export const ROLE_HIERARCHY = {
    ROOT: 100,
    ADMIN: 90,
    COORDINATOR_HES: 80,
    ENGINEER: 70,
    SUPERVISOR: 60,
    TECHNICIAN: 50,
    ACCOUNTANT: 40,
    CLIENT: 10,
};
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
export const WORKPLAN_STATUS = {
    DRAFT: 'draft',
    APPROVED: 'approved',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
};
export const EVIDENCE_TYPES = {
    BEFORE: 'antes',
    DURING: 'durante',
    AFTER: 'despues',
};
export const ORDER_PRIORITY = {
    LOW: 'baja',
    MEDIUM: 'media',
    HIGH: 'alta',
    URGENT: 'urgente',
};
export const BUSINESS_UNITS = {
    IT: 'IT',
    MNT: 'MNT',
    SC: 'SC',
    GEN: 'GEN',
    OTHERS: 'Otros',
};
const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const SPREADSHEET_TYPES = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
export const ALLOWED_FILE_TYPES = {
    IMAGES: IMAGE_TYPES,
    DOCUMENTS: DOCUMENT_TYPES,
    SPREADSHEETS: SPREADSHEET_TYPES,
    ALL: [
        ...IMAGE_TYPES,
        ...DOCUMENT_TYPES,
        ...SPREADSHEET_TYPES,
    ],
};
export const MAX_FILE_SIZE = {
    IMAGE: 10 * 1024 * 1024,
    DOCUMENT: 20 * 1024 * 1024,
    DEFAULT: 15 * 1024 * 1024,
};
export const TOOLKIT_CATEGORIES = {
    ELECTRICAL: 'electrico',
    TELECOM: 'telecomunicaciones',
    CCTV: 'CCTV',
    INSTRUMENTATION: 'instrumentacion',
    GENERAL: 'general',
};
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
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};
export const AUDIT_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
};
export const TOKEN_EXPIRATION = {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
    RESET_PASSWORD: '1h',
};
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
};
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
};
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[+]?[\d\s-()]{7,20}$/,
    CEDULA: /^[0-9]{6,12}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,
    URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
};
export const PASSWORD_MIN_LENGTH = 8;
export const DATE_FORMATS = {
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
};
export const CACHE_DURATIONS = {
    SHORT: 60,
    MEDIUM: 300,
    LONG: 3600,
    DAY: 86400,
};
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};
export const RATE_LIMITS = {
    AUTH: {
        windowMs: 15 * 60 * 1000,
        max: 5,
    },
    API: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
    UPLOAD: {
        windowMs: 60 * 60 * 1000,
        max: 50,
    },
    CREATE: {
        windowMs: 60 * 60 * 1000,
        max: 50,
    },
};
export const HTTPSTATUS = {
    OK: HTTP_STATUS.OK,
    CREATED: HTTP_STATUS.CREATED,
    BAD_REQUEST: HTTP_STATUS.BAD_REQUEST,
    UNAUTHORIZED: HTTP_STATUS.UNAUTHORIZED,
    FORBIDDEN: HTTP_STATUS.FORBIDDEN,
    NOT_FOUND: HTTP_STATUS.NOT_FOUND,
    INTERNAL_SERVER_ERROR: HTTP_STATUS.INTERNAL_SERVER_ERROR,
};
//# sourceMappingURL=constants.js.map