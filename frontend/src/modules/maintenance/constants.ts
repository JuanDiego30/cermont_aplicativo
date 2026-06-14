import type { ActivityType } from "@cermont/shared-types";

const MAINTENANCE_KIT_ACTIVITY_LABELS: Record<ActivityType, string> = {
	electrico: "Eléctrico",
	mecanico: "Mecánico",
	civil: "Civil",
	telecomunicaciones: "Telecomunicaciones",
	hse: "HSE",
} as const;

export function formatMaintenanceKitActivityLabel(activityType: ActivityType | string): string {
	return MAINTENANCE_KIT_ACTIVITY_LABELS[activityType as ActivityType] ?? activityType;
}
