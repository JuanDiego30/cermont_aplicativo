export declare const CACHE_TIME: {
    readonly SHORT: number;
    readonly MEDIUM: number;
    readonly LONG: number;
    readonly VERY_LONG: number;
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE_SIZE: 10;
    readonly PAGE_SIZE_OPTIONS: readonly [10, 20, 50, 100];
};
export declare const USER_ROLES: {
    readonly ROOT: "root";
    readonly ADMIN: "admin";
    readonly COORDINATOR: "coordinator";
    readonly SUPERVISOR: "supervisor";
    readonly ENGINEER: "engineer";
    readonly USER: "user";
};
export declare const ORDER_STATUS: {
    readonly OPEN: "open";
    readonly IN_PROGRESS: "in_progress";
    readonly CLOSED: "closed";
    readonly CANCELLED: "cancelled";
};
export declare const STORAGE_KEYS: {
    readonly ACCESS_TOKEN: "accessToken";
    readonly REFRESH_TOKEN: "refreshToken";
    readonly THEME: "theme";
    readonly LANGUAGE: "language";
};
export declare const API_CONFIG: {
    readonly BASE_URL: string;
    readonly TIMEOUT: 30000;
};
export declare const ERROR_MESSAGES: {
    readonly NETWORK_ERROR: "Error de conexión. Por favor, verifica tu conexión a internet.";
    readonly UNAUTHORIZED: "No tienes permisos para realizar esta acción.";
    readonly NOT_FOUND: "El recurso solicitado no fue encontrado.";
    readonly SERVER_ERROR: "Error del servidor. Por favor, inténtalo más tarde.";
    readonly VALIDATION_ERROR: "Los datos proporcionados no son válidos.";
};
export declare const WORKPLAN_STATUS: {
    readonly DRAFT: "draft";
    readonly APPROVED: "approved";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly REJECTED: "rejected";
};
export declare const BUSINESS_UNITS: {
    readonly IT: "IT";
    readonly MNT: "MNT";
    readonly SC: "SC";
    readonly GEN: "GEN";
    readonly OTROS: "OTROS";
};
export declare const SECURITY_ELEMENT_CATEGORIES: {
    readonly EPP: "EPP";
    readonly SENALIZACION: "Señalización";
    readonly PROTECCION_COLECTIVA: "Protección colectiva";
    readonly EMERGENCIA: "Emergencia";
    readonly OTRO: "Otro";
};
//# sourceMappingURL=constants.d.ts.map