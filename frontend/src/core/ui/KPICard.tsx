"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./AppIcon";

type KPIVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface KPICardProps {
	label: string;
	value: number | string;
	icon: LucideIcon;
	variant?: KPIVariant;
	onClick?: () => void;
	isLoading?: boolean;
	isEmpty?: boolean;
	isNA?: boolean;
	className?: string;
	sublabel?: string;
	emptyLabel?: string;
}

// Color del valor numérico solo cuando hay datos reales
const VALUE_COLOR: Record<KPIVariant, string> = {
	success: "text-[var(--status-success)]",
	warning: "text-[var(--status-warning)]",
	danger: "text-[var(--status-danger)]",
	info: "text-[var(--status-info)]",
	neutral: "text-[var(--text-primary)]",
};

// Borde sutil de la card — nunca opaco, siempre sutil
const CARD_BORDER: Record<KPIVariant, string> = {
	success: "border-[var(--status-success-muted)] hover:border-[var(--status-success)]/30",
	warning: "border-[var(--status-warning-muted)] hover:border-[var(--status-warning)]/30",
	danger: "border-[var(--status-danger-muted)] hover:border-[var(--status-danger)]/30",
	info: "border-[var(--status-info-muted)] hover:border-[var(--status-info)]/30",
	neutral: "border-[var(--border-subtle)] hover:border-[var(--border-default)]",
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
	onClick,
	isLoading,
	isEmpty,
	isNA,
	sublabel,
	className,
	emptyLabel,
}: KPICardProps) {
	const hasNoRealData = isEmpty || isNA || isLoading || value === 0 || value === "0" || value === "$0" || value === "—";
	const effectiveVariant = hasNoRealData ? "neutral" : variant;
	const displayValue = isLoading ? "—" : isNA ? "—" : isEmpty ? "—" : value;
	const displaySublabel = isLoading
		? "Cargando…"
		: isNA
			? "No aplica para este período"
			: isEmpty
				? (emptyLabel ?? "Sin datos disponibles")
				: sublabel;

	const content = (
		<>
			<div className="flex flex-col gap-1 min-w-0">
				<p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
					{label}
				</p>
				<p
					className={cn(
						"text-3xl font-bold tabular-nums leading-none",
						hasNoRealData ? "text-[var(--text-tertiary)]" : VALUE_COLOR[effectiveVariant],
					)}
				>
					{displayValue}
				</p>
				{displaySublabel && (
					<p className="text-xs text-[var(--text-muted)] truncate">{displaySublabel}</p>
				)}
			</div>
			<AppIcon
				icon={icon}
				size="lg"
				variant={hasNoRealData ? "muted" : ICON_VARIANT[effectiveVariant]}
				aria-hidden
			/>
		</>
	);

	if (onClick) {
		return (
			<button
				type="button"
				onClick={onClick}
				aria-label={label}
				className={cn(
					"flex w-full items-start justify-between rounded-xl border p-4 text-left",
					"bg-[var(--surface-primary)] transition-all duration-200",
					CARD_BORDER[effectiveVariant],
					"cursor-pointer",
					className,
				)}
			>
				{content}
			</button>
		);
	}

	return (
		<article
			className={cn(
				"flex items-start justify-between rounded-xl border p-4",
				"bg-[var(--surface-primary)] transition-all duration-200",
				CARD_BORDER[effectiveVariant],
				className,
			)}
		>
			{content}
		</article>
	);
}
