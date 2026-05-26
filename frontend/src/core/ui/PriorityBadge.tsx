import { ArrowDown, type ArrowRight, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BadgePill } from "./BadgePill";

const PRIORITY_CONFIG: Record<
	string,
	{ label: string; className: string; Icon: typeof ArrowRight }
> = {
	low: {
		label: "Baja",
		className:
			"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
		Icon: ArrowDown,
	},
	medium: {
		label: "Media",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		Icon: Minus,
	},
	high: {
		label: "Alta",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		Icon: ArrowUp,
	},
	critical: {
		label: "Crítica",
		className:
			"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
		Icon: ArrowUp,
	},
	baja: {
		label: "Baja",
		className:
			"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/15",
		Icon: ArrowDown,
	},
	media: {
		label: "Media",
		className: "bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/15",
		Icon: Minus,
	},
	alta: {
		label: "Alta",
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/15",
		Icon: ArrowUp,
	},
	critica: {
		label: "Crítica",
		className:
			"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/15",
		Icon: ArrowUp,
	},
};

interface PriorityBadgeProps {
	priority: string;
	className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
	const normPriority = priority?.toLowerCase();
	const config = PRIORITY_CONFIG[normPriority] || {
		label: priority || "Desconocido",
		className:
			"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-subtle)]",
		Icon: Minus,
	};

	const Icon = config.Icon;

	return (
		<BadgePill
			className={cn(
				"text-[12px] font-semibold uppercase tracking-wider font-mono",
				config.className,
				className,
			)}
			leadingIcon={<Icon className="size-3.5" aria-hidden="true" />}
		>
			{config.label}
		</BadgePill>
	);
}
