"use client";

import type { CostSummary } from "@cermont/shared-types";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency, formatPercent } from "..";

interface CostSummaryCardProps {
	summary?: CostSummary | null;
	isLoading?: boolean;
	error?: Error | null;
}

export function CostSummaryCard({ summary, isLoading = false, error }: CostSummaryCardProps) {
	if (isLoading) {
		return <SkeletonCard />;
	}

	if (error) {
		return <ErrorCard message={error.message} />;
	}

	if (!summary) {
		return <EmptyCard />;
	}

	const isVariancePositive = summary.variance > 0;
	const isVarianceNegative = summary.variance < 0;
	const totalActualWithTax = summary.totalActual + summary.totalTax;

	return (
		<section className="grid gap-4 rounded-3xl border border-(--border-default) bg-(--surface-primary) p-4 shadow-(--shadow-1) sm:p-6 xl:grid-cols-2">
			<div className="space-y-4">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-tertiary)">
						Resumen de costos
					</p>
					<h3 className="text-xl font-semibold text-(--text-primary)">Orden {summary.orderId}</h3>
					<p className="text-sm text-(--text-secondary)">
						Consolidado de costos reales, impuestos y desviación contra la línea base aprobada.
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<Metric label="Baseline aprobado" value={formatCurrency(summary.baselineApproved)} />
					<Metric
						label="Total real + impuesto"
						value={formatCurrency(totalActualWithTax)}
						testid="cost-total"
					/>
					<Metric label="Baseline estimado" value={formatCurrency(summary.baselineEstimated)} />
					<Metric label="Total impuestos" value={formatCurrency(summary.totalTax)} />
					<Metric
						label="Desviación"
						value={formatCurrency(summary.variance)}
						tone={isVariancePositive ? "danger" : isVarianceNegative ? "success" : "neutral"}
						testid="cost-variance"
					/>
				</div>
			</div>

			<aside className="flex flex-col justify-between gap-4 rounded-3xl border border-(--border-default) bg-(--surface-secondary) p-4">
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
						{isVariancePositive ? (
							<TrendingUp className="h-4 w-4 text-(--color-danger)" aria-hidden="true" />
						) : (
							<TrendingDown className="h-4 w-4 text-(--color-success)" aria-hidden="true" />
						)}
						Desviación
					</div>
					<div className="rounded-2xl border border-(--border-default) bg-(--surface-primary) p-4 shadow-(--shadow-1)">
						<p className="text-3xl font-black tracking-tight text-(--text-primary)">
							{formatPercent(summary.variancePercent)}
						</p>
						<p className="mt-2 text-sm text-(--text-secondary)">
							{summary.deviationStatus === "over_budget"
								? "La operación supera la línea base aprobada."
								: summary.variance < 0
									? "La operación está por debajo de la línea base aprobada."
									: "La operación coincide con la línea base aprobada."}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-2xl border border-(--border-default) bg-(--surface-primary) px-3 py-2 text-sm text-(--text-secondary) shadow-(--shadow-1)">
					{summary.hasCosts ? (
						<CheckCircle2 className="h-4 w-4 text-(--color-success)" aria-hidden="true" />
					) : (
						<AlertTriangle className="h-4 w-4 text-(--color-warning)" aria-hidden="true" />
					)}
					{summary.hasCosts
						? "Existen costos registrados para esta orden."
						: "Aún no hay costos registrados."}
				</div>
			</aside>
		</section>
	);
}

function Metric({
	label,
	value,
	tone = "neutral",
	testid,
}: {
	label: string;
	value: string;
	tone?: "neutral" | "success" | "danger";
	testid?: string;
}) {
	const toneClasses = {
		neutral: "border-(--border-default) bg-(--surface-secondary) text-(--text-primary)",
		success: "border-(--color-success-bg) bg-(--color-success-bg)/60 text-(--color-success)",
		danger: "border-(--color-danger-bg) bg-(--color-danger-bg)/60 text-(--color-danger)",
	} as const;

	return (
		<div data-testid={testid} className={`rounded-2xl border p-4 ${toneClasses[tone]}`}>
			<p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
			<p className="mt-2 text-lg font-black tracking-tight">{value}</p>
		</div>
	);
}

function SkeletonCard() {
	return <div className="h-56 animate-pulse rounded-3xl bg-(--surface-secondary)" />;
}

function ErrorCard({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-(--color-danger-bg) bg-(--color-danger-bg)/40 p-5 text-(--color-danger)">
			<p className="text-sm font-semibold">No se pudo cargar el resumen</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	);
}

function EmptyCard() {
	return (
		<div className="rounded-3xl border border-dashed border-(--border-default) bg-(--surface-secondary) p-5 text-(--text-secondary)">
			<p className="text-sm font-semibold">Sin resumen disponible</p>
			<p className="mt-1 text-sm">No hay costos para esta orden todavía.</p>
		</div>
	);
}
