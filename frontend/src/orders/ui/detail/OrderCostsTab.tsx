"use client";

import { AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/_shared/lib/utils/format-currency";
import { CostPanel, useOrderCostSummary } from "@/costs";
import { useOrder } from "@/orders/queries";

interface OrderCostsTabProps {
	orderId: string;
}

export function OrderCostsTab({ orderId }: OrderCostsTabProps) {
	const { data: order } = useOrder(orderId);
	const { data: summary } = useOrderCostSummary(orderId);
	const proposalValue = order?.costBaseline?.total ?? order?.commercial?.nteAmount ?? 0;
	const estimatedCost = summary?.totalEstimated ?? order?.costBaseline?.subtotal ?? 0;
	const actualCost = summary?.totalActual ?? 0;
	const estimatedMargin = proposalValue - estimatedCost;
	const actualMargin = proposalValue - actualCost;
	const estimatedMarginPct = proposalValue > 0 ? (estimatedMargin / proposalValue) * 100 : 0;
	const actualMarginPct = proposalValue > 0 ? (actualMargin / proposalValue) * 100 : 0;
	const marginAlert = actualMarginPct < estimatedMarginPct - 7.5;

	return (
		<section aria-label="Costos de la orden" className="space-y-6">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold text-slate-950 dark:text-white">Costos</h2>
				<p className="text-sm text-slate-600 dark:text-slate-400">
					Registra costos reales, revisa el resumen y controla la variación antes del cierre.
				</p>
			</div>

			<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<MetricCard label="Valor propuesta" value={formatCurrency(proposalValue)} />
				<MetricCard label="Costo real total" value={formatCurrency(actualCost)} />
				<MetricCard
					label="Margen estimado"
					value={`${formatCurrency(estimatedMargin)} · ${estimatedMarginPct.toFixed(1)}%`}
				/>
				<MetricCard
					label="Margen real"
					value={`${formatCurrency(actualMargin)} · ${actualMarginPct.toFixed(1)}%`}
					tone={marginAlert ? "warning" : "default"}
				/>
			</section>

			{marginAlert ? (
				<div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
					<p>
						El margen real está más de 7.5 puntos por debajo del margen estimado. Revisa
						desviaciones antes del cierre.
					</p>
				</div>
			) : null}

			<CostPanel
				orderId={orderId}
				readOnly={order?.status === "closed" || order?.status === "cancelled"}
			/>
		</section>
	);
}

function MetricCard({
	label,
	value,
	tone = "default",
}: {
	label: string;
	value: string;
	tone?: "default" | "warning";
}) {
	return (
		<article
			className={`rounded-xl border p-4 ${
				tone === "warning"
					? "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
					: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
			}`}
		>
			<p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
		</article>
	);
}
