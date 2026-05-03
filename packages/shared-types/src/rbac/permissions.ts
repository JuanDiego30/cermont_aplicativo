/**
 * @packageDocumentation
 * Permissions - Single Source of Truth
 *
 * Defines granular permissions that can be mapped to roles.
 * Follows principle of least privilege and separation of concerns.
 *
 * @see {@link https://github.com/JuanDiego30/cermont_aplicativo/blob/main/docs/Intrucciones_para_crear_app_web/DOC-04%20%E2%80%94%20Sistema%20de%20Permisos%20y%20RBAC%20%20Roles%20Matriz%20Completa%20de%20Permisos.md DOC-04}
 *
 * @example
 * ```typescript
 * import { hasPermission, ROLE_PERMISSIONS } from '@cermont/shared-types/rbac';
 *
 * // Check if a role has a specific permission
 * if (hasPermission('gerente', 'orders:approve')) {
 *   // Allow approval
 * }
 *
 * // Get all permissions for a role
 * const managerPerms = ROLE_PERMISSIONS.gerente;
 * ```
 */

import { normalizeUserRole, type UserRole } from "./roles";

/**
 * Resource namespaces for permission organization.
 * Each resource has standard CRUD + domain-specific actions.
 *
 * @internal
 */
export type PermissionResource =
	| "users"
	| "orders"
	| "maintenance"
	| "evidence"
	| "proposals"
	| "costs"
	| "reports"
	| "documents"
	| "resources"
	| "system";

/**
 * Standard CRUD actions available across resources.
 *
 * @internal
 */
export type CrudAction = "create" | "read" | "update" | "delete";

/**
 * Domain-specific actions beyond standard CRUD.
 *
 * @internal
 */
export type DomainAction = "approve" | "reject" | "allocate" | "upload" | "configure" | "read_logs";

/**
 * Granular permission strings following the `resource:action` pattern.
 *
 * Each permission represents a single, atomic capability within the system.
 * Permissions are grouped by resource namespace for clarity.
 *
 * @see {@link ROLE_PERMISSIONS} for role-to-permission mappings
 *
 * @example
 * ```typescript
 * const permission: Permission = 'orders:approve';
 * const isValid: Permission = 'users:create'; // ✅
 * const invalid = 'orders:fly'; // ❌ Type error
 * ```
 */
export type Permission =
	// User management
	| "users:create"
	| "users:read"
	| "users:update"
	| "users:delete"
	// Orders
	| "orders:create"
	| "orders:read"
	| "orders:update"
	| "orders:delete"
	| "orders:approve"
	// Maintenance
	| "maintenance:create"
	| "maintenance:read"
	| "maintenance:update"
	| "maintenance:delete"
	| "maintenance:approve"
	// Evidence
	| "evidence:create"
	| "evidence:read"
	| "evidence:update"
	| "evidence:delete"
	// Proposals
	| "proposals:create"
	| "proposals:read"
	| "proposals:update"
	| "proposals:approve"
	| "proposals:reject"
	// Costs
	| "costs:create"
	| "costs:read"
	| "costs:update"
	| "costs:delete"
	| "costs:approve"
	// Reports
	| "reports:create"
	| "reports:read"
	| "reports:approve"
	// Documents
	| "documents:read"
	| "documents:upload"
	| "documents:delete"
	// Resources/Kits
	| "resources:create"
	| "resources:read"
	| "resources:update"
	| "resources:delete"
	| "resources:allocate"
	// System
	| "system:configure"
	| "system:read_logs";

/**
 * Role to permissions mapping based on hierarchical RBAC model.
 *
 * Each role is mapped to an immutable array of permissions.
 * This is the single source of truth for authorization decisions.
 *
 * @see {@link hasPermission} for runtime permission checks
 * @see {@link checkAllPermissions} for bulk permission validation
 * @see DOC-04 for the complete permission matrix
 *
 * @example
 * ```typescript
 * // Get all permissions for a role
 * const gerentePerms = ROLE_PERMISSIONS.gerente; // readonly Permission[]
 *
 * // Check if role has specific permission
 * const canApprove = ROLE_PERMISSIONS.supervisor.includes('orders:approve'); // true
 * ```
 */
export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
	manager: [
		"users:create",
		"users:read",
		"users:update",
		"users:delete",
		"orders:create",
		"orders:read",
		"orders:update",
		"orders:delete",
		"orders:approve",
		"maintenance:create",
		"maintenance:read",
		"maintenance:update",
		"maintenance:delete",
		"maintenance:approve",
		"evidence:create",
		"evidence:read",
		"evidence:update",
		"evidence:delete",
		"proposals:create",
		"proposals:read",
		"proposals:update",
		"proposals:approve",
		"proposals:reject",
		"costs:create",
		"costs:read",
		"costs:update",
		"costs:delete",
		"costs:approve",
		"reports:create",
		"reports:read",
		"reports:approve",
		"documents:read",
		"documents:upload",
		"documents:delete",
		"resources:create",
		"resources:read",
		"resources:update",
		"resources:delete",
		"resources:allocate",
		"system:configure",
		"system:read_logs",
	],
	resident_engineer: [
		"orders:create",
		"orders:read",
		"orders:update",
		"orders:delete",
		"maintenance:create",
		"maintenance:read",
		"maintenance:update",
		"maintenance:delete",
		"evidence:create",
		"evidence:read",
		"evidence:update",
		"evidence:delete",
		"resources:create",
		"resources:read",
		"resources:update",
		"resources:delete",
		"resources:allocate",
	],
	hse_coordinator: [
		"orders:create",
		"orders:read",
		"orders:update",
		"orders:delete",
		"maintenance:create",
		"maintenance:read",
		"maintenance:update",
		"maintenance:delete",
		"proposals:create",
		"proposals:read",
		"proposals:update",
		"costs:create",
		"costs:read",
		"costs:update",
		"resources:create",
		"resources:read",
		"resources:update",
		"resources:delete",
		"resources:allocate",
	],
	supervisor: [
		"orders:create",
		"orders:read",
		"orders:update",
		"orders:delete",
		"orders:approve",
		"maintenance:create",
		"maintenance:read",
		"maintenance:update",
		"maintenance:delete",
		"maintenance:approve",
		"evidence:create",
		"evidence:read",
		"evidence:update",
		"evidence:delete",
		"proposals:create",
		"proposals:read",
		"proposals:update",
		"proposals:approve",
		"costs:create",
		"costs:read",
		"costs:update",
		"costs:approve",
		"resources:create",
		"resources:read",
		"resources:update",
		"resources:delete",
		"resources:allocate",
	],
	operator: [
		"orders:read",
		"orders:update",
		"maintenance:read",
		"maintenance:update",
		"evidence:create",
		"evidence:read",
		"evidence:update",
		"proposals:create",
		"proposals:read",
		"proposals:update",
		"costs:read",
		"resources:read",
		"resources:allocate",
	],
	technician: [
		"orders:read",
		"evidence:create",
		"evidence:read",
		"evidence:update",
		"resources:read",
	],
	administrator: [
		"costs:create",
		"costs:read",
		"costs:update",
		"costs:delete",
		"costs:approve",
		"reports:create",
		"reports:read",
		"reports:approve",
		"documents:read",
		"documents:upload",
		"documents:delete",
		"system:configure",
		"system:read_logs",
	],
	client: [
		"orders:read",
		"maintenance:read",
		"evidence:read",
		"proposals:read",
		"costs:read",
		"reports:read",
		"documents:read",
		"resources:read",
	],
} as const satisfies Record<UserRole, readonly Permission[]>;

/**
 * Check if a role has a specific permission.
 *
 * Type-safe permission lookup using the ROLE_PERMISSIONS mapping.
 * Unknown roles always return false.
 *
 * @param role - The user role to check (case-sensitive)
 * @param permission - The permission to verify
 * @returns `true` if the role has the permission, `false` otherwise
 *
 * @example
 * ```typescript
 * // Check permission for authenticated user
 * if (hasPermission(user.role, 'orders:approve')) {
 *   // Show approval button
 * }
 *
 * // Unknown roles are safely handled
 * hasPermission('invalid-role', 'orders:read'); // false
 * ```
 */
export function hasPermission(role: UserRole | string, permission: Permission): boolean {
	const normalizedRole = normalizeUserRole(role);
	if (!normalizedRole) {
		return false;
	}
	const rolePerms = ROLE_PERMISSIONS[normalizedRole];
	return rolePerms.includes(permission);
}

/**
 * Check if a role has ALL of the specified permissions (AND logic).
 *
 * Useful for operations that require multiple permissions simultaneously.
 * Returns `false` if ANY permission is missing.
 *
 * @param role - The user role to check
 * @param permissions - Array of permissions that must ALL be present
 * @returns `true` if role has ALL permissions, `false` otherwise
 *
 * @example
 * ```typescript
 * // Require multiple permissions for a compound action
 * if (checkAllPermissions(user.role, ['orders:read', 'orders:update', 'orders:approve'])) {
 *   // Allow full order management workflow
 * }
 *
 * // Empty array returns true (vacuous truth)
 * checkAllPermissions('tecnico', []); // true
 * ```
 */
export function checkAllPermissions(role: UserRole | string, permissions: Permission[]): boolean {
	const normalizedRole = normalizeUserRole(role);
	if (!normalizedRole) {
		return false;
	}
	const rolePerms = ROLE_PERMISSIONS[normalizedRole];
	return permissions.every((permission) => rolePerms.includes(permission));
}
