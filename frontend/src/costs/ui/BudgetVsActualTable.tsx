"use client";

import type { CostLineDelta } from "@cermont/shared-types";

interface BudgetVsActualTableProps {
	rows?: CostLineDelta[];
	isLoading?: boolean;
}

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const STATUS_CLASS: Record<CostLineDelta["status"], string> = {
	under_budget: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
	on_budget: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
	over_budget: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
	critical: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
};

function formatCop(value: number): string {
	return COP_FORMATTER.format(value);
}

function statusLabel(status: CostLineDelta["status"]): string {
	switch (status) {
		case "under_budget":
			return "Ahorro";
		case "critical":
			return "Crítico";
		case "over_budget":
			return "Sobrecosto";
		default:
			return "En rango";
	}
}

export function BudgetVsActualTable({ rows = [], isLoading = false }: BudgetVsActualTableProps) {
	return (
		<section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
			<header className="space-y-1">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
					Control financiero
				</p>
				<h2 className="text-lg font-semibold text-slate-950 dark:text-white">
					Presupuestado vs real
				</h2>
			</header>

			{isLoading ? (
				<div className="h-36 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
			) : rows.length === 0 ? (
				<p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
					Sin líneas presupuestales para comparar todavía.
				</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full text-left text-sm">
						<thead className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800 dark:text-slate-400">
							<tr>
								<th className="py-3 pr-4">Categoría</th>
								<th className="px-4 py-3">Descripción</th>
								<th className="px-4 py-3 text-right">Presupuestado</th>
								<th className="px-4 py-3 text-right">Real</th>
								<th className="px-4 py-3 text-right">Delta</th>
								<th className="py-3 pl-4 text-right">Estado</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
							{rows.map((row) => (
								<tr key={`${row.category}-${row.description}`}>
									<td className="py-3 pr-4 font-medium text-slate-900 dark:text-white">
										{row.category}
									</td>
									<td className="px-4 py-3 text-slate-600 dark:text-slate-300">
										{row.description}
									</td>
									<td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
										{formatCop(row.budgeted)}
									</td>
									<td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">
										{formatCop(row.actual)}
									</td>
									<td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
										{formatCop(row.delta)} ({(row.deltaPct ?? 0).toFixed(1)}%)
									</td>
									<td className="py-3 pl-4 text-right">
										<span
											className={`rounded-full px-2.5 py-1 text-xs ${STATUS_CLASS[row.status]}`}
										>
											{statusLabel(row.status)}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
