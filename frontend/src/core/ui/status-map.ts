/**
 * status-map.ts — Centralized status configuration for all CERMONT modules.
 *
 * Single source of truth for status → label + visual style mappings.
 * Every StatusBadge across the app reads from this map.
 */

export type StatusStyle = "ring-dot" | "border" | "flat";
export type StatusSize = "xs" | "sm" | "md";

export interface StatusConfig {
	label: string;
	className: string;
	dotClass?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
	// ── Core / Order statuses ──
	open: {
		label: "Abierta",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	assigned: {
		label: "Asignada",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	in_progress: {
		label: "En Progreso",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
	},
	on_hold: {
		label: "En Pausa",
		className: "bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[var(--color-purple)]/15",
		dotClass: "bg-[var(--color-purple)]",
	},
	completed: {
		label: "Completada",
		className: "bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
		dotClass: "bg-[var(--color-success)]",
	},
	closed: {
		label: "Cerrada",
		className: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]",
		dotClass: "bg-[var(--text-muted)]",
	},
	cancelled: {
		label: "Cancelada",
		className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
		dotClass: "bg-[var(--color-danger)]",
	},
	"pend. aprobación": {
		label: "Pend. Aprobación",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
	},
	abierta: {
		label: "Abierta",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	pend_aprobacion: {
		label: "Pend. Aprobación",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
	},

	// ── Invoice statuses ──
	not_created: {
		label: "No creado",
		className: "bg-[var(--surface-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]",
	},
	draft: {
		label: "Borrador",
		className: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
	},
	pending: {
		label: "Pendiente",
		className: "bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
	},
	submitted: {
		label: "Enviado",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/10",
	},
	approved: {
		label: "Aprobado",
		className: "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/10",
	},
	rejected: {
		label: "Rechazado",
		className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/10",
	},
	paid: {
		label: "Pagado",
		className: "bg-[var(--color-success-bg)] text-[var(--color-success)] border border-[var(--color-success)]/10",
	},

	// ── Evidence FSM statuses ──
	captured: {
		label: "Capturada",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/10",
	},
	uploaded: {
		label: "Subida",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/10",
	},
	pending_review: {
		label: "En revisión",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/10",
	},
	replacement_requested: {
		label: "Reemplazo solicitado",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/10",
	},
	locked: {
		label: "Bloqueada",
		className: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]",
	},
	archived: {
		label: "Archivada",
		className: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]",
	},

	// ── Execution session statuses ──
	ready: {
		label: "Listo",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] border border-[var(--color-info)]/10",
	},
	paused: {
		label: "Pausado",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/10",
	},
	sync_pending: {
		label: "Sync pendiente",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-[var(--color-warning)]/10",
	},
	sync_failed: {
		label: "Sync fallida",
		className: "bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/10",
	},

	// ── Proposal statuses ──
	sent: {
		label: "Enviada",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
	},
	expired: {
		label: "Expirada",
		className: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	},
};

const FALLBACK_CONFIG: StatusConfig = {
	label: "Desconocido",
	className: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]",
	dotClass: "bg-[var(--text-muted)]",
};

export function getStatusConfig(status: string): StatusConfig {
	return STATUS_MAP[status?.toLowerCase()] ?? FALLBACK_CONFIG;
}


