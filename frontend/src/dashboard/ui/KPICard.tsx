"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TrendingDown, TrendingUp } from "lucide-react";
import { type ComponentType, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

type ColorVariant = "blue" | "green" | "amber" | "red" | "indigo" | "cyan";

const COLOR_MAP: Record<ColorVariant, { iconBg: string; iconText: string }> = {
	blue: { iconBg: "bg-[var(--color-info-bg)]", iconText: "text-[var(--color-info)]" },
	green: { iconBg: "bg-[var(--color-success-bg)]", iconText: "text-[var(--color-success)]" },
	amber: { iconBg: "bg-[var(--color-warning-bg)]", iconText: "text-[var(--color-warning)]" },
	red: { iconBg: "bg-[var(--color-danger-bg)]", iconText: "text-[var(--color-danger)]" },
	indigo: { iconBg: "bg-[var(--color-purple-bg)]", iconText: "text-[var(--color-purple)]" },
	cyan: { iconBg: "bg-[var(--color-info-bg)]", iconText: "text-[var(--color-info)]" },
};

interface KPICardProps {
	title: string;
	value: number | string;
	icon: ComponentType<{ className?: string }>;
	description?: string;
	trend?: { value: number; isPositive: boolean };
	color?: ColorVariant;
	format?: "number" | "currency";
}

function formatValue(val: number, fmt: "number" | "currency" = "number"): string {
	if (fmt === "currency") {
		if (val >= 1_000_000) {
			return `$${(val / 1_000_000).toFixed(1)}M`;
		}
		return `$${Math.round(val).toLocaleString("es-CO")}`;
	}
	return Math.round(val).toLocaleString("es-CO");
}

export function KPICard({
	title,
	value,
	icon: Icon,
	description,
	trend,
	color = "blue",
	format = "number",
}: KPICardProps) {
	const colors = COLOR_MAP[color];
	const cardRef = useRef<HTMLElement>(null);
	const numericTarget = typeof value === "number" ? value : null;
	const [displayVal, setDisplayVal] = useState(numericTarget !== null ? 0 : value);

	// Card entrance + counter animation
	useGSAP(
		() => {
			gsap.from(cardRef.current, {
				opacity: 0,
				y: 24,
				scale: 0.96,
				duration: 0.55,
				ease: "power2.out",
				clearProps: "all",
			});

			if (numericTarget !== null) {
				const counter = { value: 0 };
				gsap.to(counter, {
					value: numericTarget,
					duration: 1.4,
					delay: 0.2,
					ease: "power2.out",
					onUpdate() {
						setDisplayVal(formatValue(counter.value, format));
					},
					onComplete() {
						setDisplayVal(formatValue(numericTarget, format));
					},
				});
			}
		},
		{ scope: cardRef, dependencies: [] },
	);

	const displayString: string =
		typeof value === "string"
			? value
			: typeof displayVal === "string"
				? displayVal
				: formatValue(numericTarget ?? 0, format);

	return (
		<article
			ref={cardRef}
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
		>
			<div className="flex items-start justify-between">
				<div
					className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] ${colors.iconBg}`}
				>
					<Icon className={`h-5 w-5 ${colors.iconText}`} />
				</div>
				{trend && (
					<span
						role="status"
						aria-label={
							trend.isPositive
								? `Incremento del ${Math.abs(trend.value)}%`
								: `Descenso del ${Math.abs(trend.value)}%`
						}
						className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
							trend.isPositive
								? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
								: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
						}`}
					>
						{trend.isPositive ? (
							<TrendingUp className="h-3 w-3" aria-hidden="true" />
						) : (
							<TrendingDown className="h-3 w-3" aria-hidden="true" />
						)}
						{Math.abs(trend.value)}%
					</span>
				)}
			</div>

			<div className="mt-4">
				<p className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
					{displayString}
				</p>
				<p className="mt-1 text-sm font-semibold text-[var(--text-secondary)]">{title}</p>
				{description && <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{description}</p>}
			</div>
		</article>
	);
}
