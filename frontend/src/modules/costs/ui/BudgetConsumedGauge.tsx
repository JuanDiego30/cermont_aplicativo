"use client";

interface Props {
	percentage: number;
	estimatedBudget: number;
	actualCost: number;
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function getColor(pct: number): { stroke: string; text: string; glow: boolean } {
	if (pct < 60) {
		return { stroke: "#4CAF50", text: "text-[#4CAF50]", glow: false };
	}
	if (pct < 80) {
		return { stroke: "#FFC107", text: "text-[#FFC107]", glow: false };
	}
	if (pct <= 100) {
		return { stroke: "#F44336", text: "text-[#F44336]", glow: false };
	}
	return { stroke: "#F44336", text: "text-[#F44336]", glow: true };
}

export function BudgetConsumedGauge({ percentage, estimatedBudget, actualCost }: Props) {
	const { stroke, text, glow } = getColor(percentage);
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const offset = Math.max(0, circumference - (Math.min(percentage, 150) / 100) * circumference);

	return (
		<div
			className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6"
			title={`Presupuesto estimado: ${COP.format(estimatedBudget)} · Real: ${COP.format(actualCost)}`}
		>
			<div className="relative">
				<svg
					width="120"
					height="120"
					viewBox="0 0 120 120"
					className="-rotate-90"
					role="img"
					aria-label={`Presupuesto consumido: ${percentage}%`}
				>
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
						stroke={stroke}
						strokeWidth="8"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						className={glow ? "animate-pulse" : ""}
					/>
				</svg>
				<span
					className={`absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold tabular-nums ${text}`}
				>
					{percentage}%
				</span>
			</div>
			<p className="text-sm font-medium text-[var(--text-primary)]">Presupuesto consumido</p>
			<p className="text-xs text-[var(--text-secondary)]">
				{COP.format(actualCost)} de {COP.format(estimatedBudget)}
			</p>
		</div>
	);
}
