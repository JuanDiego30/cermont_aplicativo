import { MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import type {
	KitActivityType,
	KitRiskLevel,
	KitServiceCategory,
	KitStatus,
	KitTemplate,
} from "@cermont/shared-types";

// ─── RBAC ──────────────────────────────────────────────────────────────────

export const KIT_CREATE_ROLES = MAINTENANCE_MANAGEMENT_ROLES;
export const KIT_MANAGE_ROLES = MANAGEMENT_ROLES;

// ─── Activity Options ──────────────────────────────────────────────────────

export const KIT_ACTIVITY_OPTIONS: ReadonlyArray<{ value: KitActivityType; label: string }> = [
	{ value: "electrico", label: "Eléctrico" },
	{ value: "mecanico", label: "Mecánico" },
	{ value: "civil", label: "Civil" },
	{ value: "instrumentacion", label: "Instrumentación" },
	{ value: "telecomunicaciones", label: "Telecomunicaciones" },
	{ value: "hse", label: "HSE" },
	{ value: "general", label: "General" },
];

export const KIT_ACTIVITY_LABELS: Record<KitActivityType, string> = {
	electrico: "Eléctrico",
	mecanico: "Mecánico",
	civil: "Civil",
	instrumentacion: "Instrumentación",
	telecomunicaciones: "Telecomunicaciones",
	hse: "HSE",
	general: "General",
} as const;

export function formatKitActivityLabel(activity: KitActivityType | string): string {
	return KIT_ACTIVITY_LABELS[activity as KitActivityType] ?? activity;
}

// ─── Status Options ────────────────────────────────────────────────────────

export const KIT_STATUS_OPTIONS: ReadonlyArray<{ value: KitStatus; label: string }> = [
	{ value: "draft", label: "Borrador" },
	{ value: "active", label: "Activo" },
	{ value: "archived", label: "Archivado" },
	{ value: "voided", label: "Anulado" },
];

export const KIT_STATUS_LABELS: Record<KitStatus, string> = {
	draft: "Borrador",
	active: "Activo",
	archived: "Archivado",
	voided: "Anulado",
} as const;

export function formatKitStatusLabel(status: KitStatus | string): string {
	return KIT_STATUS_LABELS[status as KitStatus] ?? status;
}

// ─── Service Category Options ─────────────────────────────────────────────

export const KIT_SERVICE_CATEGORY_OPTIONS: ReadonlyArray<{
	value: KitServiceCategory;
	label: string;
}> = [
	{ value: "mantenimiento", label: "Mantenimiento" },
	{ value: "instalacion", label: "Instalación" },
	{ value: "inspeccion", label: "Inspección" },
	{ value: "reparacion", label: "Reparación" },
	{ value: "construccion", label: "Construcción" },
	{ value: "montaje", label: "Montaje" },
	{ value: "limpieza", label: "Limpieza" },
	{ value: "otro", label: "Otro" },
];

export const KIT_SERVICE_CATEGORY_LABELS: Record<KitServiceCategory, string> = {
	mantenimiento: "Mantenimiento",
	instalacion: "Instalación",
	inspeccion: "Inspección",
	reparacion: "Reparación",
	construccion: "Construcción",
	montaje: "Montaje",
	limpieza: "Limpieza",
	otro: "Otro",
};

export function formatKitServiceCategory(category: KitServiceCategory | string): string {
	return KIT_SERVICE_CATEGORY_LABELS[category as KitServiceCategory] ?? category;
}

// ─── Risk Options ──────────────────────────────────────────────────────────

export const KIT_RISK_OPTIONS: ReadonlyArray<{ value: KitRiskLevel; label: string }> = [
	{ value: "low", label: "Bajo" },
	{ value: "medium", label: "Medio" },
	{ value: "high", label: "Alto" },
	{ value: "critical", label: "Crítico" },
];

export const KIT_RISK_LABELS: Record<KitRiskLevel, string> = {
	low: "Bajo",
	medium: "Medio",
	high: "Alto",
	critical: "Crítico",
} as const;

export function formatKitRiskLabel(risk: KitRiskLevel | string): string {
	return KIT_RISK_LABELS[risk as KitRiskLevel] ?? risk;
}

// ─── Count Helpers ─────────────────────────────────────────────────────────

export function getKitItemCount(
	kit: Pick<
		KitTemplate,
		| "tools"
		| "electricalTools"
		| "constructionEquipment"
		| "heightSafetyKit"
		| "materials"
		| "epp"
		| "instruments"
		| "vehicles"
	>,
): number {
	return (
		(kit.tools?.length ?? 0) +
		(kit.electricalTools?.length ?? 0) +
		(kit.constructionEquipment?.length ?? 0) +
		(kit.heightSafetyKit?.length ?? 0) +
		(kit.materials?.length ?? 0) +
		(kit.epp?.length ?? 0) +
		(kit.instruments?.length ?? 0) +
		(kit.vehicles?.length ?? 0)
	);
}
