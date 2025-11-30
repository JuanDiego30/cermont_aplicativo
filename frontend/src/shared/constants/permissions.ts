/**
 * PERMISSIONS CONSTANTS (Frontend)
 * These MUST match backend permissions exactly.
 */

export const PERMISSIONS = {
  // Admin
  ADMIN_FULL_ACCESS: 'admin:full:access',

  // Users
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

  // Orders
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

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',

  // Kits
  READ_KITS: 'kits:read',
  WRITE_KITS: 'kits:write',
  DELETE_KITS: 'kits:delete',

  // Checklists
  READ_CHECKLISTS: 'checklists:read',
  WRITE_CHECKLISTS: 'checklists:write',
  DELETE_CHECKLISTS: 'checklists:delete',

  // Archives
  VIEW_ARCHIVES: 'archives:view',
  CREATE_ARCHIVES: 'archives:create',
  DELETE_ARCHIVES: 'archives:delete',

  // Billing
  VIEW_BILLING: 'billing:view',
  MANAGE_BILLING: 'billing:manage',

  // Client
  CLIENT_CREATE_REQUEST: 'client:create-request',
  CLIENT_VIEW_OWN_REQUESTS: 'client:view-own-requests',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const COORDINATOR_PERMISSIONS: Permission[] = [
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
];

const AUXILIAR_PERMISSIONS: Permission[] = [
  PERMISSIONS.ORDERS_VIEW,
  PERMISSIONS.WORKPLANS_VIEW,
  PERMISSIONS.EVIDENCES_VIEW,
  PERMISSIONS.EVIDENCES_UPLOAD,
  PERMISSIONS.READ_KITS,
  PERMISSIONS.READ_CHECKLISTS,
  PERMISSIONS.DASHBOARD_VIEW,
];

const CLIENT_PERMISSIONS: Permission[] = [
  PERMISSIONS.CLIENT_CREATE_REQUEST,
  PERMISSIONS.CLIENT_VIEW_OWN_REQUESTS,
];

/**
 * ROLE PERMISSIONS MAPPING
 */
const ROLE_PERMISSIONS_BASE = {
  ROOT: Object.values(PERMISSIONS),
  ADMIN: Object.values(PERMISSIONS),

  COORDINADOR: COORDINATOR_PERMISSIONS,
  AUXILIAR: AUXILIAR_PERMISSIONS,
  CLIENTE: CLIENT_PERMISSIONS,
} as const;

const ROLE_ALIASES: Record<string, keyof typeof ROLE_PERMISSIONS_BASE> = {
  COORDINATOR: 'COORDINADOR',
  SUPERVISOR: 'COORDINADOR',
  TECHNICIAN: 'AUXILIAR',
  INSPECTOR: 'AUXILIAR',
  CLIENT: 'CLIENTE',
};

export type RoleKey = keyof typeof ROLE_PERMISSIONS_BASE;
export type RoleAlias = keyof typeof ROLE_ALIASES;
export type Role = RoleKey | RoleAlias;

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ...Object.fromEntries(
    Object.entries(ROLE_PERMISSIONS_BASE).map(([role, permissions]) => [role, permissions])
  ),
  ...Object.fromEntries(
    Object.entries(ROLE_ALIASES).map(([alias, role]) => [alias, ROLE_PERMISSIONS_BASE[role]])
  ),
};

export function normalizeRole(role?: string): Role | undefined {
  if (!role) return undefined;
  const normalized = role.toUpperCase();
  if (normalized in ROLE_PERMISSIONS_BASE) return normalized as RoleKey;
  if (normalized in ROLE_ALIASES) return normalized as RoleAlias;
  return undefined;
}

export function getRolePermissions(role?: string): Permission[] {
  const resolved = normalizeRole(role);
  if (!resolved) return [];
  return ROLE_PERMISSIONS[resolved];
}

export function hasAnyPermission(role: string, requiredPermissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return requiredPermissions.some((permission) => rolePermissions.includes(permission));
}

export function hasAllPermissions(role: string, requiredPermissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return requiredPermissions.every((permission) => rolePermissions.includes(permission));
}
