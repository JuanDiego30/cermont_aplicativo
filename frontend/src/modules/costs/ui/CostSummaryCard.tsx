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
	neutral: "border-[var(--border-medium)] bg-[var(--surface-secondary)] text-[var(--text-primary)]",
	success: "border-[var(--border-medium)] bg-[var(--color-success-bg)] text-[var(--text-primary)]",
	danger: "border-[var(--border-medium)] bg-[var(--color-danger-bg)] text-[var(--text-primary)]",
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
		<section className="grid gap-4 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6 xl:grid-cols-[1.2fr_0.8fr]">
			<div className="space-y-4">
				<div className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Resumen de costos
					</p>
					<h3 className="text-xl font-semibold text-[var(--text-primary)]">
						Orden {summary.orderId}
					</h3>
					<p className="text-sm text-[var(--text-tertiary)]">
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

			<aside className="flex flex-col justify-between gap-4 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4">
				<div className="space-y-3">
					<div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
						{isVariancePositive ? (
							<TrendingUp className="size-4 text-[var(--color-danger)]" aria-hidden="true" />
						) : (
							<TrendingDown className="size-4 text-[var(--color-success)]" aria-hidden="true" />
						)}
						Desviación
					</div>
					<div className="rounded-2xl bg-[var(--surface-card)] p-4">
						<p className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
							{formatPercent(getValue(summary.variancePercent, 0))}
						</p>
						<p className="mt-2 text-sm text-[var(--text-tertiary)]">
							{summary.variance > 0
								? "El costo real excede el estimado."
								: summary.variance < 0
									? "El costo real quedó por debajo del estimado."
									: "El costo real coincide con el estimado."}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-secondary)]">
					{summary.hasCosts ? (
						<CheckCircle2 className="size-4 text-[var(--color-success)]" aria-hidden="true" />
					) : (
						<AlertTriangle className="size-4 text-[var(--color-warning)]" aria-hidden="true" />
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
	return <div className="h-56 animate-pulse rounded-3xl bg-[var(--surface-secondary)]" />;
}

function ErrorCard({ message }: { message: string }) {
	return (
		<div className="rounded-3xl border border-[var(--color-danger)] bg-[var(--color-danger-bg)] p-5 text-[var(--color-danger)]">
			<p className="text-sm font-semibold">No se pudo cargar el resumen</p>
			<p className="mt-1 text-sm">{message}</p>
		</div>
	);
}

function EmptyCard() {
	return (
		<div className="rounded-3xl border border-dashed border-[var(--border-medium)] bg-[var(--surface-secondary)] p-5 text-[var(--text-secondary)]">
			<p className="text-sm font-semibold">Sin resumen disponible</p>
			<p className="mt-1 text-sm">No hay costos para esta orden todavía.</p>
		</div>
	);
}
