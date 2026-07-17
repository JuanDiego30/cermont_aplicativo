import type { CostTopVarianceOrder } from "@cermont/shared-types";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../utils";

type CostVarianceOrdersProps = {
	readonly orders: readonly CostTopVarianceOrder[];
};

export function CostVarianceOrders({ orders }: CostVarianceOrdersProps) {
	if (orders.length === 0) {
		return null;
	}

	return (
		<section className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
			<div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-5 py-4">
				<AlertTriangle className="size-5 text-[var(--status-danger)]" aria-hidden="true" />
				<h2 className="text-sm font-semibold text-[var(--text-primary)]">Órdenes con mayor sobrecosto</h2>
			</div>
			<ul className="space-y-3 p-4 md:hidden">
				{orders.map((order) => (
					<li key={order.orderId} className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] p-4">
						<OrderLink order={order} />
						<p className="mt-2 text-xs text-[var(--text-muted)]">{statusValue(order.clientName)}</p>
						<div className="mt-3 flex items-end justify-between gap-3">
							<span className="text-xs text-[var(--text-secondary)]">Real {formatCurrency(order.totalActual)}</span>
							<VarianceValue order={order} />
						</div>
					</li>
				))}
			</ul>
			<div className="hidden overflow-x-auto md:block">
				<table className="min-w-full text-left text-sm">
					<thead className="bg-[var(--surface-secondary)] text-xs uppercase text-[var(--text-tertiary)]">
						<tr>
							<th className="px-5 py-3 font-semibold">Orden</th>
							<th className="px-5 py-3 font-semibold">Cliente</th>
							<th className="px-5 py-3 font-semibold">Estimado</th>
							<th className="px-5 py-3 font-semibold">Real</th>
							<th className="px-5 py-3 font-semibold">Variación</th>
							<th className="px-5 py-3 font-semibold">Estado</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border-subtle)]">
						{orders.map((order) => (
							<tr key={order.orderId}>
								<td className="px-5 py-4"><OrderLink order={order} /></td>
								<td className="px-5 py-4 text-[var(--text-secondary)]">{statusValue(order.clientName)}</td>
								<td className="px-5 py-4 text-[var(--text-secondary)]">{formatCurrency(order.totalEstimated)}</td>
								<td className="px-5 py-4 text-[var(--text-secondary)]">{formatCurrency(order.totalActual)}</td>
								<td className="px-5 py-4"><VarianceValue order={order} /></td>
								<td className="px-5 py-4 text-[var(--text-secondary)]">{statusValue(order.status)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}

function OrderLink({ order }: { readonly order: CostTopVarianceOrder }) {
	return (
		<Link
			href={`/costs/${order.orderId}/ejecucion`}
			className="font-medium text-[var(--color-brand-blue)] hover:underline"
		>
			{order.orderCode.status === "present" ? order.orderCode.value : order.orderId.slice(0, 8)}
		</Link>
	);
}

function VarianceValue({ order }: { readonly order: CostTopVarianceOrder }) {
	const isOverBudget = order.variance > 0;
	const percentage =
		order.variancePercent.status === "present"
			? ` (${order.variancePercent.value > 0 ? "+" : ""}${order.variancePercent.value.toFixed(1)}%)`
			: "";
	return (
		<span className={isOverBudget ? "font-medium text-[var(--status-danger)]" : "font-medium text-[var(--status-success)]"}>
			{isOverBudget ? "+" : ""}
			{formatCurrency(order.variance)}
			{percentage}
		</span>
	);
}

function statusValue(status: CostTopVarianceOrder["status"]): string {
	return status.status === "present" ? status.value : "No disponible";
}
