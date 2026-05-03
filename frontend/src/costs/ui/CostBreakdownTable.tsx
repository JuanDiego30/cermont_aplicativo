"use client";

import type { CostSummary } from "@cermont/shared-types";
import { formatCurrency } from "..";

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
		<section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<header className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
					Desglose por categoría
				</p>
				<h3 className="text-lg font-semibold text-slate-950 dark:text-white">
					Detalle consolidado
				</h3>
			</header>

			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0 text-sm">
					<thead>
						<tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
							<th className="border-b border-slate-200 px-3 py-3 font-semibold dark:border-slate-800">
								Categoría
							</th>
							<th className="border-b border-slate-200 px-3 py-3 font-semibold dark:border-slate-800">
								Estimado
							</th>
							<th className="border-b border-slate-200 px-3 py-3 font-semibold dark:border-slate-800">
								Real
							</th>
							<th className="border-b border-slate-200 px-3 py-3 font-semibold dark:border-slate-800">
								Impuestos
							</th>
							<th className="border-b border-slate-200 px-3 py-3 font-semibold dark:border-slate-800">
								Variance
							</th>
						</tr>
					</thead>
					<tbody>
						{summary.byCategory.map((row) => (
							<tr
								key={row.category}
								className={`text-slate-700 dark:text-slate-200 ${
									row.variance > 0
										? "bg-red-50 dark:bg-red-950/10"
										: row.variance < 0
											? "bg-green-50 dark:bg-green-950/10"
											: ""
								}`}
							>
								<td className="border-b border-slate-100 px-3 py-3 font-medium dark:border-slate-900">
									{row.category}
								</td>
								<td className="border-b border-slate-100 px-3 py-3 tabular-nums dark:border-slate-900">
									{formatCurrency(row.estimated)}
								</td>
								<td className="border-b border-slate-100 px-3 py-3 tabular-nums dark:border-slate-900">
									{formatCurrency(row.actual)}
								</td>
								<td className="border-b border-slate-100 px-3 py-3 tabular-nums dark:border-slate-900">
									{formatCurrency(row.tax)}
								</td>
								<td className="border-b border-slate-100 px-3 py-3 tabular-nums dark:border-slate-900">
									<span
										className={
											row.variance > 0
												? "text-red-700 dark:text-red-300"
												: row.variance < 0
													? "text-green-700 dark:text-green-300"
													: undefined
										}
									>
										{formatCurrency(row.variance)}
									</span>
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
	return <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />;
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
		<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
			<p className="text-sm font-semibold">Sin desglose</p>
			<p className="mt-1 text-sm">No hay costos registrados para esta orden.</p>
		</div>
	);
}
