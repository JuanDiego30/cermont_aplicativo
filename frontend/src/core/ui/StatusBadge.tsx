import { cn } from "@/lib/utils";
import { STATUS_LABELS_ES } from "@/modules/core/lib/work-order-fsm";

const STATUS_CONFIG: Record<string, { label: string; className: string; dotClass?: string }> = {
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
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
	},
	on_hold: {
		label: "En Pausa",
		className:
			"bg-[var(--color-purple-bg)] text-[var(--color-purple)] ring-[var(--color-purple)]/15",
		dotClass: "bg-[var(--color-purple)]",
	},
	completed: {
		label: "Completada",
		className:
			"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
		dotClass: "bg-[var(--color-success)]",
	},
	closed: {
		label: "Cerrada",
		className:
			"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]",
		dotClass: "bg-[var(--text-muted)]",
	},
	cancelled: {
		label: "Cancelada",
		className:
			"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
		dotClass: "bg-[var(--color-danger)]",
	},
	"pend. aprobación": {
		label: "Pend. Aprobación",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
	},
	abierta: {
		label: "Abierta",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		dotClass: "bg-[var(--color-info)]",
	},
	pend_aprobacion: {
		label: "Pend. Aprobación",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		dotClass: "bg-[var(--color-warning)]",
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
			"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]",
		dotClass: "bg-[var(--text-muted)]",
	};

	return (
		<span
			data-testid="order-status-badge"
			className={cn(
				"motion-subtle inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-wider ring-1 ring-inset font-mono",
				config.className,
				className,
			)}
		>
			<span className={cn("size-1.5 rounded-full", config.dotClass)} aria-hidden="true" />
			{config.label}
		</span>
	);
}
