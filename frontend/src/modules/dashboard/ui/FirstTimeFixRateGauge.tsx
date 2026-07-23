"use client";

interface Props {
	percentage: number;
}

function getColor(pct: number): string {
	if (pct === 0) {
		return "text-muted-foreground";
	}
	if (pct >= 80) {
		return "text-brand-annotate";
	}
	if (pct >= 50) {
		return "text-brand-warn";
	}
	return "text-brand-error";
}

export function FirstTimeFixRateGauge({ percentage }: Props) {
	const color = getColor(percentage);
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (percentage / 100) * circumference;

	return (
		<div
			data-testid="first-time-fix-gauge"
			className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6"
		>
			<div className="relative">
				<svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
					<title>Porcentaje de resolución en primera visita</title>
					<circle
						cx="60"
						cy="60"
						r={radius}
						fill="none"
						stroke="var(--border-subtle)"
						strokeWidth="8"
					/>
					<circle
						cx="60"
						cy="60"
						r={radius}
						fill="none"
						stroke="currentColor"
						strokeWidth="8"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						className={color}
					/>
				</svg>
				<span
					className={`absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold tabular-nums ${color}`}
				>
					{percentage}%
				</span>
			</div>
			<p className="text-sm font-medium text-[var(--text-primary)]">First Time Fix Rate</p>
			<p
				className="text-xs text-[var(--text-secondary)]"
				title="Órdenes sin retorno / Total completadas"
			>
				Órdenes resueltas en primera visita
			</p>
		</div>
	);
}
