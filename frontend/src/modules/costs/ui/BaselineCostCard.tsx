"use client";

interface Props {
	estimatedCost: number;
	baselineDate: string;
}

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function BaselineCostCard({ estimatedCost, baselineDate }: Props) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
			<div className="flex items-center gap-2">
				<span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
					BASELINE
				</span>
				<span className="text-xs text-[var(--text-tertiary)]">
					Congelado {new Date(baselineDate).toLocaleDateString("es-CO")}
				</span>
			</div>
			<p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-[var(--text-primary)]">
				{COP.format(estimatedCost)}
			</p>
			<p className="mt-1 text-sm text-[var(--text-secondary)]">Costo congelado de la propuesta</p>
		</div>
	);
}
