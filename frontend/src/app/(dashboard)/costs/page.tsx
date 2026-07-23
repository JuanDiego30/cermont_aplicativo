"use client";

import { ArrowRight, ClipboardList, DollarSign, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState, useSyncExternalStore } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { EmptyKpiState } from "@/core/ui/EmptyKpiState";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { COST_CATEGORY_LABELS, formatCurrency, useCostList } from "@/modules/costs";

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function computeDataState(
	estimatedAmount: number,
	actualAmount: number,
): "NO_DATA" | "ESTIMATED_ONLY" | "ACTUAL_ONLY" | "ESTIMATED_AND_ACTUAL" {
	if (estimatedAmount > 0 && actualAmount > 0) {
		return "ESTIMATED_AND_ACTUAL";
	}
	if (estimatedAmount > 0) {
		return "ESTIMATED_ONLY";
	}
	if (actualAmount > 0) {
		return "ACTUAL_ONLY";
	}
	return "NO_DATA";
}

function dataStateLabel(state: ReturnType<typeof computeDataState>): string {
	switch (state) {
		case "ESTIMATED_ONLY":
			return "Solo estimado";
		case "ACTUAL_ONLY":
			return "Solo real";
		case "ESTIMATED_AND_ACTUAL":
			return "Estimado y real";
		default:
			return "Sin datos";
	}
}

function dataStateColor(state: ReturnType<typeof computeDataState>): string {
	switch (state) {
		case "ESTIMATED_ONLY":
			return "text-[var(--color-info)]";
		case "ACTUAL_ONLY":
			return "text-[var(--color-warning)]";
		case "ESTIMATED_AND_ACTUAL":
			return "text-[var(--color-success)]";
		default:
			return "text-[var(--text-tertiary)]";
	}
}

function varianceSemaphore(
	variance: number,
	variancePercent: number | null,
): {
	color: string;
	label: string;
} {
	if (variance < 0) {
		return { color: "text-[var(--color-success)]", label: "Bajo presupuesto" };
	}
	if (variancePercent === null || variance === 0) {
		return { color: "text-[var(--text-tertiary)]", label: "Sin variación" };
	}
	if (variancePercent <= 5) {
		return { color: "text-[var(--color-success)]", label: "En presupuesto" };
	}
	if (variancePercent <= 15) {
		return { color: "text-[var(--color-warning)]", label: "Sobre costo leve" };
	}
	return { color: "text-[var(--color-danger)]", label: "Sobre costo crítico" };
}

export default function CostsPage() {
	const { push } = useRouter();
	const { accessToken, isAuthenticated } = useAuth();
	const [orderId, setOrderId] = useState("");
	const isHydrated = useSyncExternalStore(
		subscribeToHydration,
		getClientHydrationSnapshot,
		getServerHydrationSnapshot,
	);
	const costQuery = useCostList({ limit: 25 }, { enabled: isHydrated && Boolean(accessToken) });
	const costs = costQuery.data?.costs;
	const isWaitingForSession = !isHydrated || (isAuthenticated && !accessToken);

	const costItems = costs ?? [];
	const totals = costItems.reduce(
		(acc, cost) => {
			acc.estimated += cost.estimatedAmount;
			acc.actual += cost.actualAmount;
			acc.tax += cost.taxAmount;
			return acc;
		},
		{ estimated: 0, actual: 0, tax: 0 },
	);

	const hasCosts = (costs?.length ?? 0) > 0;

	// Variance metrics
	const costMetrics = (() => {
		const overallVariance = hasCosts ? totals.actual - totals.estimated : 0;
		const overallVariancePct =
			totals.estimated > 0 ? (overallVariance / totals.estimated) * 100 : null;
		const varianceState = hasCosts ? computeDataState(totals.estimated, totals.actual) : "NO_DATA";
		const semaphore = varianceSemaphore(overallVariance, overallVariancePct);

		return {
			overallVariance,
			overallVariancePct,
			varianceState,
			semaphore,
		};
	})();

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedOrderId = orderId.trim();
		if (!trimmedOrderId) {
			return;
		}
		push(`/costs/${trimmedOrderId}/ejecucion`);
	};

	return (
		<section className="space-y-6" aria-labelledby="costs-page-title">
			<header className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]">
				<p className="text-sm text-[var(--text-tertiary)]">Dashboard / Costos</p>
				<div className="mt-3 flex flex-wrap items-start justify-between gap-4">
					<div className="flex items-start gap-3">
						<ClipboardList
							aria-hidden="true"
							className="mt-1 size-6 text-[var(--color-brand-blue)]"
						/>
						<div>
							<h1
								id="costs-page-title"
								className="text-2xl font-semibold text-[var(--text-primary)]"
							>
								Motor de costos
							</h1>
							<p className="mt-1 max-w-2xl text-sm text-[var(--text-secondary)]">
								Control de costos estimados, reales, impuestos y variación por orden de trabajo.
							</p>
						</div>
					</div>
					<Link
						href="/orders"
						className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)]"
					>
						Órdenes
						<ArrowRight className="size-4" aria-hidden="true" />
					</Link>
				</div>
			</header>

			{/* Metrics Row */}
			<div className="grid gap-3 sm:grid-cols-4">
				<MetricCard
					label="Estimado"
					value={formatCurrency(hasCosts ? totals.estimated : 0)}
				/>
				<MetricCard
					label="Real"
					value={formatCurrency(hasCosts ? totals.actual : 0)}
				/>
				<MetricCard
					label="Impuestos"
					value={formatCurrency(hasCosts ? totals.tax : 0)}
				/>
				<MetricCard
					label="Variación"
					value={
						hasCosts
							? `${formatCurrency(costMetrics.overallVariance)}${costMetrics.overallVariancePct !== null ? ` (${costMetrics.overallVariancePct.toFixed(1)}%)` : ""}`
							: formatCurrency(0)
					}
					color={costMetrics.semaphore.color}
				/>
			</div>

			{/* Data State Info */}
			{hasCosts && (
				<div className="flex flex-wrap gap-2 text-xs">
					<span className="text-[var(--text-tertiary)]">Estado general:</span>
					<span className={`font-medium ${dataStateColor(costMetrics.varianceState)}`}>
						{dataStateLabel(costMetrics.varianceState)}
					</span>
					<span className={`font-medium ${costMetrics.semaphore.color}`}>
						• {costMetrics.semaphore.label}
					</span>
				</div>
			)}

			{!isWaitingForSession && !costQuery.isLoading && !costQuery.isError && !hasCosts ? (
				<EmptyKpiState
					icon={DollarSign}
					title="Aún no hay costos para analizar"
					description="Los KPI muestran $0 hasta que una orden registre mano de obra, materiales, equipos o impuestos."
					actionLabel="Ir a órdenes"
					actionHref="/orders"
				/>
			) : null}

			<section
				className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
				aria-labelledby="costs-lookup-title"
			>
				<h2 id="costs-lookup-title" className="text-sm font-semibold text-[var(--text-primary)]">
					Consulta por orden
				</h2>
				<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
					<label htmlFor="order-id" className="sr-only">
						ID de la orden
					</label>
					<div className="relative flex-1">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]"
							aria-hidden="true"
						/>
						<input
							id="order-id"
							type="text"
							value={orderId}
							onChange={(event) => setOrderId(event.target.value)}
							placeholder="Pega aquí el ID de la orden"
							className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/15"
						/>
					</div>
					<button
						type="submit"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-blue)] px-4 text-sm font-medium text-white transition hover:bg-[var(--color-brand-blue-hover)]"
					>
						Ver ejecución
						<ArrowRight className="size-4" aria-hidden="true" />
					</button>
				</form>
			</section>

			<section
				className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]"
				aria-labelledby="costs-list-title"
			>
				<div className="border-b border-[var(--border-subtle)] px-6 py-4">
					<h2 id="costs-list-title" className="text-sm font-semibold text-[var(--text-primary)]">
						Últimos costos registrados
					</h2>
				</div>
				{isWaitingForSession || costQuery.isLoading ? (
					<output className="flex items-center justify-center py-16">
						<Loader2 className="size-6 animate-spin text-[var(--color-brand-blue)]" />
						<span className="sr-only">Cargando costos</span>
					</output>
				) : costQuery.isError ? (
					<div className="p-6">
						<EmptyState
							icon="costs"
							title="No se pudieron cargar los costos"
							description="Revisa la conexión con el backend e inténtalo de nuevo."
						/>
					</div>
				) : costItems.length === 0 ? (
					<div className="p-6">
						<EmptyState
							icon="costs"
							title="Sin costos registrados"
							description="Los costos aparecerán cuando una orden tenga mano de obra, materiales, equipos o impuestos asociados."
						/>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-[var(--surface-secondary)] text-xs uppercase text-[var(--text-tertiary)]">
								<tr>
									<th className="px-6 py-3 font-semibold">Concepto</th>
									<th className="px-6 py-3 font-semibold">Categoría</th>
									<th className="px-6 py-3 font-semibold">Estimado</th>
									<th className="px-6 py-3 font-semibold">Real</th>
									<th className="px-6 py-3 font-semibold">Variación</th>
									<th className="px-6 py-3 font-semibold">Estado</th>
									<th className="px-6 py-3 font-semibold">Orden</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border-subtle)]">
								{costItems.map((cost) => {
									const variance = cost.actualAmount - cost.estimatedAmount;
									const variancePct =
										cost.estimatedAmount > 0 ? (variance / cost.estimatedAmount) * 100 : null;
									const state = computeDataState(cost.estimatedAmount, cost.actualAmount);
									const semi = varianceSemaphore(variance, variancePct);

									return (
										<tr key={cost._id}>
											<td className="px-6 py-4 font-medium text-[var(--text-primary)]">
												{cost.description}
											</td>
											<td className="px-6 py-4 text-[var(--text-secondary)]">
												{COST_CATEGORY_LABELS[cost.category]}
											</td>
											<td className="px-6 py-4 text-[var(--text-secondary)]">
												{formatCurrency(cost.estimatedAmount, cost.currency)}
											</td>
											<td className="px-6 py-4 text-[var(--text-secondary)]">
												{formatCurrency(cost.actualAmount, cost.currency)}
											</td>
											<td className={`px-6 py-4 font-medium ${semi.color}`}>
												{formatCurrency(variance, cost.currency)}
												{variancePct !== null && (
													<span className="ml-1 text-xs">
														({variancePct > 0 ? "+" : ""}
														{variancePct.toFixed(1)}%)
													</span>
												)}
											</td>
											<td className={`px-6 py-4 text-sm font-medium ${dataStateColor(state)}`}>
												{dataStateLabel(state)}
											</td>
											<td className="px-6 py-4">
												<Link
													href={`/costs/${cost.orderId}/ejecucion`}
													className="font-medium text-[var(--color-brand-blue)] hover:underline"
												>
													Ver orden
												</Link>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</section>
	);
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
			<p className="text-xs font-medium uppercase text-[var(--text-tertiary)]">{label}</p>
			<p className={`mt-2 text-xl font-semibold ${color ?? "text-[var(--text-primary)]"}`}>
				{value}
			</p>
		</div>
	);
}
