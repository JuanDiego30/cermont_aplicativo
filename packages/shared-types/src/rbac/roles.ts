/**
 * Role definitions - Single Source of Truth.
 *
 * Canonical role values are Spanish (per DOC-04 §4.2).
 * This file must stay in sync with UserRoleSchema in user.schema.ts.
 *
 * @packageDocumentation
 */

// Spanish roles - canonical (must match UserRoleSchema in user.schema.ts)
export type UserRole =
	| "gerente"
	| "residente"
	| "hes"
	| "supervisor"
	| "operador"
	| "tecnico"
	| "administrativo"
	| "cliente";

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

export const ALL_USER_ROLE_INPUTS = ALL_AUTHENTICATED_ROLES;

export const ADMIN_ROLES = ["gerente", "administrativo"] as const satisfies readonly UserRole[];

export const RESOURCE_ROLES = [
	"gerente",
	"residente",
	"supervisor",
	"operador",
] as const satisfies readonly UserRole[];

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

export const AI_ASSISTANT_ROLES = [
	"gerente",
	"residente",
	"supervisor",
] as const satisfies readonly UserRole[];

export const MAINTENANCE_MANAGEMENT_ROLES = [
	"gerente",
	"residente",
	"hes",
] as const satisfies readonly UserRole[];

export const ADMIN_PLUS_RESIDENT_ENGINEER = [
	"gerente",
	"residente",
	"administrativo",
] as const satisfies readonly UserRole[];

export const ADMIN_PLUS_RESIDENTE = ADMIN_PLUS_RESIDENT_ENGINEER;

export const INTERNAL_ROLES = ALL_AUTHENTICATED_ROLES.filter(
	(role): role is Exclude<UserRole, "cliente"> => role !== "cliente",
) as readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
	gerente: "Gerente",
	residente: "Residente",
	hes: "HES",
	supervisor: "Supervisor",
	operador: "Operador",
	tecnico: "Técnico",
	administrativo: "Administrativo",
	cliente: "Cliente",
} as const satisfies Record<UserRole, string>;

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

export function isAuthenticatedRole(role: string): role is UserRole {
	return (ALL_AUTHENTICATED_ROLES as readonly string[]).includes(role);
}

export function isUserRoleInput(role: string): role is UserRole {
	return (ALL_USER_ROLE_INPUTS as readonly string[]).includes(role);
}

const ENGLISH_TO_SPANISH_ROLE: Record<string, UserRole> = {
	manager: "gerente",
	resident_engineer: "residente",
	hse_coordinator: "hes",
	supervisor: "supervisor",
	operator: "operador",
	technician: "tecnico",
	administrator: "administrativo",
	client: "cliente",
};

export const LEGACY_ROLE_ALIASES = ENGLISH_TO_SPANISH_ROLE;

export function normalizeUserRole(role: string): UserRole | false {
	const normalized = role.toLowerCase().trim();
	if (isUserRoleInput(normalized)) {
		return normalized as UserRole;
	}
	if (normalized in ENGLISH_TO_SPANISH_ROLE) {
		return ENGLISH_TO_SPANISH_ROLE[normalized];
	}
	return false;
}

export function hasRole(
	userRole: UserRole | string,
	allowedRoles: readonly (UserRole | string)[],
): boolean {
	const normalizedUserRole = normalizeUserRole(userRole);
	if (!normalizedUserRole) {
		return false;
	}
	return allowedRoles.some((role) => normalizeUserRole(role) === normalizedUserRole);
}
