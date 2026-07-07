"use client";

import type { LucideIcon } from "lucide-react";

interface Props {
	icon: LucideIcon;
	value: string | number;
	label: string;
	trend?: { value: number; isPositive: boolean };
	tooltip?: string;
}

export function KPIStatCard({ icon: Icon, value, label, trend, tooltip }: Props) {
	return (
		<div
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5"
			title={tooltip}
		>
			<div className="flex items-start justify-between">
				<span className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)]">
					<Icon className="size-5" aria-hidden="true" />
				</span>
				{trend && (
					<span
						className={`text-xs font-medium ${trend.isPositive ? "text-[#4CAF50]" : "text-[#F44336]"}`}
					>
						{trend.isPositive ? "+" : ""}
						{trend.value}%
					</span>
				)}
			</div>
			<p className="mt-4 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
				{value}
			</p>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
		</div>
	);
}
