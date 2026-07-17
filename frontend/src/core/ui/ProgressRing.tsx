"use client";

import { cn } from "@/lib/utils";

type ProgressRingSize = "sm" | "md" | "lg";

interface ProgressRingProps {
	value: number;
	max?: number;
	size?: ProgressRingSize;
	label?: string;
	showPercentage?: boolean;
	className?: string;
	"aria-label"?: string;
}

const SIZE_CONFIG: Record<
	ProgressRingSize,
	{ dimension: number; stroke: number; fontSize: string }
> = {
	sm: { dimension: 48, stroke: 4, fontSize: "text-xs" },
	md: { dimension: 64, stroke: 5, fontSize: "text-sm" },
	lg: { dimension: 80, stroke: 6, fontSize: "text-base" },
};

function getProgressColor(percent: number): string {
	if (percent < 30) {
		return "var(--status-danger)";
	}
	if (percent < 70) {
		return "var(--status-warning)";
	}
	return "var(--status-success)";
}

export function ProgressRing({
	value,
	max = 100,
	size = "md",
	label,
	showPercentage = false,
	className,
	"aria-label": ariaLabel = "Progreso",
}: ProgressRingProps) {
	const config = SIZE_CONFIG[size];
	const percent = Math.min(Math.round((value / max) * 100), 100);
	const radius = (config.dimension - config.stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percent / 100) * circumference;
	const progressColor = getProgressColor(percent);

	return (
		<div
			className={cn("relative inline-flex items-center justify-center", className)}
			role="progressbar"
			aria-valuenow={percent}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label={ariaLabel}
			data-testid="progress-ring"
			style={{ width: config.dimension, height: config.dimension }}
		>
			<svg
				width={config.dimension}
				height={config.dimension}
				viewBox={`0 0 ${config.dimension} ${config.dimension}`}
				className="-rotate-90"
				role="img"
				aria-label={`Progreso: ${percent}%`}
			>
				<circle
					cx={config.dimension / 2}
					cy={config.dimension / 2}
					r={radius}
					fill="none"
					stroke="var(--border-default)"
					strokeWidth={config.stroke}
				/>
				<circle
					cx={config.dimension / 2}
					cy={config.dimension / 2}
					r={radius}
					fill="none"
					stroke={progressColor}
					strokeWidth={config.stroke}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					style={{
						transition: "stroke-dashoffset 600ms ease-out",
					}}
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				{showPercentage && (
					<span
						className={cn("font-bold tabular-nums text-[var(--text-primary)]", config.fontSize)}
					>
						{percent}%
					</span>
				)}
				{label && (
					<span className="text-[10px] text-[var(--text-secondary)] truncate max-w-full px-1">
						{label}
					</span>
				)}
			</div>
		</div>
	);
}
