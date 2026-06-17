/**
 * Resources Page — Constants & Labels
 *
 * Source of truth for UI labels matching the expanded ResourceTypeEnum
 * from @cermont/shared-types.
 */

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
	tool: "Herramienta",
	vehicle: "Vehículo",
	equipment: "Equipo",
	material: "Material",
	safety_item: "EPP / Seguridad",
	labor_role: "Rol Laboral",
	certification_requirement: "Certificación",
	spare_part: "Repuesto",
};

export const RESOURCE_TYPE_ORDER: string[] = [
	"tool",
	"equipment",
	"vehicle",
	"material",
	"safety_item",
	"spare_part",
	"labor_role",
	"certification_requirement",
];

export const UNIT_LABELS: Record<string, string> = {
	unidad: "Unidades",
	metro: "Metros",
	litro: "Litros",
	kilogramo: "Kilogramos",
	libra: "Libras",
	galon: "Galones",
	caja: "Caja",
	rollo: "Rollo",
	par: "Par",
	juego: "Juego",
	kit: "Kit",
};

export const STATUS_STYLES: Record<string, string> = {
	available:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
	assigned: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
	maintenance:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
	expired: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
	inactive:
		"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]/30",
};

export const STATUS_LABELS: Record<string, string> = {
	available: "Disponible",
	assigned: "Asignado",
	maintenance: "Mantenimiento",
	expired: "Vencido",
	inactive: "Inactivo",
};
