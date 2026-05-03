import type { ActivityType, MaintenanceKit } from "@cermont/shared-types";
import { MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";

export const MAINTENANCE_KIT_ACTIVITY_OPTIONS: ReadonlyArray<{
	value: ActivityType;
	label: string;
}> = [
	{ value: "electrical", label: "Eléctrico" },
	{ value: "mechanical", label: "Mecánico" },
	{ value: "civil", label: "Civil" },
	{ value: "telecommunications", label: "Telecomunicaciones" },
	{ value: "hse", label: "HSE" },
] as const;

export const MAINTENANCE_KIT_ACTIVITY_LABELS: Record<ActivityType, string> = {
	electrical: "Eléctrico",
	mechanical: "Mecánico",
	civil: "Civil",
	telecommunications: "Telecomunicaciones",
	hse: "HSE",
} as const;

export const MAINTENANCE_KIT_ACTIVITY_COLORS: Record<ActivityType, string> = {
	electrical: "#2563eb",
	mechanical: "#0f766e",
	civil: "#16a34a",
	telecommunications: "#7c3aed",
	hse: "#ea580c",
} as const;

export const MAINTENANCE_KIT_VISIBILITY_OPTIONS = [
	{ value: "all", label: "Todos" },
	{ value: "active", label: "Activos" },
	{ value: "inactive", label: "Inactivos" },
] as const;

export const MAINTENANCE_KIT_CREATE_ROLES = MAINTENANCE_MANAGEMENT_ROLES;
export const MAINTENANCE_KIT_EDIT_ROLES = MANAGEMENT_ROLES;
export const MAINTENANCE_KIT_DELETE_ROLES = ["gerente"] as const;

export const DEFAULT_TOOL_ROW = {
	name: "",
	quantity: 1,
	specifications: "",
} as const;

export const DEFAULT_EQUIPMENT_ROW = {
	name: "",
	quantity: 1,
	certificateRequired: false,
} as const;

export const DEFAULT_PROCEDURE_STEP_ROW = {
	order: 1,
	description: "",
	type: "action",
	expectedValue: "",
	estimatedMinutes: 15,
	required: true,
} as const;

export const DEFAULT_MATERIAL_ROW = {
	name: "",
	sku: "",
	estimatedQuantity: 1,
	unit: "unit",
	estimatedUnitCost: 0,
	critical: false,
} as const;

export const DEFAULT_LINKED_CHECKLIST_ROW = {
	templateId: "",
	timing: "before_start",
	blocking: false,
} as const;

export const MAINTENANCE_CLASSIFICATION_OPTIONS = [
	{ value: "preventive", label: "Preventivo" },
	{ value: "corrective", label: "Correctivo" },
	{ value: "predictive", label: "Predictivo" },
	{ value: "inspection", label: "Inspección" },
	{ value: "overhaul", label: "Overhaul" },
] as const;

export const JOB_STEP_TYPE_OPTIONS = [
	{ value: "action", label: "Acción" },
	{ value: "measurement", label: "Medición" },
	{ value: "reading", label: "Lectura" },
	{ value: "photo_evidence", label: "Evidencia fotográfica" },
	{ value: "signature", label: "Firma" },
	{ value: "yes_no", label: "Pregunta sí/no" },
] as const;

export const MATERIAL_UNIT_OPTIONS = [
	{ value: "unit", label: "Unidad" },
	{ value: "meter", label: "Metro" },
	{ value: "liter", label: "Litro" },
	{ value: "kg", label: "Kg" },
	{ value: "roll", label: "Rollo" },
	{ value: "box", label: "Caja" },
] as const;

export const KIT_RISK_OPTIONS = [
	{ value: "low", label: "Bajo" },
	{ value: "medium", label: "Medio" },
	{ value: "high", label: "Alto" },
	{ value: "critical", label: "Crítico" },
] as const;

export const KIT_PPE_OPTIONS = [
	{ value: "helmet", label: "Casco" },
	{ value: "safety_glasses", label: "Gafas" },
	{ value: "dielectric_gloves", label: "Guantes dieléctricos" },
	{ value: "harness", label: "Arnés" },
	{ value: "steel_toe_boots", label: "Botas punta de acero" },
	{ value: "hearing_protection", label: "Protección auditiva" },
	{ value: "face_shield", label: "Careta facial" },
	{ value: "tyvek_suit", label: "Traje Tyvek" },
] as const;

export const KIT_PERMIT_OPTIONS = [
	{ value: "heights", label: "Trabajo en alturas" },
	{ value: "confined_space", label: "Espacio confinado" },
	{ value: "hot_work", label: "Trabajo en caliente" },
	{ value: "electrical_loto", label: "Trabajo eléctrico / LOTO" },
	{ value: "lifting", label: "Izaje de cargas" },
] as const;

export const KIT_SPECIFIC_RISK_OPTIONS = [
	{ value: "electrical", label: "Riesgo eléctrico" },
	{ value: "fall", label: "Caída" },
	{ value: "explosion", label: "Explosión" },
	{ value: "chemical_contamination", label: "Contaminación química" },
	{ value: "entrapment", label: "Atrapamiento" },
] as const;

export const REQUIRED_SPECIALTY_OPTIONS = [
	{ value: "", label: "Sin especialidad fija" },
	{ value: "electrician", label: "Técnico electricista" },
	{ value: "mechanic", label: "Técnico mecánico" },
	{ value: "welder", label: "Soldador" },
	{ value: "hes_specialist", label: "Especialista HES" },
	{ value: "instrumentation", label: "Técnico instrumentación" },
	{ value: "civil", label: "Técnico civil" },
	{ value: "telecom", label: "Técnico telecom" },
] as const;

export const CHECKLIST_TIMING_OPTIONS = [
	{ value: "before_start", label: "Antes de iniciar" },
	{ value: "during_execution", label: "Durante ejecución" },
	{ value: "after_finish", label: "Al finalizar" },
] as const;

export const DEFAULT_MAINTENANCE_KIT_ACTIVITY: ActivityType = "electrical";

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
