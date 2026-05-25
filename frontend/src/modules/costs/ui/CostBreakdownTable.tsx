"use client";

import type { CostSummary } from "@cermont/shared-types";
import { formatCurrencyForState, labelForCostDataState } from "../utils";

interface CostBreakdownTableProps {
	summary?: CostSummary | null;
	isLoading?: boolean;
	error?: Error | null;
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
		<section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
			<header className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
					Desglose por categoría
				</p>
				<h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Detalle consolidado</h3>
			</header>

			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0 text-sm">
					<thead>
						<tr className="text-left text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Categoría
							</th>
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Estimado
							</th>
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Real
							</th>
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Impuestos
							</th>
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Variance
							</th>
							<th className="border-b border-zinc-200 p-3 font-semibold dark:border-zinc-800">
								Estado
							</th>
						</tr>
					</thead>
					<tbody>
						{summary.byCategory.map((row) => (
							<tr key={row.category} className="text-zinc-700 dark:text-zinc-200">
								<td className="border-b border-zinc-100 p-3 font-medium dark:border-zinc-900">
									{row.category}
								</td>
								<td className="border-b border-zinc-100 p-3 tabular-nums dark:border-zinc-900">
									{formatCurrencyForState(row.estimated, row.dataState)}
								</td>
								<td className="border-b border-zinc-100 p-3 tabular-nums dark:border-zinc-900">
									{formatCurrencyForState(row.actual, row.dataState)}
								</td>
								<td className="border-b border-zinc-100 p-3 tabular-nums dark:border-zinc-900">
									{formatCurrencyForState(row.tax, row.dataState)}
								</td>
								<td className="border-b border-zinc-100 p-3 tabular-nums dark:border-zinc-900">
									{formatCurrencyForState(row.variance, row.dataState)}
								</td>
								<td className="border-b border-zinc-100 p-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-900">
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
	return <div className="h-64 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />;
}

function ErrorTable({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-100">
			<p className="text-sm font-semibold">No se pudo cargar el desglose</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	);
}

function EmptyTable() {
	return (
		<div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
			<p className="text-sm font-semibold">Sin desglose</p>
			<p className="mt-1 text-sm">No hay costos registrados para esta orden.</p>
		</div>
	);
}
