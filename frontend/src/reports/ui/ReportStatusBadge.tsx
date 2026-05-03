import type { ReportStatus } from "@cermont/shared-types";
import { cn } from "@/_shared/lib/utils";
import { BadgePill } from "@/core/ui/BadgePill";

const STATUS_CONFIG: Record<ReportStatus, { label: string; className: string; dotClass: string }> =
	{
		draft: {
			label: "Borrador",
			className:
				"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
			dotClass: "bg-[var(--text-tertiary)]",
		},
		pending_review: {
			label: "En revisión",
			className:
				"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
			dotClass: "bg-[var(--color-warning)]",
		},
		approved: {
			label: "Aprobado",
			className:
				"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
			dotClass: "bg-[var(--color-success)]",
		},
		rejected: {
			label: "Rechazado",
			className:
				"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[color:var(--color-danger)]/15",
			dotClass: "bg-[var(--color-danger)]",
		},
	};

interface ReportStatusBadgeProps {
	status: ReportStatus;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
	const config = STATUS_CONFIG[status];

	return (
		<BadgePill
			testId="report-status-badge"
			className={cn("text-xs font-semibold", config.className)}
			dotClassName={config.dotClass}
		>
			{config.label}
		</BadgePill>
	);
}
