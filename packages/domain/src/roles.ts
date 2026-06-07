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
	| "coord_administrativo"
	| "auxiliar_contable"
	| "supervisor"
	| "auxiliar_hes"
	| "supervisor_electricista"
	| "tecnico_electricista"
	| "operador"
	| "tecnico"
	| "oficial_construccion"
	| "administrativo"
	| "pasante"
	| "cliente";

/**
 * All authenticated roles as a readonly tuple for compile-time guarantees
 * Use this when you need to iterate over all roles or validate role membership
 */
export const ALL_AUTHENTICATED_ROLES = [
	"gerente",
	"residente",
	"hes",
	"coord_administrativo",
	"auxiliar_contable",
	"supervisor",
	"auxiliar_hes",
	"supervisor_electricista",
	"tecnico_electricista",
	"operador",
	"tecnico",
	"oficial_construccion",
	"administrativo",
	"pasante",
	"cliente",
] as const satisfies readonly UserRole[];

/**
 * Admin-only roles with full system access
 * Used for user management and system configuration
 */
export const ADMIN_ROLES = [
	"gerente",
	"administrativo",
	"coord_administrativo",
] as const satisfies readonly UserRole[];

/**
 * Resource management roles (orders, costs, proposals)
 * These roles can create, update, and manage work orders and resources
 */
export const RESOURCE_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"supervisor_electricista",
	"operador",
	"tecnico_electricista",
] as const satisfies readonly UserRole[];

/**
 * Report generation and approval roles
 * These roles can create technical reports and closure documents
 */
export const REPORT_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"supervisor_electricista",
	"operador",
	"tecnico",
	"tecnico_electricista",
	"administrativo",
] as const satisfies readonly UserRole[];

export const MANAGEMENT_ROLES = ["gerente", "residente"] as const satisfies readonly UserRole[];

export const APPROVER_ROLES = ["gerente", "supervisor"] as const satisfies readonly UserRole[];

export const MAINTENANCE_MANAGEMENT_ROLES = [
	"gerente",
	"residente",
	"hes",
	"auxiliar_hes",
] as const satisfies readonly UserRole[];

export const AI_ASSISTANT_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"coord_administrativo",
] as const satisfies readonly UserRole[];

/**
 * Intern / pasante roles — read-only access to dashboards and reports
 */
export const INTERN_ACCESS_ROLES = ["pasante"] as const satisfies readonly UserRole[];

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
	"supervisor_electricista",
	"coord_administrativo",
] as const satisfies readonly UserRole[];

export const FIELD_EXECUTION_ACCESS_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"supervisor_electricista",
	"operador",
	"tecnico",
	"tecnico_electricista",
	"oficial_construccion",
] as const satisfies readonly UserRole[];

export const EVIDENCE_ACCESS_ROLES = [
	"gerente",
	"residente",
	"hes",
	"auxiliar_hes",
	"supervisor",
	"supervisor_electricista",
	"operador",
	"tecnico",
	"tecnico_electricista",
	"oficial_construccion",
] as const satisfies readonly UserRole[];

export const BILLING_ACCESS_ROLES = [
	"gerente",
	"residente",
	"hes",
	"coord_administrativo",
	"auxiliar_contable",
	"administrativo",
	"cliente",
] as const satisfies readonly UserRole[];

export const FINANCE_ACCESS_ROLES = [
	"gerente",
	"coord_administrativo",
	"auxiliar_contable",
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
	"supervisor_electricista",
] as const satisfies readonly UserRole[];

export const SITE_VISIT_EXECUTION_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"supervisor_electricista",
	"tecnico",
	"tecnico_electricista",
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
	coord_administrativo: "Coordinador Administrativo",
	auxiliar_contable: "Auxiliar Contable",
	supervisor: "Supervisor",
	auxiliar_hes: "Auxiliar HES",
	supervisor_electricista: "Supervisor Electricista",
	tecnico_electricista: "Técnico Electricista",
	operador: "Operador",
	tecnico: "Técnico",
	oficial_construccion: "Oficial de Construcción",
	administrativo: "Administrativo",
	pasante: "Pasante",
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
	coord_administrativo: 2,
	supervisor: 3,
	hes: 4,
	auxiliar_contable: 5,
	supervisor_electricista: 6,
	tecnico_electricista: 7,
	operador: 8,
	tecnico: 9,
	auxiliar_hes: 10,
	oficial_construccion: 11,
	administrativo: 12,
	pasante: 13,
	cliente: 14,
} as const satisfies Record<UserRole, number>;

/**
 * Get the human-readable display name for a role.
 *
 * @param role - The role to get the name for
 * @returns Human-readable role name, or the input if role is unknown
 *
 * @example
 * ```typescript
 * getRoleName('gerente'); // "Gerente"
 * getRoleName('hes');     // "Coordinador HES"
 * getRoleName('invalid'); // "invalid"
 * ```
 */
export function getRoleName(role: string): string {
	return ROLE_LABELS[role as UserRole] ?? role;
}

/**
 * English-to-Spanish legacy role alias mapping.
 *
 * Used by {@link normalizeUserRole} to handle legacy English role references
 * (e.g., "manager" → "gerente", "technician" → "tecnico").
 *
 * @internal
 */
const ENGLISH_TO_SPANISH_ROLE: Record<string, UserRole> = {
	manager: "gerente",
	resident_engineer: "residente",
	hse_coordinator: "hes",
	coord_administrative: "coord_administrativo",
	accounting_assistant: "auxiliar_contable",
	supervisor: "supervisor",
	hse_assistant: "auxiliar_hes",
	electrician_supervisor: "supervisor_electricista",
	electrician_technician: "tecnico_electricista",
	operator: "operador",
	technician: "tecnico",
	construction_officer: "oficial_construccion",
	administrator: "administrativo",
	intern: "pasante",
	client: "cliente",
};

/**
 * Legacy role aliases for backward compatibility.
 * Maps English role names to canonical Spanish role values.
 *
 * @deprecated Use canonical Spanish role values directly.
 *   {@link normalizeUserRole} handles these automatically.
 */
export const LEGACY_ROLE_ALIASES = ENGLISH_TO_SPANISH_ROLE;

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
 * Type guard that accepts only string input (stricter than {@link isAuthenticatedRole}).
 *
 * Useful for mapping functions where the input is already known to be a string.
 *
 * @param role - String value to validate
 * @returns True if role is a valid UserRole
 *
 * @example
 * ```typescript
 * ["gerente", "invalid"].filter(isUserRoleInput); // ["gerente"]
 * ```
 */
export function isUserRoleInput(role: string): role is UserRole {
	return (ALL_AUTHENTICATED_ROLES as readonly string[]).includes(role);
}

/**
 * Normalizes a role string to a valid UserRole or null.
 * Handles case variations (gerente/Gerente, hes/HES, etc.)
 * and legacy English aliases (manager → gerente, technician → tecnico, etc.).
 *
 * @param role - Role string to normalize (can be any case, or English alias)
 * @returns Normalized UserRole or null if invalid
 *
 * @example
 * ```typescript
 * normalizeUserRole('GERENTE'); // 'gerente'
 * normalizeUserRole('HES');     // 'hes'
 * normalizeUserRole('manager'); // 'gerente' (legacy alias)
 * normalizeUserRole('invalid'); // null
 * ```
 */
/**
 * Default role used when normalization fails.
 * "cliente" is the safest default — limited permissions, no internal access.
 */
export const DEFAULT_USER_ROLE: UserRole = "cliente";

/**
 * Normalizes a role string to a valid UserRole or null.
 * Handles case variations (gerente/Gerente, hes/HES, etc.)
 * and legacy English aliases (manager → gerente, technician → tecnico, etc.).
 *
 * @param role - Role string to normalize (can be any case, or English alias)
 * @returns Normalized UserRole or null if invalid
 *
 * @example
 * ```typescript
 * normalizeUserRole('GERENTE'); // 'gerente'
 * normalizeUserRole('HES');     // 'hes'
 * normalizeUserRole('manager'); // 'gerente' (legacy alias)
 * normalizeUserRole('invalid'); // null
 * ```
 */
export function normalizeUserRole(role: unknown): UserRole | null {
	if (typeof role !== "string") {
		return null;
	}
	const normalized = role.toLowerCase().trim();
	if (isAuthenticatedRole(normalized)) {
		return normalized;
	}
	return ENGLISH_TO_SPANISH_ROLE[normalized] ?? null;
}

/**
 * Resolves a role input to a valid UserRole, falling back to DEFAULT_USER_ROLE.
 * Use this instead of inline `"cliente"` fallback strings.
 *
 * @param role - Unknown role input
 * @param fallback - Optional fallback role (defaults to DEFAULT_USER_ROLE)
 * @returns A valid UserRole, guaranteed
 *
 * @example
 * ```typescript
 * const role = resolveUserRole(input.role); // UserRole, never null
 * const role = resolveUserRole(input.role, "tecnico"); // with explicit fallback
 * ```
 */
export function resolveUserRole(role: unknown, fallback: UserRole = DEFAULT_USER_ROLE): UserRole {
	const normalized = normalizeUserRole(role);
	return normalized ?? fallback;
}

/**
 * Default initial role for new user creation forms.
 * "tecnico" is the most common starting role for new field workers.
 */
export const DEFAULT_NEW_USER_ROLE: UserRole = "tecnico";

/**
 * Checks if user has any of the allowed roles.
 * Handles both single role check and array of allowed roles.
 * Uses normalization for case-insensitive and alias-aware comparison.
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
 *
 * // Legacy aliases work too
 * hasRole('manager', ['gerente']); // true
 * ```
 */
export function hasRole(
	userRole: UserRole | string,
	allowedRoles: readonly (UserRole | string)[],
): boolean {
	const normalizedUserRole = normalizeUserRole(userRole);
	if (!normalizedUserRole) {
		return false;
	}
	return allowedRoles.some((role) => {
		const normalized = normalizeUserRole(role);
		return normalized !== null && normalized === normalizedUserRole;
	});
}
