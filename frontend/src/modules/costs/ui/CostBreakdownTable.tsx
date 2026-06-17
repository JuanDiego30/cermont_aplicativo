"use client";

import type { CostSummary } from "@cermont/shared-types";
import { formatCurrencyForState, labelForCostDataState } from "../utils";

interface CostBreakdownTableProps {
	summary?: CostSummary;
	isLoading?: boolean;
	error?: Error;
}

export function CostBreakdownTable({ summary, isLoading = false, error }: CostBreakdownTableProps) {
	if (isLoading) {
		return <SkeletonTable />;
	}

	if (error) {
		return <ErrorTable message={error.message} />;
	}

	if (!summary) {
		return <EmptyTable />;
	}

	return (
		<section className="space-y-4 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
			<header className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
					Desglose por categoría
				</p>
				<h3 className="text-lg font-semibold text-[var(--text-primary)]">Detalle consolidado</h3>
			</header>

			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0 text-sm">
					<thead>
						<tr className="text-left text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">
								Categoría
							</th>
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Estimado</th>
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Real</th>
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">
								Impuestos
							</th>
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Variance</th>
							<th className="border-b border-[var(--border-medium)] p-3 font-semibold">Estado</th>
						</tr>
					</thead>
					<tbody>
						{summary.byCategory.map((row) => (
							<tr key={row.category} className="text-[var(--text-secondary)]">
								<td className="border-b border-[var(--border-subtle)] p-3 font-medium">
									{row.category}
								</td>
								<td className="border-b border-[var(--border-subtle)] p-3 tabular-nums">
									{formatCurrencyForState(row.estimated, row.dataState)}
								</td>
								<td className="border-b border-[var(--border-subtle)] p-3 tabular-nums">
									{formatCurrencyForState(row.actual, row.dataState)}
								</td>
								<td className="border-b border-[var(--border-subtle)] p-3 tabular-nums">
									{formatCurrencyForState(row.tax, row.dataState)}
								</td>
								<td className="border-b border-[var(--border-subtle)] p-3 tabular-nums">
									{formatCurrencyForState(row.variance, row.dataState)}
								</td>
								<td className="border-b border-[var(--border-subtle)] p-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
									{labelForCostDataState(row.dataState)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function SkeletonTable() {
	return <div className="h-64 animate-pulse rounded-3xl bg-[var(--surface-secondary)]" />;
}

function ErrorTable({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-5 text-[var(--color-danger)]">
			<p className="text-sm font-semibold">No se pudo cargar el desglose</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	);
}

function EmptyTable() {
	return (
		<div className="rounded-3xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-secondary)] p-5 text-[var(--text-secondary)]">
			<p className="text-sm font-semibold">Sin desglose</p>
			<p className="mt-1 text-sm">No hay costos registrados para esta orden.</p>
		</div>
	);
}
