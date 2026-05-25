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
 * import { canAccessPath, canPerformAction } from '@cermont/domain';
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
import {
	ADMIN_PLUS_RESIDENTE,
	ADMIN_ROLES,
	ALL_AUTHENTICATED_ROLES,
	ASSET_MANAGEMENT_ROLES,
	BILLING_ACCESS_ROLES,
	DASHBOARD_ACCESS_ROLES,
	EVIDENCE_ACCESS_ROLES,
	FIELD_EXECUTION_ACCESS_ROLES,
	FINANCE_ACCESS_ROLES,
	hasRole,
	INTERNAL_ROLES,
	isAuthenticatedRole,
	MAINTENANCE_MANAGEMENT_ROLES,
	MANAGEMENT_ROLES,
	PLANNING_ACCESS_ROLES,
	REPORT_ROLES,
	RESOURCE_ROLES,
	SITE_VISIT_EXECUTION_ROLES,
	type UserRole,
} from "./roles";

const COMMON_AUTHENTICATED_PATHS = new Set(["/profile"]);

export const ROUTE_ACCESS_RULES = [
	{
		prefix: "/dashboard",
		roles: DASHBOARD_ACCESS_ROLES,
	},
	{
		prefix: "/work-requests",
		roles: ALL_AUTHENTICATED_ROLES,
	},
	{
		prefix: "/site-visits",
		roles: SITE_VISIT_EXECUTION_ROLES,
	},
	{
		prefix: "/admin",
		roles: ADMIN_ROLES,
	},
	{
		prefix: "/users",
		roles: ADMIN_ROLES,
	},
	{
		prefix: "/orders",
		roles: INTERNAL_ROLES,
	},
	{
		prefix: "/planning",
		roles: PLANNING_ACCESS_ROLES,
	},
	{
		prefix: "/execution",
		roles: FIELD_EXECUTION_ACCESS_ROLES,
	},
	{
		prefix: "/evidences",
		roles: EVIDENCE_ACCESS_ROLES,
	},
	{
		prefix: "/proposals",
		roles: [...ADMIN_PLUS_RESIDENTE, "cliente"],
	},
	{
		prefix: "/costs",
		roles: [...MANAGEMENT_ROLES, "hes", "administrativo"],
	},
	{
		prefix: "/reports",
		roles: [...REPORT_ROLES, "hes", "cliente"],
	},
	{
		prefix: "/delivery-records",
		roles: ALL_AUTHENTICATED_ROLES,
	},
	{
		prefix: "/billing",
		roles: BILLING_ACCESS_ROLES,
	},
	{
		prefix: "/payments",
		roles: FINANCE_ACCESS_ROLES,
	},
	{
		prefix: "/documents",
		roles: ALL_AUTHENTICATED_ROLES,
	},
	{
		prefix: "/templates",
		roles: [...MAINTENANCE_MANAGEMENT_ROLES, "administrativo"],
	},
	{
		prefix: "/assets",
		roles: ASSET_MANAGEMENT_ROLES,
	},
	{
		prefix: "/maintenance",
		roles: ALL_AUTHENTICATED_ROLES,
	},
	{
		prefix: "/resources",
		roles: RESOURCE_ROLES,
	},
	{
		prefix: "/service-cases",
		roles: ALL_AUTHENTICATED_ROLES,
	},
	{
		prefix: "/settings",
		roles: MANAGEMENT_ROLES,
	},
] as const satisfies readonly {
	prefix: string;
	roles: readonly UserRole[];
}[];

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
	"/unauthorized",
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
	return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function normalizePathname(pathname: string): string {
	const lowerPath = pathname.toLowerCase();
	return lowerPath.length > 1 && lowerPath.endsWith("/") ? lowerPath.slice(0, -1) : lowerPath;
}

export function getAllowedRolesForPath(pathname: string): readonly UserRole[] {
	const normalizedPath = normalizePathname(pathname);

	if (COMMON_AUTHENTICATED_PATHS.has(normalizedPath)) {
		return ALL_AUTHENTICATED_ROLES;
	}

	const rule = ROUTE_ACCESS_RULES.find(
		({ prefix }) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
	);

	return rule ? rule.roles : [];
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
	const normalizedPath = normalizePathname(pathname);

	if (isPublicPath(normalizedPath)) {
		return true;
	}

	if (!isAuthenticatedRole(role)) {
		return false;
	}

	return hasRole(role, getAllowedRolesForPath(normalizedPath));
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
