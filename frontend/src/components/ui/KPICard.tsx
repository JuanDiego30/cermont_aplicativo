import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./AppIcon";

type KPIVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface KPICardProps {
	label: string;
	value: number | string;
	icon: LucideIcon;
	variant?: KPIVariant;
	sublabel?: string;
	onClick?: () => void;
	isLoading?: boolean;
	className?: string;
}

const VALUE_COLOR: Record<KPIVariant, string> = {
	success: "text-[var(--status-success)]",
	warning: "text-[var(--status-warning)]",
	danger: "text-[var(--status-danger)]",
	info: "text-[var(--status-info)]",
	neutral: "text-[var(--text-primary)]",
};

const CARD_BORDER: Record<KPIVariant, string> = {
	success: "border-[var(--status-success-muted)] hover:border-[var(--status-success)]/30",
	warning: "border-[var(--status-warning-muted)] hover:border-[var(--status-warning)]/30",
	danger: "border-[var(--status-danger-muted)]  hover:border-[var(--status-danger)]/30",
	info: "border-[var(--status-info-muted)]     hover:border-[var(--status-info)]/30",
	neutral: "border-[var(--border-subtle)]         hover:border-[var(--border-default)]",
};

const ICON_VARIANT: Record<KPIVariant, "success" | "warning" | "danger" | "active" | "muted"> = {
	success: "success",
	warning: "warning",
	danger: "danger",
	info: "active",
	neutral: "muted",
};

export function KPICard({
	label,
	value,
	icon,
	variant = "neutral",
	sublabel,
	onClick,
	isLoading = false,
	className,
}: KPICardProps) {
	const isEmpty = value === 0 || value === "0" || value === "$0";
	const displayValue = isLoading ? "—" : value;

	const content = (
		<>
			<div className="flex flex-col gap-1 min-w-0 text-left">
				<p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
					{label}
				</p>
				<p
					className={cn(
						"text-3xl font-bold tabular-nums leading-none",
						isEmpty ? "text-[var(--text-secondary)]" : VALUE_COLOR[variant],
					)}
				>
					{displayValue}
				</p>
				{sublabel && <p className="text-xs text-[var(--text-muted)] truncate">{sublabel}</p>}
			</div>
			<AppIcon
				icon={icon}
				size="lg"
				variant={isEmpty ? "muted" : ICON_VARIANT[variant]}
				aria-hidden
			/>
		</>
	);

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				onKeyDown={(e) => e.key === "Enter" && onClick()}
				className={cn(
					"flex items-start justify-between p-4 rounded-xl border w-full",
					"bg-[var(--bg-card)] transition-all duration-200",
					CARD_BORDER[variant],
					"cursor-pointer select-none",
					className,
				)}
			>
				{content}
			</button>
		);
	}

	return (
		<div
			className={cn(
				"flex items-start justify-between p-4 rounded-xl border",
				"bg-[var(--bg-card)] transition-all duration-200",
				CARD_BORDER[variant],
				className,
			)}
		>
			{content}
		</div>
	);
}
