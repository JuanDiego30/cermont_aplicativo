/**
 * Maintenance Edit Page — Constants and Helpers
 */

export const MAINTENANCE_TYPES = [
	{ value: "preventivo", label: "Preventivo" },
	{ value: "correctivo", label: "Correctivo" },
	{ value: "predictivo", label: "Predictivo" },
	{ value: "programado", label: "Programado" },
	{ value: "emergencia", label: "Emergencia" },
] as const;

export const MAINTENANCE_STATUSES = [
	{ value: "programado", label: "Programado" },
	{ value: "en_ejecucion", label: "En ejecución" },
	{ value: "completado", label: "Completado" },
	{ value: "cancelado", label: "Cancelado" },
	{ value: "vencido", label: "Vencido" },
	{ value: "pendiente_aprobacion", label: "Pendiente aprobación" },
] as const;

export const MAINTENANCE_PRIORITIES = [
	{ value: "baja", label: "Baja" },
	{ value: "media", label: "Media" },
	{ value: "alta", label: "Alta" },
	{ value: "critical", label: "Crítica" },
	{ value: "emergencia", label: "Emergencia" },
] as const;

export const FIELD_CLASS = "input-field mt-1";

export function toDateTimeLocal(date?: string | null) {
	if (!date) {
		return "";
	}
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) {
		return "";
	}
	const withOffset = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
	return withOffset.toISOString().slice(0, 16);
}
