/**
 * @packageDocumentation
 * RBAC (Role-Based Access Control) - Single Source of Truth
 *
 * Combines role definitions and permission mappings to provide
 * comprehensive authorization checks for paths and actions.
 *
 * @see {@link https://github.com/JuanDiego30/cermont_aplicativo/blob/main/docs/Intrucciones_para_crear_app_web/DOC-04%20%E2%80%94%20Sistema%20de%20Permisos%20y%20RBAC%20%20Roles%20Matriz%20Completa%20de%20Permisos.md DOC-04}
 *
 * @example
 * ```typescript
 * import { canAccessPath, canPerformAction } from '@cermont/shared-types/rbac';
 *
 * // Check path access
 * if (canAccessPath('/admin/users', user.role)) {
 *   // Allow navigation
 * }
 *
 * // Check action permission
 * if (canPerformAction(user.role, 'orders:approve')) {
 *   // Show approval button
 * }
 * ```
 */

import type { Permission } from "./permissions";
import { checkAllPermissions, hasPermission } from "./permissions";
import { hasRole, normalizeUserRole, REPORT_ROLES, type UserRole } from "./roles";

/**
 * Public route paths that do not require authentication.
 *
 * These paths are accessible to all users, including unauthenticated visitors.
 * Includes authentication flows, static assets, and browser internal routes.
 *
 * @see {@link isPublicPath} for runtime path matching
 *
 * @example
 * ```typescript
 * // Check if path is public
 * PUBLIC_PATHS.includes('/login'); // true
 * PUBLIC_PATHS.includes('/dashboard'); // false
 * ```
 */
export const PUBLIC_PATHS = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/offline",
	"/_next", // Next.js static assets
	"/api/auth", // Auth callbacks
	"/favicon.ico",
	"/sitemap.xml",
	"/.well-known", // Browser internals and Chrome DevTools
] as const satisfies readonly string[];

/**
 * Type-safe public path literal type.
 *
 * @example
 * ```typescript
 * const path: PublicPath = '/login'; // ✅
 * const invalid: PublicPath = '/dashboard'; // ❌ Type error
 * ```
 */
export type PublicPath = (typeof PUBLIC_PATHS)[number];

/**
 * Check if a pathname is a public route (no authentication required).
 *
 * Matches both exact paths and prefix patterns (e.g., `/_next/*`).
 *
 * @param pathname - The URL pathname to check
 * @returns `true` if the path is public, `false` otherwise
 *
 * @example
 * ```typescript
 * isPublicPath('/login'); // true
 * isPublicPath('/_next/static/chunk.js'); // true (prefix match)
 * isPublicPath('/dashboard'); // false
 * ```
 */
export function isPublicPath(pathname: string): boolean {
	const normalizedPath = pathname.split(/[?#]/)[0] || "/";
	return PUBLIC_PATHS.some(
		(path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`),
	);
}

/**
 * Check if a user role can access a specific path in the application.
 *
 * Implements route-level authorization based on role-to-path mappings.
 * Public paths and common authenticated paths are allowed for all authenticated users.
 *
 * @param pathname - The URL pathname to check (normalized to lowercase internally)
 * @param role - The user role to verify
 * @returns `true` if the role can access the path, `false` otherwise
 *
 * @example
 * ```typescript
 * // Check path access for different roles
 * canAccessPath('/admin/users', 'gerente'); // true
 * canAccessPath('/admin/users', 'tecnico'); // false
 * canAccessPath('/dashboard', 'tecnico'); // true (common path)
 *
 * // Public paths are always accessible
 * canAccessPath('/login', 'invalid-role'); // true
 * ```
 *
 * @remarks
 * Path matching is case-insensitive and uses prefix matching for nested routes.
 * Unknown roles are treated as unauthenticated and denied access to protected paths.
 */
export function canAccessPath(pathname: string, role: UserRole | string): boolean {
	const normalizedRole = normalizeUserRole(role);
	if (!normalizedRole) {
		return false;
	}

	const normalizedPath = pathname.toLowerCase();

	if (isPublicPath(normalizedPath)) {
		return true;
	}

	if (normalizedPath === "/" || normalizedPath === "/dashboard" || normalizedPath === "/profile") {
		return true;
	}

	return checkProtectedPath(normalizedPath, normalizedRole);
}

/** Route permission rules: prefix → evaluator */
const ROUTE_PERMISSIONS: ReadonlyArray<[string, (role: UserRole) => boolean]> = [
	["/admin", (role) => hasRole(role, ["manager", "administrator"])],
	["/orders", (role) => role !== "client"],
	[
		"/maintenance",
		(role) =>
			hasRole(role, [
				"resident_engineer",
				"supervisor",
				"operator",
				"technician",
				"hse_coordinator",
				"manager",
			]),
	],
	[
		"/evidences",
		(role) =>
			hasRole(role, [
				"resident_engineer",
				"supervisor",
				"operator",
				"technician",
				"hse_coordinator",
				"manager",
			]),
	],
	["/proposals", (role) => hasRole(role, ["manager", "resident_engineer", "administrator"])],
	["/costs", (role) => hasRole(role, ["manager", "administrator"])],
	["/reports", (role) => hasRole(role, [...REPORT_ROLES])],
	["/documents", (role) => role !== "client"],
	["/resources", (role) => hasRole(role, ["manager", "resident_engineer", "supervisor"])],
	["/users", (role) => hasRole(role, ["manager", "administrator"])],
];

function checkProtectedPath(normalizedPath: string, role: UserRole): boolean {
	for (const [prefix, evaluator] of ROUTE_PERMISSIONS) {
		if (normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
			return evaluator(role);
		}
	}
	return true;
}

/**
 * Check if a user role can perform a specific action (permission check).
 *
 * Alias for {@link hasPermission} from the permissions module.
 * Provides semantic clarity for action-based authorization.
 *
 * @param role - The user role to check
 * @param permission - The permission to verify
 * @returns `true` if the role has the permission, `false` otherwise
 *
 * @example
 * ```typescript
 * // Check if user can perform an action
 * if (canPerformAction(user.role, 'orders:approve')) {
 *   await approveOrder(orderId);
 * }
 * ```
 */
export function canPerformAction(role: UserRole | string, permission: Permission): boolean {
	return hasPermission(role, permission);
}

/**
 * Check if a user role has ALL of the specified permissions (bulk permission check).
 *
 * Alias for {@link checkAllPermissions} from the permissions module.
 * Useful for compound operations requiring multiple permissions.
 *
 * @param role - The user role to check
 * @param permissions - Array of permissions that must ALL be present
 * @returns `true` if role has ALL permissions, `false` otherwise
 *
 * @example
 * ```typescript
 * // Require multiple permissions for a workflow
 * if (hasAllPermissions(user.role, ['orders:read', 'orders:update'])) {
 *   // Allow order editing workflow
 * }
 * ```
 */
export function hasAllPermissions(role: UserRole | string, permissions: Permission[]): boolean {
	return checkAllPermissions(role, permissions);
}

export { hasRole };
