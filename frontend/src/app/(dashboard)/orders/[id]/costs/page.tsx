"use client";

/**
 * /orders/[id]/costs — Order cost breakdown page
 */

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";

type CostItem = {
	_id: string;
	category: string;
	description: string;
	amount: number;
	quantity: number;
	unit: string;
	createdAt: string;
};

type CostSummary = {
	totalBudget: number;
	totalActual: number;
	items: CostItem[];
};

export default function OrderCostsPage() {
	const { id } = useParams<{ id: string }>();

	const { data, isLoading, error } = useQuery<CostSummary>({
		queryKey: ["order-costs", id],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: CostSummary }>(
				`/costs/order/${id}/summary`,
			);
			return json.data;
		},
		enabled: !!id,
	});

	if (isLoading) {
		return (
			<section className="space-y-4">
				<Skeleton variant="text" />
				<Skeleton variant="kpi-card" />
				<Skeleton variant="chart" height={200} />
			</section>
		);
	}

	if (error || !data) {
		return (
			<section>
				<Link
					href={`/orders/${id}`}
					className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
				>
					<ArrowLeft className="size-4" />
					Volver a la orden
				</Link>
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm text-[var(--color-danger)]">
					No se pudieron cargar los costos.
				</div>
			</section>
		);
	}

	const variance = data.totalBudget - data.totalActual;
	const variancePercent = data.totalBudget > 0
		? Math.round((variance / data.totalBudget) * 100)
		: 0;

	return (
		<section className="space-y-6" aria-labelledby="costs-title">
			<Link
				href={`/orders/${id}`}
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" />
				Volver a la orden
			</Link>

			<h1 id="costs-title" className="text-xl font-semibold text-[var(--text-primary)]">
				Costos de la orden
			</h1>

			<div className="grid gap-4 sm:grid-cols-3">
				<InfoCard
					label="Presupuesto"
					value={`$${data.totalBudget.toLocaleString("es-CO")}`}
				/>
				<InfoCard
					label="Actual"
					value={`$${data.totalActual.toLocaleString("es-CO")}`}
				/>
				<InfoCard
					label="Variación"
					value={`${variancePercent >= 0 ? "+" : ""}${variancePercent}%`}
					className={variancePercent < 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"}
				/>
			</div>

			{data.items.length > 0 ? (
				<div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
					<table className="min-w-full text-sm">
						<thead className="bg-[var(--surface-secondary)]/60 text-xs uppercase text-[var(--text-secondary)]">
							<tr>
								<th className="px-4 py-3 text-left font-semibold">Categoría</th>
								<th className="px-4 py-3 text-left font-semibold">Descripción</th>
								<th className="px-4 py-3 text-right font-semibold">Cant.</th>
								<th className="px-4 py-3 text-right font-semibold">Valor</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{data.items.map((item) => (
								<tr key={item._id}>
									<td className="px-4 py-3 font-medium text-[var(--text-primary)]">{item.category}</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{item.description}</td>
									<td className="px-4 py-3 text-right text-[var(--text-secondary)]">{item.quantity}</td>
									<td className="px-4 py-3 text-right font-medium text-[var(--text-primary)]">
										${item.amount.toLocaleString("es-CO")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<div className="flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-8 text-center">
					<DollarSign className="size-8 text-[var(--text-tertiary)]" />
					<p className="text-sm text-[var(--text-secondary)]">No hay costos registrados para esta orden.</p>
				</div>
			)}
		</section>
	);
}

function InfoCard({ label, value, className }: { label: string; value: string; className?: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<p className="text-xs text-[var(--text-tertiary)]">{label}</p>
			<p className={`mt-1 text-lg font-semibold text-[var(--text-primary)] ${className ?? ""}`}>{value}</p>
		</div>
	);
}
