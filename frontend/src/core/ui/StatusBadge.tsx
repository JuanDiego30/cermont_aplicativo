import { STATUS_LABELS_ES } from "@cermont/shared-types";
import { cn } from "@/_shared/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string; dotClass?: string }> = {
	open: {
		label: "Abierta",
		className:
			"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	assigned: {
		label: "Asignada",
		className:
			"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	in_progress: {
		label: "En Progreso",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)] animate-pulse",
	},
	on_hold: {
		label: "En Pausa",
		className:
			"bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[color:var(--color-purple)]/15",
		dotClass: "bg-[var(--color-purple)]",
	},
	completed: {
		label: "Completada",
		className:
			"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
		dotClass: "bg-[var(--color-success)]",
	},
	closed: {
		label: "Cerrada",
		className:
			"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
		dotClass: "bg-[var(--text-tertiary)]",
	},
	cancelled: {
		label: "Cancelada",
		className:
			"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[color:var(--color-danger)]/15",
		dotClass: "bg-[var(--color-danger)]",
	},
	"pend. aprobacion": {
		label: "Pend. Aprobacion",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)] animate-pulse",
	},
	abierta: {
		label: "Abierta",
		className:
			"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	pend_aprobacion: {
		label: "Pend. Aprobacion",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)] animate-pulse",
	},
};

interface StatusBadgeProps {
	status: string;
	className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	const normStatus = status?.toLowerCase();
	const config = STATUS_CONFIG[normStatus] || {
		label: (STATUS_LABELS_ES as Record<string, string>)[normStatus] || status || "Desconocido",
		className:
			"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
		dotClass: "bg-[var(--text-tertiary)]",
	};

	return (
		<span
			data-testid="order-status-badge"
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset",
				config.className,
				className,
			)}
		>
			<span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
			{config.label}
		</span>
	);
}
