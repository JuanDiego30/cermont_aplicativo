"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TrendingDown, TrendingUp } from "lucide-react";
import { type ComponentType, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";

gsap.registerPlugin(useGSAP);

type ColorVariant = "blue" | "green" | "amber" | "red" | "indigo" | "cyan";

const COLOR_MAP: Record<ColorVariant, { iconBg: string; iconText: string; accent: string }> = {
	blue: {
		iconBg: "bg-[var(--color-cermont-blue-bg)]",
		iconText: "text-[var(--color-cermont-blue)]",
		accent: "bg-[var(--color-cermont-blue)]",
	},
	green: {
		iconBg: "bg-[var(--color-cermont-green-bg)]",
		iconText: "text-[var(--color-cermont-green)]",
		accent: "bg-[var(--color-cermont-green)]",
	},
	amber: {
		iconBg: "bg-[var(--color-warning-bg)]",
		iconText: "text-[var(--color-warning)]",
		accent: "bg-[var(--color-warning)]",
	},
	red: {
		iconBg: "bg-[var(--color-danger-bg)]",
		iconText: "text-[var(--color-danger)]",
		accent: "bg-[var(--color-danger)]",
	},
	indigo: {
		iconBg: "bg-[var(--color-info-bg)]",
		iconText: "text-[var(--color-info)]",
		accent: "bg-[var(--color-info)]",
	},
	cyan: {
		iconBg: "bg-[var(--color-info-bg)]",
		iconText: "text-[var(--color-info)]",
		accent: "bg-[var(--color-info)]",
	},
};

interface KPICardProps {
	title: string;
	value: number | string;
	icon: ComponentType<{ className?: string }>;
	description?: string;
	trend?: { value: number; isPositive: boolean };
	color?: ColorVariant;
	format?: "number" | "currency";
	className?: string;
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
	className,
}: KPICardProps) {
	const colors = COLOR_MAP[color];
	const cardRef = useRef<HTMLElement>(null);
	const numericTarget = typeof value === "number" ? value : null;
	const [displayVal, setDisplayVal] = useState(numericTarget !== null ? 0 : value);

	// Card entrance + counter animation
	useGSAP(
		() => {
			if (prefersReducedMotion()) {
				if (numericTarget !== null) {
					setDisplayVal(formatValue(numericTarget, format));
				}
				return;
			}

			gsap.from(cardRef.current, {
				opacity: 0,
				y: 20,
				duration: 0.5,
				ease: "power2.out",
			});

			if (numericTarget !== null) {
				const counter = { value: 0 };
				gsap.to(counter, {
					value: numericTarget,
					duration: 1.2,
					delay: 0.1,
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
		{ scope: cardRef, dependencies: [value] },
	);

	const displayString = typeof value === "string" ? value : (displayVal as string);

	return (
		<article
			ref={cardRef}
			className={cn(
				"group relative overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-card transition-all hover:shadow-md hover:border-[var(--border-medium)]",
				className,
			)}
		>
			<div
				className={cn(
					"absolute top-0 left-0 h-1 w-full opacity-0 transition-opacity group-hover:opacity-100",
					colors.accent,
				)}
			/>

			<div className="flex items-start justify-between">
				<div
					className={cn(
						"flex size-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
						colors.iconBg,
						colors.iconText,
					)}
				>
					<Icon className="size-6" />
				</div>
				{trend && (
					<output
						className={cn(
							"flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold font-mono",
							trend.isPositive
								? "bg-(--color-success-bg) text-brand-green-deep"
								: "bg-(--color-danger-bg) text-(--color-danger)",
						)}
					>
						{trend.isPositive ? (
							<TrendingUp className="size-3" aria-hidden="true" />
						) : (
							<TrendingDown className="size-3" aria-hidden="true" />
						)}
						{trend.value}%
					</output>
				)}
			</div>

			<div className="mt-5">
				<h3 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wider font-mono">
					{title}
				</h3>
				<p className="mt-1 text-3xl font-bold tracking-tight text-(--text-primary)">
					{displayString}
				</p>
				{description && (
					<p className="mt-2 text-xs font-medium text-(--text-tertiary) truncate">
						{description}
					</p>
				)}
			</div>
		</article>
	);
}
