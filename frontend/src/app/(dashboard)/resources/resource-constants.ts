/**
 * Resources Page — Constants
 */

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
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
	disponible:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	en_uso: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
	mantenimiento:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
	fuera_de_servicio:
		"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[color:var(--color-danger)]/15",
};
