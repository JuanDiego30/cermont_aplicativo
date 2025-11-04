export declare const ROLES: {
    readonly ROOT: "root";
    readonly ADMIN: "admin";
    readonly COORDINATOR_HES: "coordinator_hes";
    readonly ENGINEER: "engineer";
    readonly SUPERVISOR: "supervisor";
    readonly TECHNICIAN: "technician";
    readonly ACCOUNTANT: "accountant";
    readonly CLIENT: "client";
};
export type Role = keyof typeof ROLES;
export declare const ROLE_HIERARCHY: Record<Role, number>;
export declare const ORDER_STATUS: {
    readonly PENDING: "pendiente";
    readonly PLANNING: "planificacion";
    readonly IN_PROGRESS: "en_progreso";
    readonly COMPLETED: "completada";
    readonly INVOICING: "facturacion";
    readonly INVOICED: "facturada";
    readonly PAID: "pagada";
    readonly CANCELLED: "cancelada";
};
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export declare const WORKPLAN_STATUS: {
    readonly DRAFT: "draft";
    readonly APPROVED: "approved";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly REJECTED: "rejected";
};
export type WorkplanStatus = (typeof WORKPLAN_STATUS)[keyof typeof WORKPLAN_STATUS];
export declare const EVIDENCE_TYPES: {
    readonly BEFORE: "antes";
    readonly DURING: "durante";
    readonly AFTER: "despues";
};
export type EvidenceType = (typeof EVIDENCE_TYPES)[keyof typeof EVIDENCE_TYPES];
export declare const ORDER_PRIORITY: {
    readonly LOW: "baja";
    readonly MEDIUM: "media";
    readonly HIGH: "alta";
    readonly URGENT: "urgente";
};
export type OrderPriority = (typeof ORDER_PRIORITY)[keyof typeof ORDER_PRIORITY];
export declare const BUSINESS_UNITS: {
    readonly IT: "IT";
    readonly MNT: "MNT";
    readonly SC: "SC";
    readonly GEN: "GEN";
    readonly OTHERS: "Otros";
};
export type BusinessUnit = (typeof BUSINESS_UNITS)[keyof typeof BUSINESS_UNITS];
export declare const ALLOWED_FILE_TYPES: {
    readonly IMAGES: readonly ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    readonly DOCUMENTS: readonly ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    readonly SPREADSHEETS: readonly ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    readonly ALL: readonly ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
};
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES.ALL)[number];
export declare const MAX_FILE_SIZE: {
    readonly IMAGE: number;
    readonly DOCUMENT: number;
    readonly DEFAULT: number;
};
export type MaxFileSizeKey = keyof typeof MAX_FILE_SIZE;
export declare const TOOLKIT_CATEGORIES: {
    readonly ELECTRICAL: "electrico";
    readonly TELECOM: "telecomunicaciones";
    readonly CCTV: "CCTV";
    readonly INSTRUMENTATION: "instrumentacion";
    readonly GENERAL: "general";
};
export type ToolkitCategory = (typeof TOOLKIT_CATEGORIES)[keyof typeof TOOLKIT_CATEGORIES];
export declare const NOTIFICATION_TYPES: {
    readonly ORDER_ASSIGNED: "order_assigned";
    readonly ORDER_STATUS_CHANGED: "order_status_changed";
    readonly ORDER_NOTE_ADDED: "order_note_added";
    readonly WORKPLAN_APPROVED: "workplan_approved";
    readonly WORKPLAN_REJECTED: "workplan_rejected";
    readonly REPORT_APPROVED: "report_approved";
    readonly DEADLINE_APPROACHING: "deadline_approaching";
    readonly USER_MENTIONED: "user_mentioned";
    readonly SYSTEM_ALERT: "system_alert";
};
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
};
export type PaginationConfig = typeof PAGINATION;
export declare const AUDIT_SEVERITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export type AuditSeverity = (typeof AUDIT_SEVERITY)[keyof typeof AUDIT_SEVERITY];
export declare const TOKEN_EXPIRATION: {
    readonly ACCESS_TOKEN: "15m";
    readonly REFRESH_TOKEN: "7d";
    readonly RESET_PASSWORD: "1h";
};
export type TokenType = keyof typeof TOKEN_EXPIRATION;
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR";
    readonly AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly DUPLICATE_ERROR: "DUPLICATE_ERROR";
    readonly DATABASE_ERROR: "DATABASE_ERROR";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
    readonly RATE_LIMIT_ERROR: "RATE_LIMIT_ERROR";
    readonly RETRY_EXHAUSTED: "RETRY_EXHAUSTED";
    readonly CONFLICT_ERROR: "CONFLICT_ERROR";
    readonly DUPLICATE_EMAIL: "DUPLICATE_EMAIL";
    readonly DUPLICATE_CEDULA: "DUPLICATE_CEDULA";
    readonly INVALID_OBJECTID: "INVALID_OBJECTID";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export declare const ERROR_MESSAGES: {
    readonly VALIDATION_FAILED: "Error de validación en los datos proporcionados";
    readonly UNAUTHORIZED: "No autorizado. Por favor, inicia sesión";
    readonly FORBIDDEN: "No tienes permisos para realizar esta acción";
    readonly NOT_FOUND: "Recurso no encontrado";
    readonly DUPLICATE_ENTRY: "Ya existe un registro con estos datos";
    readonly DATABASE_ERROR: "Error en la base de datos";
    readonly INTERNAL_ERROR: "Error interno del servidor";
    readonly RATE_LIMIT: "Demasiadas solicitudes. Por favor, intenta más tarde";
    readonly SUCCESS: "Operación realizada exitosamente";
    readonly WEAK_PASSWORD: "La contraseña es demasiado débil";
    readonly CONFLICT: "Conflicto con el estado actual del recurso";
    readonly CREATED_SUCCESS: "Recurso creado exitosamente";
    readonly RATE_LIMIT_EXCEEDED: "Límite de solicitudes excedido";
};
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PHONE: RegExp;
    readonly CEDULA: RegExp;
    readonly ALPHANUMERIC: RegExp;
    readonly NO_SPECIAL_CHARS: RegExp;
    readonly URL: RegExp;
};
export type RegexPatternKey = keyof typeof REGEX_PATTERNS;
export declare const PASSWORD_MIN_LENGTH = 8;
export declare const DATE_FORMATS: {
    readonly ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ";
    readonly DATE_ONLY: "YYYY-MM-DD";
    readonly TIME_ONLY: "HH:mm:ss";
    readonly DATETIME: "YYYY-MM-DD HH:mm:ss";
    readonly DISPLAY: "DD/MM/YYYY";
    readonly DISPLAY_DATETIME: "DD/MM/YYYY HH:mm";
};
export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];
export declare const CACHE_DURATIONS: {
    readonly SHORT: 60;
    readonly MEDIUM: 300;
    readonly LONG: 3600;
    readonly DAY: 86400;
};
export type CacheDuration = (typeof CACHE_DURATIONS)[keyof typeof CACHE_DURATIONS];
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly MOVED_PERMANENTLY: 301;
    readonly FOUND: 302;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
};
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export declare const RATE_LIMITS: {
    readonly AUTH: {
        readonly windowMs: number;
        readonly max: 5;
    };
    readonly API: {
        readonly windowMs: number;
        readonly max: 100;
    };
    readonly UPLOAD: {
        readonly windowMs: number;
        readonly max: 50;
    };
    readonly CREATE: {
        readonly windowMs: number;
        readonly max: 50;
    };
};
export type RateLimitKey = keyof typeof RATE_LIMITS;
export declare const HTTPSTATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly INTERNAL_SERVER_ERROR: 500;
};
//# sourceMappingURL=constants.d.ts.map