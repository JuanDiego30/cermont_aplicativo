import { ORDER_PRIORITY_LABELS_ES, type OrderPriority } from "@cermont/shared-types";
import { ArrowDown, type ArrowRight, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/_shared/lib/utils";
import { BadgePill } from "./BadgePill";

const PRIORITY_CONFIG: Record<
	OrderPriority,
	{ label: string; className: string; Icon: typeof ArrowRight }
> = {
	low: {
		label: ORDER_PRIORITY_LABELS_ES.low,
		className:
			"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
		Icon: ArrowDown,
	},
	medium: {
		label: ORDER_PRIORITY_LABELS_ES.medium,
		className:
			"bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[color:var(--color-info)]/15",
		Icon: Minus,
	},
	high: {
		label: ORDER_PRIORITY_LABELS_ES.high,
		className:
			"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
		Icon: ArrowUp,
	},
	critical: {
		label: ORDER_PRIORITY_LABELS_ES.critical,
		className:
			"bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[color:var(--color-danger)]/15",
		Icon: ArrowUp,
	},
};

function isOrderPriority(value: string): value is OrderPriority {
	return value in PRIORITY_CONFIG;
}

interface PriorityBadgeProps {
	priority: string;
	className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
	const normPriority = priority?.toLowerCase();
	const config = isOrderPriority(normPriority)
		? PRIORITY_CONFIG[normPriority]
		: {
				label: priority || "Desconocido",
				className:
					"bg-[var(--surface-secondary)] text-[var(--text-secondary)] ring-[color:var(--border-default)]/20",
				Icon: Minus,
			};

	const Icon = config.Icon;

	return (
		<BadgePill
			className={cn(
				"text-[11px] font-semibold uppercase tracking-[0.14em]",
				config.className,
				className,
			)}
			leadingIcon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
		>
			{config.label}
		</BadgePill>
	);
}
