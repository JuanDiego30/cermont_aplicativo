"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { TrendingDown, TrendingUp } from "lucide-react";
import { type ComponentType, useRef } from "react";
import { MOTION } from "@/components/motion/motion-classes";
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
	// Direct DOM ref for the counter — we write textContent on every frame
	// instead of calling setState. This prevents ~72 React re-renders per
	// 1.2s animation and removes a major source of jank.
	const valueRef = useRef<HTMLParagraphElement>(null);
	const numericTarget = typeof value === "number" ? value : null;
	const staticDisplay = typeof value === "string" ? value : formatValue(numericTarget ?? 0, format);

	// Card entrance + counter animation
	useGSAP(
		() => {
			if (!valueRef.current) {
				return;
			}

			if (prefersReducedMotion()) {
				// Paint the final value once; no animation.
				if (numericTarget !== null) {
					valueRef.current.textContent = formatValue(numericTarget, format);
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
				// Seed the DOM node so we don't render "0" briefly.
				valueRef.current.textContent = formatValue(0, format);
				gsap.to(counter, {
					value: numericTarget,
					duration: 1.2,
					delay: 0.1,
					ease: "power2.out",
					onUpdate() {
						// Direct DOM mutation — bypass React reconciliation.
						if (valueRef.current) {
							valueRef.current.textContent = formatValue(counter.value, format);
						}
					},
					onComplete() {
						if (valueRef.current) {
							valueRef.current.textContent = formatValue(numericTarget, format);
						}
					},
				});
			}
		},
		{ scope: cardRef, dependencies: [value] },
	);

	return (
		<article
			ref={cardRef}
			className={cn(
				`${MOTION.card} group relative overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-card hover:border-[var(--border-medium)] hover:shadow-md`,
				className,
			)}
		>
			<div
				className={cn(
					"absolute left-0 top-0 h-1 w-full opacity-0 transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:opacity-100",
					colors.accent,
				)}
			/>

			<div className="flex items-start justify-between">
				<div
					className={cn(
						"flex size-12 items-center justify-center rounded-2xl transition-transform duration-[var(--duration-fast)] ease-[var(--ease-emphasized)] group-hover:scale-110",
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
				<p
					ref={valueRef}
					// For string values we render the static text;
					// for numeric targets GSAP overwrites textContent on every frame.
					suppressHydrationWarning
					className="mt-1 text-3xl font-bold tracking-tight text-(--text-primary)"
				>
					{staticDisplay}
				</p>
				{description && (
					<p className="mt-2 text-xs font-medium text-(--text-tertiary) truncate">{description}</p>
				)}
			</div>
		</article>
	);
}
