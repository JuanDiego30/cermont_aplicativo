/**
 * RBAC package - Single Source of Truth
 *
 * Exports:
 * - roles.ts: Role definitions and validation
 * - permissions.ts: Granular permissions mapping
 * - rbac.ts: Role-based and permission-based access control
 */

export * from "./permissions";
// Explicit re-exports for clarity (permissions)
export {
	checkAllPermissions,
	hasPermission,
	ROLE_PERMISSIONS,
} from "./permissions";
export * from "./rbac";
// Explicit re-exports for clarity (rbac)
export {
	canAccessPath,
	canPerformAction,
	hasAllPermissions,
	isPublicPath,
	PUBLIC_PATHS,
} from "./rbac";
// Explicit re-exports for clarity (roles)
export type { UserRole } from "./roles";
// Re-export everything from each module
export * from "./roles";
export {
	ADMIN_PLUS_RESIDENT_ENGINEER,
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	ALL_USER_ROLE_INPUTS,
	APPROVER_ROLES,
	hasRole,
	INTERNAL_ROLES,
	isAuthenticatedRole,
	isUserRoleInput,
	LEGACY_AUTHENTICATED_ROLES,
	LEGACY_ROLE_ALIASES,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	normalizeUserRole,
	REPORT_ROLES,
	RESOURCE_ROLES,
	ROLE_HIERARCHY,
	ROLE_LABELS,
} from "./roles";
