"use client";

/**
 * CostComparisonChart — Estimated vs actual costs visualization
 */

import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

interface CostComparisonChartProps {
	estimated: number;
	actual: number;
	currency?: string;
}

export function CostComparisonChart({
	estimated,
	actual,
	currency = "$",
}: CostComparisonChartProps) {
	const variance = estimated - actual;
	const variancePercent = estimated > 0 ? Math.round((variance / estimated) * 100) : 0;
	const isOverBudget = actual > estimated;
	const isOnBudget = Math.abs(variancePercent) <= 5;

	const barMax = Math.max(estimated, actual, 1);
	const estimatedWidth = (estimated / barMax) * 100;
	const actualWidth = (actual / barMax) * 100;

	return (
		<div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<DollarSign className="size-5 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						Comparación de costos
					</h3>
				</div>
				<div
					className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
						isOnBudget
							? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
							: isOverBudget
								? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
								: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]"
					}`}
				>
					{isOnBudget ? (
						"En presupuesto"
					) : isOverBudget ? (
						<>
							<TrendingUp className="size-3.5" aria-hidden="true" />
							{Math.abs(variancePercent)}% sobre
						</>
					) : (
						<>
							<TrendingDown className="size-3.5" aria-hidden="true" />
							{Math.abs(variancePercent)}% bajo
						</>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<div>
					<div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
						<span>Estimado</span>
						<span className="font-medium text-[var(--text-primary)]">
							{currency}
							{estimated.toLocaleString("es-CO")}
						</span>
					</div>
					<div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
						<div
							className="h-full rounded-full bg-[var(--color-brand-blue)]"
							style={{ width: `${estimatedWidth}%` }}
						/>
					</div>
				</div>
				<div>
					<div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
						<span>Actual</span>
						<span className="font-medium text-[var(--text-primary)]">
							{currency}
							{actual.toLocaleString("es-CO")}
						</span>
					</div>
					<div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
						<div
							className={`h-full rounded-full ${
								isOverBudget ? "bg-[var(--color-danger)]" : "bg-[var(--color-success)]"
							}`}
							style={{ width: `${actualWidth}%` }}
						/>
					</div>
				</div>
			</div>

			<div className="text-xs text-[var(--text-tertiary)]">
				Variación:{" "}
				<span
					className={
						isOnBudget
							? "text-[var(--color-success)]"
							: isOverBudget
								? "text-[var(--color-danger)]"
								: "text-[var(--color-warning)]"
					}
				>
					{isOverBudget ? "+" : ""}
					{variancePercent}% ({isOverBudget ? "sobre" : "bajo"} presupuesto)
				</span>
			</div>
		</div>
	);
}
