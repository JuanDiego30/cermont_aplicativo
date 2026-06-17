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
		iconBg: "bg-brand-green/10",
		iconText: "text-brand-green",
		accent: "bg-brand-green",
	},
	green: {
		iconBg: "bg-brand-annotate/10",
		iconText: "text-brand-annotate",
		accent: "bg-brand-annotate",
	},
	amber: {
		iconBg: "bg-warning-bg",
		iconText: "text-brand-warn",
		accent: "bg-brand-warn",
	},
	red: {
		iconBg: "bg-danger-bg",
		iconText: "text-brand-error",
		accent: "bg-brand-error",
	},
	indigo: {
		iconBg: "bg-info-bg",
		iconText: "text-brand-tag",
		accent: "bg-brand-tag",
	},
	cyan: {
		iconBg: "bg-info-bg",
		iconText: "text-brand-tag",
		accent: "bg-brand-tag",
	},
};

interface KPICardProps {
	title: string;
	value: number | string;
	icon: ComponentType<{ className?: string }>;
	description?: string;
	trend?: { value: number; isPositive: boolean };
	sparkline?: number[];
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
	sparkline,
	color = "blue",
	format = "number",
	className,
}: KPICardProps) {
	const colors = COLOR_MAP[color];
	const cardRef = useRef<HTMLElement>(null);
	const valueRef = useRef<HTMLParagraphElement>(null);
	const numericTarget = typeof value === "number" ? value : null;
	const staticDisplay = typeof value === "string" ? value : formatValue(numericTarget ?? 0, format);

	useGSAP(
		() => {
			if (!valueRef.current) {
				return;
			}

			if (prefersReducedMotion()) {
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
				valueRef.current.textContent = formatValue(0, format);
				gsap.to(counter, {
					value: numericTarget,
					duration: 1.2,
					delay: 0.1,
					ease: "power2.out",
					onUpdate() {
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
				`${MOTION.card} group relative overflow-hidden rounded-[24px] border border-hairline bg-canvas p-6 shadow-card hover:border-hairline hover:shadow-md`,
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
								? "bg-success-bg text-brand-green-deep"
								: "bg-danger-bg text-brand-error",
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
				<h3 className="text-sm font-semibold text-charcoal uppercase tracking-wider font-mono">
					{title}
				</h3>
				<p
					ref={valueRef}
					suppressHydrationWarning
					className="mt-1 text-3xl font-bold tracking-tight text-ink"
				>
					{staticDisplay}
				</p>
				{description && (
					<p className="mt-2 text-xs font-medium text-slate truncate">{description}</p>
				)}
				{sparkline && sparkline.length > 1 ? (
					<KpiSparkline values={sparkline} label={`Tendencia de ${title}`} />
				) : null}
			</div>
		</article>
	);
}

function KpiSparkline({ values, label }: { values: number[]; label: string }) {
	const maximum = Math.max(...values, 1);
	const divisor = Math.max(values.length - 1, 1);
	const points = values
		.map((value, index) => `${(index / divisor) * 100},${30 - (value / maximum) * 26}`)
		.join(" ");

	return (
		<svg
			viewBox="0 0 100 32"
			role="img"
			aria-label={label}
			className="mt-4 h-8 w-full text-brand-green"
			preserveAspectRatio="none"
		>
			<polyline
				points={points}
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}
