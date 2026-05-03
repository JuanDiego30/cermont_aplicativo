import { ALL_AUTHENTICATED_ROLES, ROLE_LABELS } from "@cermont/shared-types/rbac";

export const ROLES = ALL_AUTHENTICATED_ROLES.map((value) => ({
	value,
	label: ROLE_LABELS[value],
}));
