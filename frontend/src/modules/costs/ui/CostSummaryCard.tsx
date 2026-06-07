"use client";

import type { CostSummary } from "@cermont/shared-types";
import { getValue } from "@cermont/shared-types";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrencyForState, formatPercent, labelForCostDataState } from "../utils";

interface CostSummaryCardProps {
	summary?: CostSummary;
	isLoading?: boolean;
	error?: Error;
}

const METRIC_TONE_CLASSES = {
	neutral:
		"border-zinc-200 bg-zinc-50 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white",
	success:
		"border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-100",
	danger:
		"border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-100",
} as const;

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

	return (
		<section className="grid gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-6 xl:grid-cols-[1.2fr_0.8fr]">
			<div className="space-y-4">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
						Resumen de costos
					</p>
					<h3 className="text-xl font-semibold text-zinc-950 dark:text-white">
						Orden {summary.orderId}
					</h3>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Consolidado de costos reales, impuestos y variación contra el estimado.
					</p>
				</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<Metric
						label="Total estimado"
						value={formatCurrencyForState(summary.totalEstimated, summary.dataState)}
					/>
					<Metric
						label="Total real"
						value={formatCurrencyForState(summary.totalActual, summary.dataState)}
						testid="cost-total"
					/>
					<Metric
						label="Total impuestos"
						value={formatCurrencyForState(summary.totalTax, summary.dataState)}
					/>
					<Metric
						label="Variance"
						value={formatCurrencyForState(summary.variance, summary.dataState)}
						tone={isVariancePositive ? "danger" : isVarianceNegative ? "success" : "neutral"}
						testid="cost-variance"
					/>
				</div>
			</div>

			<aside className="flex flex-col justify-between gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
						{isVariancePositive ? (
							<TrendingUp className="size-4 text-rose-500" aria-hidden="true" />
						) : (
							<TrendingDown className="size-4 text-emerald-500" aria-hidden="true" />
						)}
						Desviación
					</div>
					<div className="rounded-2xl bg-white p-4 dark:bg-zinc-950">
						<p className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
							{formatPercent(getValue(summary.variancePercent, 0))}
						</p>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
							{summary.variance > 0
								? "El costo real excede el estimado."
								: summary.variance < 0
									? "El costo real quedó por debajo del estimado."
									: "El costo real coincide con el estimado."}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
					{summary.hasCosts ? (
						<CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
					) : (
						<AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
					)}
					{summary.hasCosts
						? `Estado de costos: ${labelForCostDataState(summary.dataState)}.`
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
	return (
		<div data-testid={testid} className={`rounded-2xl border p-4 ${METRIC_TONE_CLASSES[tone]}`}>
			<p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{label}</p>
			<p className="mt-2 text-lg font-black tracking-tight">{value}</p>
		</div>
	);
}

function SkeletonCard() {
	return <div className="h-56 animate-pulse rounded-3xl bg-zinc-200 dark:bg-zinc-800" />;
}

function ErrorCard({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/10 dark:text-rose-100">
			<p className="text-sm font-semibold">No se pudo cargar el resumen</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	);
}

function EmptyCard() {
	return (
		<div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
			<p className="text-sm font-semibold">Sin resumen disponible</p>
			<p className="mt-1 text-sm">No hay costos para esta orden todavía.</p>
		</div>
	);
}
