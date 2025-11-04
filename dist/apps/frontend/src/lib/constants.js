export const CACHE_TIME = {
    SHORT: 1 * 60 * 1000,
    MEDIUM: 5 * 60 * 1000,
    LONG: 15 * 60 * 1000,
    VERY_LONG: 60 * 60 * 1000,
};
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};
export const USER_ROLES = {
    ROOT: 'root',
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    SUPERVISOR: 'supervisor',
    ENGINEER: 'engineer',
    USER: 'user',
};
export const ORDER_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
};
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    THEME: 'theme',
    LANGUAGE: 'language',
};
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    TIMEOUT: 30000,
};
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Por favor, verifica tu conexión a internet.',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    SERVER_ERROR: 'Error del servidor. Por favor, inténtalo más tarde.',
    VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
};
export const WORKPLAN_STATUS = {
    DRAFT: 'draft',
    APPROVED: 'approved',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
};
export const BUSINESS_UNITS = {
    IT: 'IT',
    MNT: 'MNT',
    SC: 'SC',
    GEN: 'GEN',
    OTROS: 'OTROS',
};
export const SECURITY_ELEMENT_CATEGORIES = {
    EPP: 'EPP',
    SENALIZACION: 'Señalización',
    PROTECCION_COLECTIVA: 'Protección colectiva',
    EMERGENCIA: 'Emergencia',
    OTRO: 'Otro',
};
//# sourceMappingURL=constants.js.map