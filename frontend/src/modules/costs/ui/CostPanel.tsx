"use client";

import type { Cost } from "@cermont/shared-types";
import { useState } from "react";
import { useOrderCostSummary, useOrderCosts } from "../queries";
import { CostBreakdownTable } from "./CostBreakdownTable";
import { CostForm } from "./CostForm";
import { CostSummaryCard } from "./CostSummaryCard";

interface CostPanelProps {
	orderId: string;
	readOnly?: boolean;
	showOrderList?: boolean;
}

export function CostPanel({ orderId, readOnly = false, showOrderList = true }: CostPanelProps) {
	const [editingCost, setEditingCost] = useState<Cost | null>(null);
	const summaryQuery = useOrderCostSummary(orderId);
	const listQuery = useOrderCosts(orderId);

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

			<section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
				<header className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
						Registro de costos
					</p>
					<h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
						Crear o editar costo
					</h3>
				</header>

				<CostForm
					key={`${orderId}:${editingCost?._id ?? "new"}`}
					orderId={orderId}
					cost={editingCost}
					readOnly={readOnly}
					onCancel={() => setEditingCost(null)}
					onSuccess={() => {
						setEditingCost(null);
						summaryQuery.refetch();
						listQuery.refetch();
					}}
				/>
			</section>

			{showOrderList ? (
				<section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
					<header className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
							Costos cargados
						</p>
						<h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Items recientes</h3>
					</header>

					{listQuery.isLoading ? (
						<div className="h-32 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
					) : listQuery.error ? (
						<div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-100">
							<p className="text-sm font-semibold">No se pudieron cargar los costos</p>
							<p className="mt-1 text-sm">{listQuery.error.message}</p>
						</div>
					) : costs.length === 0 ? (
						<div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
							<p className="text-sm font-semibold">Sin costos registrados</p>
							<p className="mt-1 text-sm">Todavía no hay costos para esta orden.</p>
						</div>
					) : (
						<div className="grid gap-3">
							{costs.map((cost) => (
								<article
									key={cost._id}
									className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="space-y-1">
											<p className="text-sm font-semibold text-zinc-950 dark:text-white">
												{cost.description}
											</p>
											<p className="text-xs uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
												{cost.category}
											</p>
										</div>

										<button
											type="button"
											onClick={() => setEditingCost(cost)}
											className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
		</section>
	);
}
