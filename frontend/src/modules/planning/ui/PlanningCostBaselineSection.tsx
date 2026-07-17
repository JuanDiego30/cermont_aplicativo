"use client";

/**
 * PlanningCostBaselineSection — Displays the cost baseline snapshot
 * from an approved planning packet (labor, materials, equipment, total).
 */

import type { CostBaselineSnapshot } from "@cermont/shared-types";
import { DollarSign } from "lucide-react";
import { localeDate } from "@/lib/utils/format-date";

interface PlanningCostBaselineSectionProps {
	costBaseline?: CostBaselineSnapshot | null;
}

const CURRENCY = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

export function PlanningCostBaselineSection({ costBaseline }: PlanningCostBaselineSectionProps) {
	if (!costBaseline) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
					<DollarSign className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
					Costo estimado
				</h3>
				<p className="mt-2 text-xs text-[var(--text-secondary)]">
					No se ha definido un costo estimado para esta planeación.
				</p>
			</section>
		);
	}

	const items = [
		{ label: "Mano de obra", value: costBaseline.laborCosts },
		{ label: "Materiales", value: costBaseline.materialCosts },
		{ label: "Equipos", value: costBaseline.equipmentCosts },
		{ label: "Presupuesto base", value: costBaseline.totalBudget },
		{
			label: "Contingencia",
			value: costBaseline.contingencyAmount,
			pct: costBaseline.contingencyPercentage,
		},
		{ label: "Total general", value: costBaseline.grandTotal, highlight: true },
	];

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-sm">
			<h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
				<DollarSign className="size-4 text-[var(--color-brand)]" aria-hidden="true" />
				Costo estimado
			</h3>
			{costBaseline.frozenAt && (
				<p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
					Congelado el{" "}
					{localeDate(costBaseline.frozenAt, {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}{" "}
					por {costBaseline.frozenBy}
				</p>
			)}
			<div className="mt-4 space-y-2">
				{items.map((item) => (
					<div
						key={item.label}
						className={`flex items-center justify-between rounded-[var(--radius-md)] px-3 py-2 ${
							item.highlight
								? "bg-[var(--color-brand-blue-bg)] font-semibold"
								: "bg-[var(--surface-secondary)]"
						}`}
					>
						<span className="text-xs text-[var(--text-secondary)]">{item.label}</span>
						<span
							className={`text-xs ${item.highlight ? "text-[var(--color-brand)]" : "text-[var(--text-primary)]"}`}
						>
							{CURRENCY.format(item.value)}
							{item.pct ? ` (${item.pct}%)` : ""}
						</span>
					</div>
				))}
			</div>
		</section>
	);
}
