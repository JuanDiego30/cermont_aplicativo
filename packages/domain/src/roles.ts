/**
 * Role definitions - Single Source of Truth
 *
 * All roles are lowercase strings to match backend User.ts role enum.
 * No duplicates like "HES" vs "hes" - use consistent lowercase only.
 *
 * @packageDocumentation
 */

/**
 * UserRole type - represents all valid user roles in the system
 * These roles are used throughout the application for authorization
 *
 * @see DOC-04 for role specifications and security rules
 */
export type UserRole =
	| "gerente"
	| "residente"
	| "hes"
	| "supervisor"
	| "operador"
	| "tecnico"
	| "administrativo"
	| "cliente";

/**
 * All authenticated roles as a readonly tuple for compile-time guarantees
 * Use this when you need to iterate over all roles or validate role membership
 */
export const ALL_AUTHENTICATED_ROLES = [
	"gerente",
	"residente",
	"hes",
	"supervisor",
	"operador",
	"tecnico",
	"administrativo",
	"cliente",
] as const satisfies readonly UserRole[];

/**
 * Admin-only roles with full system access
 * Used for user management and system configuration
 */
export const ADMIN_ROLES = ["gerente", "administrativo"] as const satisfies readonly UserRole[];

/**
 * Resource management roles (orders, costs, proposals)
 * These roles can create, update, and manage work orders and resources
 */
export const RESOURCE_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"operador",
] as const satisfies readonly UserRole[];

/**
 * Report generation and approval roles
 * These roles can create technical reports and closure documents
 */
export const REPORT_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"operador",
	"tecnico",
	"administrativo",
] as const satisfies readonly UserRole[];

export const MANAGEMENT_ROLES = ["gerente", "residente"] as const satisfies readonly UserRole[];

export const APPROVER_ROLES = ["gerente", "supervisor"] as const satisfies readonly UserRole[];

export const MAINTENANCE_MANAGEMENT_ROLES = [
	"gerente",
	"residente",
	"hes",
] as const satisfies readonly UserRole[];

export const ADMIN_PLUS_RESIDENTE = [
	"gerente",
	"residente",
	"administrativo",
] as const satisfies readonly UserRole[];

export const INTERNAL_ROLES = ALL_AUTHENTICATED_ROLES.filter(
	(r): r is Exclude<UserRole, "cliente"> => r !== "cliente",
) as readonly UserRole[];

export const DASHBOARD_ACCESS_ROLES = ALL_AUTHENTICATED_ROLES;

export const PLANNING_ACCESS_ROLES = [
	"gerente",
	"residente",
	"supervisor",
] as const satisfies readonly UserRole[];

export const FIELD_EXECUTION_ACCESS_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"operador",
	"tecnico",
] as const satisfies readonly UserRole[];

export const EVIDENCE_ACCESS_ROLES = [
	"gerente",
	"residente",
	"hes",
	"supervisor",
	"operador",
	"tecnico",
] as const satisfies readonly UserRole[];

export const BILLING_ACCESS_ROLES = [
	"gerente",
	"residente",
	"hes",
	"administrativo",
	"cliente",
] as const satisfies readonly UserRole[];

export const FINANCE_ACCESS_ROLES = [
	"gerente",
	"administrativo",
] as const satisfies readonly UserRole[];

export const ASSET_MANAGEMENT_ROLES = [
	"gerente",
	"residente",
] as const satisfies readonly UserRole[];

export const SITE_VISIT_MANAGEMENT_ROLES = [
	"gerente",
	"residente",
	"supervisor",
] as const satisfies readonly UserRole[];

export const SITE_VISIT_EXECUTION_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"tecnico",
] as const satisfies readonly UserRole[];

export const SITE_VISIT_CANCEL_ROLES = [
	"gerente",
	"residente",
] as const satisfies readonly UserRole[];

/**
 * Human-readable labels for each role
 * Use for UI display and role selection dropdowns
 *
 * @example
 * ```typescript
 * const roleLabel = ROLE_LABELS[user.role]; // "Gerente"
 * ```
 */
export const ROLE_LABELS: Record<UserRole, string> = {
	gerente: "Gerente",
	residente: "Ing. Residente",
	hes: "Coordinador HES",
	supervisor: "Supervisor",
	operador: "Operador",
	tecnico: "Técnico",
	administrativo: "Administrativo",
	cliente: "Cliente",
} as const satisfies Record<UserRole, string>;

/**
 * Role hierarchy — lower number = higher privilege
 * Used by authorizeMinimum() middleware to enforce minimum role levels.
 *
 * @example
 * ```typescript
 * // Check if user has minimum gerente level
 * const hasAccess = ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY['gerente'];
 * ```
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
	gerente: 0,
	residente: 1,
	supervisor: 2,
	hes: 3,
	operador: 4,
	tecnico: 5,
	administrativo: 6,
	cliente: 7,
} as const satisfies Record<UserRole, number>;

/**
 * Type guard to validate if a value is an authenticated role
 * Provides compile-time type narrowing for safer role handling
 *
 * @param role - Unknown value to validate
 * @returns True if role is a valid UserRole, with type narrowing
 *
 * @example
 * ```typescript
 * function processUser(role: unknown) {
 *   if (isAuthenticatedRole(role)) {
 *     // TypeScript knows role is UserRole here
 *     console.log(ROLE_LABELS[role]);
 *   }
 * }
 * ```
 */
export function isAuthenticatedRole(role: unknown): role is UserRole {
	return typeof role === "string" && (ALL_AUTHENTICATED_ROLES as readonly string[]).includes(role);
}

/**
 * Checks if user has any of the allowed roles
 * Handles both single role check and array of allowed roles
 *
 * @param userRole - The user's role to check
 * @param allowedRoles - Array of roles that are allowed
 * @returns True if user has any of the allowed roles
 *
 * @example
 * ```typescript
 * if (hasRole(user.role, ['gerente', 'residente'])) {
 *   // User is either gerente or residente
 * }
 * ```
 */
export function hasRole(
	userRole: UserRole | string,
	allowedRoles: UserRole[] | readonly UserRole[],
): boolean {
	if (!isAuthenticatedRole(userRole)) {
		return false;
	}
	return (allowedRoles as readonly string[]).includes(userRole);
}

/**
 * Normalizes a role string to a valid UserRole or null
 * Handles case variations (gerente/Gerente, hes/HES, etc.)
 *
 * @param role - Role string to normalize (can be any case)
 * @returns Normalized UserRole or null if invalid
 *
 * @example
 * ```typescript
 * normalizeUserRole('GERENTE'); // 'gerente'
 * normalizeUserRole('HES');     // 'hes'
 * normalizeUserRole('invalid'); // null
 * ```
 */
export function normalizeUserRole(role: unknown): UserRole | null {
	if (typeof role !== "string") {
		return null;
	}
	const normalized = role.toLowerCase().trim();
	return isAuthenticatedRole(normalized) ? normalized : null;
}
