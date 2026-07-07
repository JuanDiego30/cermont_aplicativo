"use client";

interface Props {
	totalRevenue: number;
	totalCost: number;
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function MarginSummaryCard({ totalRevenue, totalCost }: Props) {
	const margin = totalRevenue - totalCost;
	const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
	const isPositive = margin > 0;

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
			<p className="text-sm font-medium text-[var(--text-secondary)]">Resumen de margen</p>
			<div className="mt-3 grid grid-cols-2 gap-4">
				<div>
					<p className="text-xs text-[var(--text-tertiary)]">Ingreso total</p>
					<p className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
						{COP.format(totalRevenue)}
					</p>
				</div>
				<div>
					<p className="text-xs text-[var(--text-tertiary)]">Costo total real</p>
					<p className="font-mono text-lg font-semibold tabular-nums text-[var(--text-primary)]">
						{COP.format(totalCost)}
					</p>
				</div>
			</div>
			<div className="mt-4 flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
				<span
					className={`rounded-full px-3 py-1 text-sm font-semibold ${isPositive ? "bg-[#4CAF50]/20 text-[#4CAF50]" : "bg-[#F44336]/20 text-[#F44336]"}`}
				>
					{isPositive ? "+" : ""}
					{marginPct.toFixed(1)}%
				</span>
				<span className="font-mono text-lg tabular-nums text-[var(--text-primary)]">
					{isPositive ? "+" : ""}
					{COP.format(margin)}
				</span>
			</div>
		</div>
	);
}
