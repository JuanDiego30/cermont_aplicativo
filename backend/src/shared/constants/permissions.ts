/**
 * Sistema de permisos granular para control de acceso
 * Cada permiso representa una acción específica que un usuario puede realizar
 */
export const PERMISSIONS = {
  // ========================================
  // PERMISOS DE DASHBOARD
  // ========================================
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_VIEW_METRICS: 'dashboard:view:metrics',
  DASHBOARD_VIEW_STATS: 'dashboard:view:stats',
  DASHBOARD_CLEAR_CACHE: 'dashboard:clear:cache',

  // ========================================
  // PERMISOS DE ÓRDENES
  // ========================================
  ORDERS_VIEW: 'orders:view',
  ORDERS_VIEW_ALL: 'orders:view:all',
  ORDERS_VIEW_OWN: 'orders:view:own',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_TRANSITION: 'orders:transition',
  ORDERS_ARCHIVE: 'orders:archive',
  ORDERS_ASSIGN: 'orders:assign',

  // ========================================
  // PERMISOS DE USUARIOS
  // ========================================
  USERS_VIEW: 'users:view',
  USERS_VIEW_ALL: 'users:view:all',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_ACTIVATE: 'users:activate',
  USERS_DEACTIVATE: 'users:deactivate',
  USERS_LOCK: 'users:lock',
  USERS_UNLOCK: 'users:unlock',
  USERS_CHANGE_PASSWORD: 'users:change:password',

  // ========================================
  // PERMISOS DE WORK PLANS
  // ========================================
  WORKPLANS_VIEW: 'workplans:view',
  WORKPLANS_VIEW_ALL: 'workplans:view:all',
  WORKPLANS_VIEW_OWN: 'workplans:view:own',
  WORKPLANS_CREATE: 'workplans:create',
  WORKPLANS_UPDATE: 'workplans:update',
  WORKPLANS_DELETE: 'workplans:delete',
  WORKPLANS_APPROVE: 'workplans:approve',
  WORKPLANS_REJECT: 'workplans:reject',

  // ========================================
  // PERMISOS DE EVIDENCIA
  // ========================================
  EVIDENCE_VIEW: 'evidence:view',
  EVIDENCE_VIEW_ALL: 'evidence:view:all',
  EVIDENCE_VIEW_OWN: 'evidence:view:own',
  EVIDENCE_CREATE: 'evidence:create',
  EVIDENCE_UPDATE: 'evidence:update',
  EVIDENCE_DELETE: 'evidence:delete',
  EVIDENCE_APPROVE: 'evidence:approve',

  // ========================================
  // PERMISOS DE KITS TÍPICOS
  // ========================================
  READ_KITS: 'kits:read',
  WRITE_KITS: 'kits:write',
  DELETE_KITS: 'kits:delete',
  MANAGE_KITS: 'kits:manage',

  // ========================================
  // PERMISOS DE AUDITORÍA
  // ========================================
  AUDIT_VIEW: 'audit:view',
  AUDIT_VIEW_ALL: 'audit:view:all',
  AUDIT_EXPORT: 'audit:export',

  // ========================================
  // PERMISOS ADMINISTRATIVOS
  // ========================================
  ADMIN_FULL_ACCESS: 'admin:full:access',
  ROOT_FULL_ACCESS: 'root:full:access',
} as const;

/**
 * Tipo para permisos (type-safe)
 */
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Mapeo de roles a permisos
 * Define qué permisos tiene cada rol por defecto
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ROOT: [
    PERMISSIONS.ROOT_FULL_ACCESS,
    // ROOT tiene todos los permisos
    ...Object.values(PERMISSIONS),
  ],

  ADMIN: [
    PERMISSIONS.ADMIN_FULL_ACCESS,
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_METRICS,
    PERMISSIONS.DASHBOARD_VIEW_STATS,
    PERMISSIONS.DASHBOARD_CLEAR_CACHE,
    // Órdenes
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_DELETE,
    PERMISSIONS.ORDERS_TRANSITION,
    PERMISSIONS.ORDERS_ARCHIVE,
    PERMISSIONS.ORDERS_ASSIGN,
    // Usuarios
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_VIEW_ALL,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_ACTIVATE,
    PERMISSIONS.USERS_DEACTIVATE,
    PERMISSIONS.USERS_LOCK,
    PERMISSIONS.USERS_UNLOCK,
    PERMISSIONS.USERS_CHANGE_PASSWORD,
    // Work Plans
    PERMISSIONS.WORKPLANS_VIEW,
    PERMISSIONS.WORKPLANS_VIEW_ALL,
    PERMISSIONS.WORKPLANS_CREATE,
    PERMISSIONS.WORKPLANS_UPDATE,
    PERMISSIONS.WORKPLANS_APPROVE,
    PERMISSIONS.WORKPLANS_REJECT,
    // Evidencia
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.EVIDENCE_VIEW_ALL,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_APPROVE,
    // Kits Típicos
    PERMISSIONS.READ_KITS,
    PERMISSIONS.WRITE_KITS,
    PERMISSIONS.DELETE_KITS,
    PERMISSIONS.MANAGE_KITS,
    // Auditoría
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_VIEW_ALL,
    PERMISSIONS.AUDIT_EXPORT,
  ],

  COORDINADOR: [
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_METRICS,
    PERMISSIONS.DASHBOARD_VIEW_STATS,
    // Órdenes
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_TRANSITION,
    PERMISSIONS.ORDERS_ASSIGN,
    // Work Plans
    PERMISSIONS.WORKPLANS_VIEW,
    PERMISSIONS.WORKPLANS_VIEW_ALL,
    PERMISSIONS.WORKPLANS_VIEW_OWN,
    PERMISSIONS.WORKPLANS_CREATE,
    PERMISSIONS.WORKPLANS_UPDATE,
    PERMISSIONS.WORKPLANS_APPROVE,
    // Evidencia
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.EVIDENCE_VIEW_ALL,
    PERMISSIONS.EVIDENCE_VIEW_OWN,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_UPDATE,
    PERMISSIONS.EVIDENCE_APPROVE,
    // Kits Típicos
    PERMISSIONS.READ_KITS,
    PERMISSIONS.WRITE_KITS,
    PERMISSIONS.MANAGE_KITS,
  ],

  OPERARIO: [
    // Dashboard (solo su info)
    PERMISSIONS.DASHBOARD_VIEW,
    // Órdenes (solo las asignadas)
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_VIEW_OWN,
    // Work Plans (solo los suyos)
    PERMISSIONS.WORKPLANS_VIEW,
    PERMISSIONS.WORKPLANS_VIEW_OWN,
    PERMISSIONS.WORKPLANS_CREATE,
    PERMISSIONS.WORKPLANS_UPDATE,
    // Evidencia (solo la suya)
    PERMISSIONS.EVIDENCE_VIEW,
    PERMISSIONS.EVIDENCE_VIEW_OWN,
    PERMISSIONS.EVIDENCE_CREATE,
    PERMISSIONS.EVIDENCE_UPDATE,
    // Kits Típicos (solo lectura)
    PERMISSIONS.READ_KITS,
  ],
};

/**
 * Helper para verificar si un rol tiene un permiso
 * 
 * @param role - Rol del usuario
 * @param permission - Permiso a verificar
 * @returns true si el rol tiene el permiso
 * 
 * @example
 * ```
 * if (hasPermission('ADMIN', PERMISSIONS.USERS_CREATE)) {
 *   // Usuario puede crear usuarios
 * }
 * ```
 */
export function hasPermission(role: keyof typeof ROLE_PERMISSIONS, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Helper para obtener todos los permisos de un rol
 * 
 * @param role - Rol del usuario
 * @returns Array de permisos
 * 
 * @example
 * ```
 * const permissions = getRolePermissions('COORDINADOR');
 * ```
 */
export function getRolePermissions(role: keyof typeof ROLE_PERMISSIONS): Permission[] {
  return [...(ROLE_PERMISSIONS[role] ?? [])];
}

/**
 * Helper para verificar si un usuario tiene alguno de los permisos (OR logic)
 * 
 * @param role - Rol del usuario
 * @param permissions - Array de permisos
 * @returns true si el rol tiene al menos uno de los permisos
 */
export function hasAnyPermission(
  role: keyof typeof ROLE_PERMISSIONS,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Helper para verificar si un usuario tiene todos los permisos (AND logic)
 * 
 * @param role - Rol del usuario
 * @param permissions - Array de permisos
 * @returns true si el rol tiene todos los permisos
 */
export function hasAllPermissions(
  role: keyof typeof ROLE_PERMISSIONS,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
