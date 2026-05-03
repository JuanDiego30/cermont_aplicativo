"use client";

import type { Cost } from "@cermont/shared-types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useOrder } from "@/orders/queries";
import {
	BudgetVsActualTable,
	CostBreakdownTable,
	CostComparisonChart,
	CostForm,
	CostSummaryCard,
	LaborCostCalculator,
	useOrderCostSummary,
	useOrderCosts,
} from "..";

interface CostPanelProps {
	orderId: string;
	readOnly?: boolean;
	showOrderList?: boolean;
}

export function CostPanel({ orderId, readOnly = false, showOrderList = true }: CostPanelProps) {
	const [editingCost, setEditingCost] = useState<Cost | null>(null);
	const [showOverBudgetDialog, setShowOverBudgetDialog] = useState(false);
	const summaryQuery = useOrderCostSummary(orderId);
	const listQuery = useOrderCosts(orderId);
	const orderQuery = useOrder(orderId);

	useEffect(() => {
		if (summaryQuery.error instanceof Error) {
			toast.error(summaryQuery.error.message);
		}
	}, [summaryQuery.error]);

	const costs = listQuery.data?.costs ?? [];

	return (
		<section className="space-y-6">
			<CostSummaryCard
				summary={summaryQuery.data}
				isLoading={summaryQuery.isLoading}
				error={summaryQuery.error instanceof Error ? summaryQuery.error : null}
			/>
			<CostBreakdownTable
				summary={summaryQuery.data}
				isLoading={summaryQuery.isLoading}
				error={summaryQuery.error instanceof Error ? summaryQuery.error : null}
			/>
			<BudgetVsActualTable
				rows={summaryQuery.data?.lineDeltas ?? []}
				isLoading={summaryQuery.isLoading}
			/>
			{orderQuery.data ? <LaborCostCalculator order={orderQuery.data} /> : null}
			<CostComparisonChart
				data={summaryQuery.data?.byCategory.map((row) => ({
					type: row.category,
					estimated: row.estimated,
					actual: row.actual + row.tax,
				}))}
				isLoading={summaryQuery.isLoading}
			/>

			<section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
				<header className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
						Registro de costos
					</p>
					<h2 className="text-lg font-semibold text-slate-950 dark:text-white">
						Crear o editar costo
					</h2>
				</header>

				<CostForm
					orderId={orderId}
					cost={editingCost}
					readOnly={readOnly}
					onCancel={() => setEditingCost(null)}
					onSuccess={async () => {
						setEditingCost(null);
						const refreshedSummary = await summaryQuery.refetch();
						void listQuery.refetch();
						if (refreshedSummary.data?.deviationStatus === "over_budget") {
							setShowOverBudgetDialog(true);
						}
					}}
				/>
			</section>

			{showOrderList ? (
				<section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
					<header className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
							Costos cargados
						</p>
						<h3 className="text-lg font-semibold text-slate-950 dark:text-white">
							Items recientes
						</h3>
					</header>

					{listQuery.isLoading ? (
						<section
							role="status"
							aria-live="polite"
							aria-label="Cargando costos"
							className="h-32 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800"
						/>
					) : listQuery.error ? (
						<aside
							role="alert"
							aria-live="assertive"
							className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-100"
						>
							<p className="text-sm font-semibold">No se pudieron cargar los costos</p>
							<p className="mt-1 text-sm">{(listQuery.error as Error).message}</p>
						</aside>
					) : costs.length === 0 ? (
						<section
							role="status"
							aria-live="polite"
							aria-label="Sin costos registrados"
							className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
						>
							<p className="text-sm font-semibold">Sin costos registrados</p>
							<p className="mt-1 text-sm">Todavía no hay costos para esta orden.</p>
						</section>
					) : (
						<div className="grid gap-3">
							{costs.map((cost) => (
								<article
									key={cost._id}
									className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50"
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="space-y-1">
											<p className="text-sm font-semibold text-slate-950 dark:text-white">
												{cost.description}
											</p>
											<p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
												{cost.category}
											</p>
										</div>

										<button
											type="button"
											onClick={() => setEditingCost(cost)}
											className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
										>
											Editar
										</button>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			) : null}

			{showOverBudgetDialog ? (
				<dialog
					open
					role="alertdialog"
					aria-modal="true"
					className="w-full max-w-md rounded-xl border border-red-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
				>
					<div className="space-y-4 p-5">
						<div className="space-y-1">
							<h3 className="text-base font-semibold text-slate-900">Advertencia de presupuesto</h3>
							<p className="text-sm text-slate-600">
								El costo real acumulado ya supera la línea base aprobada para esta orden.
							</p>
						</div>
						<div className="flex justify-end">
							<button
								type="button"
								onClick={() => setShowOverBudgetDialog(false)}
								className="min-h-11 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
							>
								Entendido
							</button>
						</div>
					</div>
				</dialog>
			) : null}
		</section>
	);
}
