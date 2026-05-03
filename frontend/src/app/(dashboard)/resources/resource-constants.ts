/**
 * Resources Page — Constants
 */

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
	// English keys (shared-types canonical)
	tool: "Herramienta",
	vehicle: "Vehículo",
	equipment: "Equipo",
	// Spanish keys (API legacy fallback)
	material: "Material",
	herramienta: "Herramienta",
	equipo: "Equipo",
	epp: "EPP",
	repuesto: "Repuesto",
};

export const UNIT_LABELS: Record<string, string> = {
	unid: "Unidades",
	mtrs: "Metros",
	gls: "Galones",
	kg: "Kilogramos",
	lb: "Libras",
	otro: "Otro",
};

export const STATUS_STYLES: Record<string, string> = {
	// English keys (shared-types canonical)
	available:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	in_use: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	maintenance:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
	// Spanish keys (API legacy fallback)
	disponible:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	en_uso: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	fuera_de_servicio:
		"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[color:var(--color-danger)]/15",
};

export const STATUS_DISPLAY: Record<string, string> = {
	available: "Disponible",
	in_use: "En uso",
	maintenance: "Mantenimiento",
	disponible: "Disponible",
	en_uso: "En uso",
	mantenimiento: "Mantenimiento",
	fuera_de_servicio: "Fuera de servicio",
};
