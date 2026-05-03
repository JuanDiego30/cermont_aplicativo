/**
 * Role definitions - Single Source of Truth.
 *
 * Canonical role values are English. Legacy Spanish values are accepted at
 * input boundaries through normalizeUserRole and emitted as canonical values.
 *
 * @packageDocumentation
 */

export type UserRole =
	| "manager"
	| "resident_engineer"
	| "hse_coordinator"
	| "supervisor"
	| "operator"
	| "technician"
	| "administrator"
	| "client";

export type LegacyUserRole =
	| "gerente"
	| "residente"
	| "hes"
	| "operador"
	| "tecnico"
	| "administrativo"
	| "cliente";

export type UserRoleInput = UserRole | LegacyUserRole;

export const ALL_AUTHENTICATED_ROLES = [
	"manager",
	"resident_engineer",
	"hse_coordinator",
	"supervisor",
	"operator",
	"technician",
	"administrator",
	"client",
] as const satisfies readonly UserRole[];

export const LEGACY_AUTHENTICATED_ROLES = [
	"gerente",
	"residente",
	"hes",
	"operador",
	"tecnico",
	"administrativo",
	"cliente",
] as const satisfies readonly LegacyUserRole[];

export const ALL_USER_ROLE_INPUTS = [
	...ALL_AUTHENTICATED_ROLES,
	...LEGACY_AUTHENTICATED_ROLES,
] as const satisfies readonly UserRoleInput[];

export const LEGACY_ROLE_ALIASES = {
	gerente: "manager",
	residente: "resident_engineer",
	hes: "hse_coordinator",
	operador: "operator",
	tecnico: "technician",
	administrativo: "administrator",
	cliente: "client",
} as const satisfies Record<LegacyUserRole, UserRole>;

const ROLE_ALIASES = {
	manager: "manager",
	resident_engineer: "resident_engineer",
	hse_coordinator: "hse_coordinator",
	supervisor: "supervisor",
	operator: "operator",
	technician: "technician",
	administrator: "administrator",
	client: "client",
	...LEGACY_ROLE_ALIASES,
} as const satisfies Record<UserRoleInput, UserRole>;

export const ADMIN_ROLES = ["manager", "administrator"] as const satisfies readonly UserRole[];

export const RESOURCE_ROLES = [
	"manager",
	"resident_engineer",
	"supervisor",
	"operator",
] as const satisfies readonly UserRole[];

export const REPORT_ROLES = [
	"manager",
	"resident_engineer",
	"supervisor",
	"operator",
	"technician",
	"administrator",
] as const satisfies readonly UserRole[];

export const MANAGEMENT_ROLES = [
	"manager",
	"resident_engineer",
] as const satisfies readonly UserRole[];

export const APPROVER_ROLES = ["manager", "supervisor"] as const satisfies readonly UserRole[];

export const MAINTENANCE_MANAGEMENT_ROLES = [
	"manager",
	"resident_engineer",
	"hse_coordinator",
] as const satisfies readonly UserRole[];

export const ADMIN_PLUS_RESIDENT_ENGINEER = [
	"manager",
	"resident_engineer",
	"administrator",
] as const satisfies readonly UserRole[];

export const ADMIN_PLUS_RESIDENTE = ADMIN_PLUS_RESIDENT_ENGINEER;

export const INTERNAL_ROLES = ALL_AUTHENTICATED_ROLES.filter(
	(role): role is Exclude<UserRole, "client"> => role !== "client",
) as readonly UserRole[];

export const ROLE_LABELS: Record<UserRole, string> = {
	manager: "Manager",
	resident_engineer: "Resident Engineer",
	hse_coordinator: "HSE Coordinator",
	supervisor: "Supervisor",
	operator: "Operator",
	technician: "Technician",
	administrator: "Administrator",
	client: "Client",
} as const satisfies Record<UserRole, string>;

export const ROLE_HIERARCHY: Record<UserRole, number> = {
	manager: 0,
	resident_engineer: 1,
	supervisor: 2,
	hse_coordinator: 3,
	operator: 4,
	technician: 5,
	administrator: 6,
	client: 7,
} as const satisfies Record<UserRole, number>;

export function isAuthenticatedRole(role: string): role is UserRole {
	return (ALL_AUTHENTICATED_ROLES as readonly string[]).includes(role);
}

export function isUserRoleInput(role: string): role is UserRoleInput {
	return (ALL_USER_ROLE_INPUTS as readonly string[]).includes(role);
}

export function normalizeUserRole(role: string): UserRole | false {
	const normalized = role.toLowerCase().trim();
	if (!isUserRoleInput(normalized)) {
		return false;
	}
	return ROLE_ALIASES[normalized];
}

export function hasRole(
	userRole: UserRoleInput | string,
	allowedRoles: readonly (UserRoleInput | string)[],
): boolean {
	const normalizedUserRole = normalizeUserRole(userRole);
	if (!normalizedUserRole) {
		return false;
	}
	return allowedRoles.some((role) => normalizeUserRole(role) === normalizedUserRole);
}
