import type { PlanningResponsible } from "@cermont/shared-types";

const RESPONSIBLE_ROLES: Array<{ role: PlanningResponsible["role"]; label: string }> = [
	{ role: "ingeniero_residente", label: "Ing. Residente" },
	{ role: "tecnico_electricista", label: "Técnico Electricista" },
	{ role: "hes", label: "Coordinador HES" },
];

export function getDefaultResponsibles(): PlanningResponsible[] {
	return RESPONSIBLE_ROLES.map((r) => ({
		role: r.role,
		name: "",
		status: "pending" as const,
	}));
}
