import { UserRole } from './roles.js';

/**
 * System Permissions Constants
 * Defines all available actions that users can perform
 */

// ============================================================================
// Permission Definitions
// ============================================================================

const ADMIN_PERMISSIONS = {
  ADMIN_FULL_ACCESS: 'admin:full:access',
} as const;

const USER_PERMISSIONS = {
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
} as const;

const ORDER_PERMISSIONS = {
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_ASSIGN: 'orders:assign',
  ORDERS_TRANSITION: 'orders:transition',
  ORDERS_ARCHIVE: 'orders:archive',
  ORDERS_MANAGE: 'orders:manage',
} as const;

const DASHBOARD_PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_VIEW_STATS: 'dashboard:view-stats',
  DASHBOARD_VIEW_METRICS: 'dashboard:view-metrics',
  DASHBOARD_CLEAR_CACHE: 'dashboard:clear-cache',
} as const;

const WORKPLAN_PERMISSIONS = {
  WORKPLANS_VIEW: 'workplans:view',
  WORKPLANS_CREATE: 'workplans:create',
  WORKPLANS_UPDATE: 'workplans:update',
  WORKPLANS_DELETE: 'workplans:delete',
  WORKPLANS_APPROVE: 'workplans:approve',
} as const;

const EVIDENCE_PERMISSIONS = {
  EVIDENCES_VIEW: 'evidences:view',
  EVIDENCES_UPLOAD: 'evidences:upload',
  EVIDENCES_DELETE: 'evidences:delete',
  EVIDENCES_APPROVE: 'evidences:approve',
} as const;

const REPORT_PERMISSIONS = {
  REPORTS_VIEW: 'reports:view',
  REPORTS_CREATE: 'reports:create',
  REPORTS_GENERATE: 'reports:generate',
  REPORTS_EXPORT: 'reports:export',
} as const;

const KIT_PERMISSIONS = {
  READ_KITS: 'kits:read',
  WRITE_KITS: 'kits:write',
  DELETE_KITS: 'kits:delete',
  KITS_VIEW: 'kits:view',
  KITS_CREATE: 'kits:create',
  KITS_UPDATE: 'kits:update',
  KITS_DELETE: 'kits:delete',
  KITS_MANAGE: 'kits:manage',
} as const;

const CHECKLIST_PERMISSIONS = {
  READ_CHECKLISTS: 'checklists:read',
  WRITE_CHECKLISTS: 'checklists:write',
  DELETE_CHECKLISTS: 'checklists:delete',
} as const;

const FORM_PERMISSIONS = {
  FORMS_VIEW: 'forms:view',
  FORMS_MANAGE: 'forms:manage',
  FORMS_SUBMIT: 'forms:submit',
  FORMS_VIEW_SUBMISSIONS: 'forms:view-submissions',
  FORMS_APPROVE_SUBMISSIONS: 'forms:approve-submissions',
} as const;

const ARCHIVE_PERMISSIONS = {
  VIEW_ARCHIVES: 'archives:view',
  CREATE_ARCHIVES: 'archives:create',
  DELETE_ARCHIVES: 'archives:delete',
  ARCHIVE_VIEW: 'archive:view',
  ARCHIVE_MANAGE: 'archive:manage',
} as const;

const BILLING_PERMISSIONS = {
  VIEW_BILLING: 'billing:view',
  MANAGE_BILLING: 'billing:manage',
} as const;

const CLIENT_PERMISSIONS = {
  CLIENT_CREATE_REQUEST: 'client:create-request',
  CLIENT_VIEW_OWN_REQUESTS: 'client:view-own-requests',
} as const;

// ============================================================================
// Equipment & Certifications (NEW - Control de certificaciones)
// ============================================================================
const EQUIPMENT_PERMISSIONS = {
  EQUIPMENT_READ: 'equipment:read',
  EQUIPMENT_WRITE: 'equipment:write',
  EQUIPMENT_DELETE: 'equipment:delete',
  VERIFY_CERTIFICATIONS: 'equipment:verify-certifications',
} as const;

// ============================================================================
// Consolidated Permissions
// ============================================================================

export const PERMISSIONS = {
  ...ADMIN_PERMISSIONS,
  ...USER_PERMISSIONS,
  ...ORDER_PERMISSIONS,
  ...DASHBOARD_PERMISSIONS,
  ...WORKPLAN_PERMISSIONS,
  ...EVIDENCE_PERMISSIONS,
  ...REPORT_PERMISSIONS,
  ...KIT_PERMISSIONS,
  ...CHECKLIST_PERMISSIONS,
  ...FORM_PERMISSIONS,
  ...ARCHIVE_PERMISSIONS,
  ...BILLING_PERMISSIONS,
  ...CLIENT_PERMISSIONS,
  ...EQUIPMENT_PERMISSIONS,
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// Role-Permission Mapping
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ROOT]: Object.values(PERMISSIONS),
  [UserRole.ADMIN]: Object.values(PERMISSIONS),
  [UserRole.COORDINADOR]: [
    // Orders
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_ASSIGN,
    PERMISSIONS.ORDERS_TRANSITION,
    // Workplans
    PERMISSIONS.WORKPLANS_VIEW,
    PERMISSIONS.WORKPLANS_CREATE,
    PERMISSIONS.WORKPLANS_UPDATE,
    PERMISSIONS.WORKPLANS_APPROVE,
    // Evidences
    PERMISSIONS.EVIDENCES_VIEW,
    PERMISSIONS.EVIDENCES_UPLOAD,
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_CREATE,
    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_STATS,
    PERMISSIONS.DASHBOARD_VIEW_METRICS,
    // Kits & Checklists
    PERMISSIONS.READ_KITS,
    PERMISSIONS.WRITE_KITS,
    PERMISSIONS.READ_CHECKLISTS,
    PERMISSIONS.WRITE_CHECKLISTS,
    // Archives & Billing
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

// ============================================================================
// Permission Check Utilities
// ============================================================================

/**
 * Checks if a role has at least one of the required permissions
 */
export function hasAnyPermission(
  role: UserRole,
  requiredPermissions: Permission[]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return requiredPermissions.some((permission) =>
    rolePermissions.includes(permission)
  );
}

/**
 * Checks if a role has ALL of the required permissions
 */
export function hasAllPermissions(
  role: UserRole,
  requiredPermissions: Permission[]
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role] || [];
  return requiredPermissions.every((permission) =>
    rolePermissions.includes(permission)
  );
}
