import { UserRole } from './roles.js';

/**
 * Constantes de Permisos del Sistema
 * Define las acciones que pueden realizar los usuarios
 */
export const PERMISSIONS = {
    // Admin
    ADMIN_FULL_ACCESS: 'admin:full:access',

    // Usuarios
    USERS_VIEW_ALL: 'users:view-all',
    USERS_VIEW: 'users:view',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    USERS_CHANGE_PASSWORD: 'users:change-password',
    USERS_ACTIVATE: 'users:activate',
    USERS_DEACTIVATE: 'users:deactivate',
    USERS_LOCK: 'users:lock',
    USERS_UNLOCK: 'users:unlock',
    USERS_MANAGE: 'users:manage',

    // Órdenes
    ORDERS_VIEW: 'orders:view',
    ORDERS_CREATE: 'orders:create',
    ORDERS_UPDATE: 'orders:update',
    ORDERS_DELETE: 'orders:delete',
    ORDERS_ASSIGN: 'orders:assign',
    ORDERS_TRANSITION: 'orders:transition',
    ORDERS_ARCHIVE: 'orders:archive',
    ORDERS_MANAGE: 'orders:manage',

    // Dashboard
    DASHBOARD_VIEW: 'dashboard:view',
    DASHBOARD_VIEW_STATS: 'dashboard:view-stats',
    DASHBOARD_VIEW_METRICS: 'dashboard:view-metrics',
    DASHBOARD_CLEAR_CACHE: 'dashboard:clear-cache',

    // WorkPlans
    WORKPLANS_VIEW: 'workplans:view',
    WORKPLANS_CREATE: 'workplans:create',
    WORKPLANS_UPDATE: 'workplans:update',
    WORKPLANS_DELETE: 'workplans:delete',
    WORKPLANS_APPROVE: 'workplans:approve',

    // Evidences
    EVIDENCES_VIEW: 'evidences:view',
    EVIDENCES_UPLOAD: 'evidences:upload',
    EVIDENCES_DELETE: 'evidences:delete',
    EVIDENCES_APPROVE: 'evidences:approve',

    // Reports
    REPORTS_VIEW: 'reports:view',
    REPORTS_CREATE: 'reports:create',
    REPORTS_GENERATE: 'reports:generate',
    REPORTS_EXPORT: 'reports:export',

    // Kits
    READ_KITS: 'kits:read',
    WRITE_KITS: 'kits:write',
    DELETE_KITS: 'kits:delete',
    KITS_VIEW: 'kits:view',
    KITS_CREATE: 'kits:create',
    KITS_UPDATE: 'kits:update',
    KITS_DELETE: 'kits:delete',
    KITS_MANAGE: 'kits:manage',

    // Checklists
    READ_CHECKLISTS: 'checklists:read',
    WRITE_CHECKLISTS: 'checklists:write',
    DELETE_CHECKLISTS: 'checklists:delete',

    // Forms/Templates (NUEVO)
    FORMS_VIEW: 'forms:view',
    FORMS_MANAGE: 'forms:manage',
    FORMS_SUBMIT: 'forms:submit',
    FORMS_VIEW_SUBMISSIONS: 'forms:view-submissions',
    FORMS_APPROVE_SUBMISSIONS: 'forms:approve-submissions',

    // Archives
    VIEW_ARCHIVES: 'archives:view',
    CREATE_ARCHIVES: 'archives:create',
    DELETE_ARCHIVES: 'archives:delete',
    ARCHIVE_VIEW: 'archive:view',
    ARCHIVE_MANAGE: 'archive:manage',

    // Billing
    VIEW_BILLING: 'billing:view',
    MANAGE_BILLING: 'billing:manage',

    // Client
    CLIENT_CREATE_REQUEST: 'client:create-request',
    CLIENT_VIEW_OWN_REQUESTS: 'client:view-own-requests',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Mapeo de Roles a Permisos
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.ROOT]: Object.values(PERMISSIONS),
    [UserRole.ADMIN]: Object.values(PERMISSIONS), // Admin tiene todo por ahora
    [UserRole.COORDINADOR]: [
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.ORDERS_CREATE,
        PERMISSIONS.ORDERS_UPDATE,
        PERMISSIONS.ORDERS_ASSIGN,
        PERMISSIONS.ORDERS_TRANSITION,
        PERMISSIONS.WORKPLANS_VIEW,
        PERMISSIONS.WORKPLANS_CREATE,
        PERMISSIONS.WORKPLANS_UPDATE,
        PERMISSIONS.WORKPLANS_APPROVE,
        PERMISSIONS.EVIDENCES_VIEW,
        PERMISSIONS.EVIDENCES_UPLOAD,
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_CREATE,
        PERMISSIONS.DASHBOARD_VIEW,
        PERMISSIONS.DASHBOARD_VIEW_STATS,
        PERMISSIONS.DASHBOARD_VIEW_METRICS,
        PERMISSIONS.READ_KITS,
        PERMISSIONS.WRITE_KITS,
        PERMISSIONS.READ_CHECKLISTS,
        PERMISSIONS.WRITE_CHECKLISTS,
        PERMISSIONS.VIEW_ARCHIVES,
        PERMISSIONS.CREATE_ARCHIVES,
        PERMISSIONS.VIEW_BILLING,
    ],
    [UserRole.AUXILIAR]: [
        PERMISSIONS.ORDERS_VIEW,
        PERMISSIONS.WORKPLANS_VIEW,
        PERMISSIONS.EVIDENCES_VIEW,
        PERMISSIONS.EVIDENCES_UPLOAD,
        PERMISSIONS.READ_KITS,
        PERMISSIONS.READ_CHECKLISTS,
        PERMISSIONS.DASHBOARD_VIEW,
    ],
    [UserRole.CLIENTE]: [
        PERMISSIONS.CLIENT_CREATE_REQUEST,
        PERMISSIONS.CLIENT_VIEW_OWN_REQUESTS,
    ],
};

/**
 * Verifica si un rol tiene al menos uno de los permisos requeridos
 */
export function hasAnyPermission(role: UserRole, requiredPermissions: Permission[]): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return requiredPermissions.some((permission) => rolePermissions.includes(permission));
}

/**
 * Verifica si un rol tiene TODOS los permisos requeridos
 */
export function hasAllPermissions(role: UserRole, requiredPermissions: Permission[]): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    return requiredPermissions.every((permission) => rolePermissions.includes(permission));
}
