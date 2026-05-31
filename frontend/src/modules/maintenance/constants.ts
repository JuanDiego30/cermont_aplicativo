import { ADMIN_ROLES, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import type { ActivityType, MaintenanceKit } from "@cermont/shared-types";

export const MAINTENANCE_KIT_ACTIVITY_OPTIONS: ReadonlyArray<{
	value: ActivityType;
	label: string;
}> = [
	{ value: "electrico", label: "Eléctrico" },
	{ value: "mecanico", label: "Mecánico" },
	{ value: "civil", label: "Civil" },
	{ value: "telecomunicaciones", label: "Telecomunicaciones" },
	{ value: "hse", label: "HSE" },
] as const;

export const MAINTENANCE_KIT_ACTIVITY_LABELS: Record<ActivityType, string> = {
	electrico: "Eléctrico",
	mecanico: "Mecánico",
	civil: "Civil",
	telecomunicaciones: "Telecomunicaciones",
	hse: "HSE",
} as const;

export const MAINTENANCE_KIT_VISIBILITY_OPTIONS = [
	{ value: "all", label: "Todos" },
	{ value: "active", label: "Activos" },
	{ value: "inactive", label: "Inactivos" },
] as const;

export const MAINTENANCE_KIT_CREATE_ROLES = MAINTENANCE_MANAGEMENT_ROLES;
export const MAINTENANCE_KIT_EDIT_ROLES = MANAGEMENT_ROLES;
export const MAINTENANCE_KIT_DELETE_ROLES = ADMIN_ROLES;

export const DEFAULT_TOOL_ROW = {
	name: "",
	quantity: 1,
	specifications: "",
	customFieldsText: "",
} as const;

export const DEFAULT_EQUIPMENT_ROW = {
	name: "",
	quantity: 1,
	certificateRequired: false,
	customFieldsText: "",
} as const;

export const DEFAULT_MAINTENANCE_KIT_ACTIVITY: ActivityType = "electrico";

export function formatMaintenanceKitActivityLabel(activityType: ActivityType | string): string {
	return MAINTENANCE_KIT_ACTIVITY_LABELS[activityType as ActivityType] ?? activityType;
}

export function getMaintenanceKitItemCount(
	kit: Pick<MaintenanceKit, "tools" | "equipment">,
): number {
	return kit.tools.length + kit.equipment.length;
}

export function getMaintenanceKitToolCount(kit: Pick<MaintenanceKit, "tools">): number {
	return kit.tools.length;
}

export function getMaintenanceKitEquipmentCount(kit: Pick<MaintenanceKit, "equipment">): number {
	return kit.equipment.length;
}
