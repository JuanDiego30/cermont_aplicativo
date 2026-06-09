"use client";

import type { CostTraceabilitySummary } from "@cermont/shared-types";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

// ── Formatters ─────────────────────────────────────────────────────────────

const COP = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function fmt(value: number): string {
	return COP.format(value);
}

function pct(actual: number, estimated: number): string {
	if (estimated === 0) {
		return "—";
	}
	const p = ((actual - estimated) / estimated) * 100;
	return `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface VarianceBadgeProps {
	status: "ok" | "warning" | "loss";
}

function VarianceBadge({ status }: VarianceBadgeProps) {
	if (status === "ok") {
		return (
			<span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
				<CheckCircle2 className="size-3" aria-hidden="true" />
				Dentro del presupuesto
			</span>
		);
	}
	if (status === "warning") {
		return (
			<span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">
				<AlertTriangle className="size-3" aria-hidden="true" />
				Alerta de costo
			</span>
		);
	}
	return (
		<span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase text-red-700">
			<TrendingDown className="size-3" aria-hidden="true" />
			Costo con pérdida
		</span>
	);
}

interface CategoryRowProps {
	label: string;
	estimated: number;
	actual: number;
}

function CategoryRow({ label, estimated, actual }: CategoryRowProps) {
	const diff = actual - estimated;
	const isOver = diff > 0;
	const isUnder = diff < 0;
	const diffColor = isOver
		? "text-red-600"
		: isUnder
			? "text-green-600"
			: "text-[var(--text-muted)]";

	return (
		<div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2.5">
			<span className="text-xs font-semibold text-[var(--text-primary)]">{label}</span>
			<span className="text-right font-mono text-xs text-[var(--text-secondary)]">
				{estimated > 0 ? fmt(estimated) : "—"}
			</span>
			<span className="text-right font-mono text-xs text-[var(--text-secondary)]">
				{actual > 0 ? fmt(actual) : "—"}
			</span>
			<span className={`text-right font-mono text-[11px] font-semibold ${diffColor}`}>
				{estimated > 0 && actual > 0 ? pct(actual, estimated) : "—"}
			</span>
		</div>
	);
}

interface BillingBarProps {
	label: string;
	value: number;
	total: number;
	color: string;
}

function BillingBar({ label, value, total, color }: BillingBarProps) {
	const width = total > 0 ? Math.min(100, (value / total) * 100) : 0;
	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between text-xs">
				<span className="text-[var(--text-secondary)]">{label}</span>
				<span className="font-mono font-semibold text-[var(--text-primary)]">
					{value > 0 ? fmt(value) : "—"}
				</span>
			</div>
			<div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
				<div
					className={`h-full rounded-full transition-all duration-300 ${color}`}
					style={{ width: `${width}%` }}
				/>
			</div>
		</div>
	);
}

// ── Main component ─────────────────────────────────────────────────────────

interface CostComparisonPanelProps {
	costs: CostTraceabilitySummary;
	serviceCaseId?: string;
}

export function CostComparisonPanel({ costs, serviceCaseId }: CostComparisonPanelProps) {
	const { estimated, actual, billing, variance } = costs;
	const estimatedTotal = estimated.estimatedTotalCost;
	const actualTotal = actual.actualTotalCost;
	const billingTotal = billing.sesValue || billing.invoiceValue || estimatedTotal;

	const categories: CategoryRowProps[] = [
		{
			label: "Mano de obra",
			estimated: estimated.estimatedLabor,
			actual: actual.actualLabor,
		},
		{
			label: "Materiales",
			estimated: estimated.estimatedMaterials,
			actual: actual.actualMaterials,
		},
		{
			label: "Equipos",
			estimated: estimated.estimatedEquipment,
			actual: actual.actualEquipment,
		},
		{
			label: "Impuestos",
			estimated: estimated.estimatedTaxes,
			actual: actual.actualTaxes,
		},
	].filter((c) => c.estimated > 0 || c.actual > 0);

	return (
		<section
			className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card"
			aria-label="Panel de costos"
		>
			{/* Header */}
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<span className="flex size-8 items-center justify-center rounded-xl bg-[var(--color-brand-blue-bg)]">
						<TrendingUp className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					</span>
					<p className="text-sm font-bold text-[var(--text-primary)]">Costos estimados vs reales</p>
				</div>
				<VarianceBadge status={variance.status} />
			</div>

			{/* Totals row */}
			<div className="mb-4 grid gap-3 sm:grid-cols-3">
				{/* Estimated */}
				<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
					<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Presupuesto propuesta
					</p>
					<p className="mt-2 font-mono text-base font-semibold text-[var(--text-primary)]">
						{estimatedTotal > 0 ? fmt(estimatedTotal) : "Sin dato"}
					</p>
					{estimated.proposalValue > 0 && (
						<p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
							Propuesta: {fmt(estimated.proposalValue)}
						</p>
					)}
				</div>

				{/* Actual */}
				<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
					<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Costo real acumulado
					</p>
					<p
						className={`mt-2 font-mono text-base font-semibold ${
							variance.status === "loss"
								? "text-red-600"
								: variance.status === "warning"
									? "text-amber-600"
									: "text-[var(--text-primary)]"
						}`}
					>
						{actualTotal > 0 ? fmt(actualTotal) : "Sin dato"}
					</p>
					{variance.costDifference !== 0 && estimatedTotal > 0 && (
						<p
							className={`mt-0.5 text-[10px] font-semibold ${
								variance.costDifference > 0 ? "text-red-600" : "text-green-600"
							}`}
						>
							{variance.costDifference > 0 ? "+" : ""}
							{fmt(variance.costDifference)} vs estimado
						</p>
					)}
				</div>

				{/* Margin */}
				<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
					<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Margen estimado
					</p>
					<p
						className={`mt-2 font-mono text-base font-semibold ${
							estimated.estimatedMargin < 0 ? "text-red-600" : "text-[var(--text-primary)]"
						}`}
					>
						{estimated.estimatedMargin !== 0 ? fmt(estimated.estimatedMargin) : "—"}
					</p>
					{actual.actualMargin !== 0 && (
						<p
							className={`mt-0.5 text-[10px] ${
								actual.actualMargin < 0 ? "text-red-600 font-semibold" : "text-[var(--text-muted)]"
							}`}
						>
							Real: {fmt(actual.actualMargin)}
						</p>
					)}
				</div>
			</div>

			{/* Category breakdown table */}
			{categories.length > 0 && (
				<div className="mb-4">
					{/* Table header */}
					<div className="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-3">
						<span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							Categoría
						</span>
						<span className="text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							Estimado
						</span>
						<span className="text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							Real
						</span>
						<span className="text-right text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
							Δ%
						</span>
					</div>
					<div className="space-y-1.5">
						{categories.map((cat) => (
							<CategoryRow key={cat.label} {...cat} />
						))}
					</div>
				</div>
			)}

			{/* Billing chain */}
			{(billing.sesValue > 0 || billing.invoiceValue > 0 || billing.paidValue > 0) && (
				<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
					<p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						Cadena de cobro
					</p>
					<div className="space-y-2.5">
						<BillingBar
							label="SES Ariba"
							value={billing.sesValue}
							total={billingTotal}
							color="bg-[var(--color-brand)]"
						/>
						<BillingBar
							label="Factura"
							value={billing.invoiceValue}
							total={billingTotal}
							color="bg-[var(--color-brand-deep)]"
						/>
						<BillingBar
							label="Pagado"
							value={billing.paidValue}
							total={billingTotal}
							color="bg-green-500"
						/>
						{billing.pendingValue > 0 && (
							<div className="flex items-center justify-between pt-1 text-xs">
								<span className="text-[var(--text-muted)]">Saldo pendiente</span>
								<span className="font-mono font-semibold text-amber-600">
									{fmt(billing.pendingValue)}
								</span>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Link to detailed cost module */}
			{serviceCaseId && (
				<div className="mt-4 flex justify-end">
					<Link
						href={`/service-cases/${serviceCaseId}`}
						className="text-[11px] font-semibold text-[var(--color-brand)] hover:underline"
					>
						Ver desglose completo →
					</Link>
				</div>
			)}
		</section>
	);
}
