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
	const [editingCost, setEditingCost] = useState<Cost | undefined>(undefined);
	const summaryQuery = useOrderCostSummary(orderId);
	const listQuery = useOrderCosts(orderId);

	const costs = listQuery.data?.costs ?? [];

	return (
		<section className="space-y-6">
			<CostSummaryCard
				summary={summaryQuery.data}
				isLoading={summaryQuery.isLoading}
				error={summaryQuery.error instanceof Error ? summaryQuery.error : undefined}
			/>
			<CostBreakdownTable
				summary={summaryQuery.data}
				isLoading={summaryQuery.isLoading}
				error={summaryQuery.error instanceof Error ? summaryQuery.error : undefined}
			/>

			<section className="space-y-4 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
				<header className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Registro de costos
					</p>
					<h3 className="text-lg font-semibold text-[var(--text-primary)]">Crear o editar costo</h3>
				</header>

				<CostForm
					key={`${orderId}:${editingCost?._id ?? "new"}`}
					orderId={orderId}
					cost={editingCost}
					readOnly={readOnly}
					onCancel={() => setEditingCost(undefined)}
					onSuccess={() => {
						setEditingCost(undefined);
						summaryQuery.refetch();
						listQuery.refetch();
					}}
				/>
			</section>

			{showOrderList ? (
				<section className="space-y-4 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
					<header className="space-y-1">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
							Costos cargados
						</p>
						<h3 className="text-lg font-semibold text-[var(--text-primary)]">Items recientes</h3>
					</header>

					{listQuery.isLoading ? (
						<div className="h-32 animate-pulse rounded-3xl bg-[var(--surface-secondary)]" />
					) : listQuery.error ? (
						<div className="rounded-3xl border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-5 text-[var(--color-danger)]">
							<p className="text-sm font-semibold">No se pudieron cargar los costos</p>
							<p className="mt-1 text-sm">{listQuery.error.message}</p>
						</div>
					) : costs.length === 0 ? (
						<div className="rounded-3xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-secondary)] p-5 text-[var(--text-secondary)]">
							<p className="text-sm font-semibold">Sin costos registrados</p>
							<p className="mt-1 text-sm">Todavía no hay costos para esta orden.</p>
						</div>
					) : (
						<div className="grid gap-3">
							{costs.map((cost) => (
								<article
									key={cost._id}
									className="rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4"
								>
									<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
										<div className="space-y-1">
											<p className="text-sm font-semibold text-[var(--text-primary)]">
												{cost.description}
											</p>
											<p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
												{cost.category}
											</p>
										</div>

										<button
											type="button"
											onClick={() => setEditingCost(cost)}
											className="inline-flex items-center justify-center rounded-full border border-[var(--border-medium)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
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
