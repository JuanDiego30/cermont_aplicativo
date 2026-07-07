"use client";

import type { CostSummary } from "@cermont/shared-types";
import { AlertTriangle, CircleCheck, CircleHelp, OctagonAlert } from "lucide-react";
import { formatCurrency, formatPercent } from "../utils";

const RISK_COPY = {
	not_available: {
		label: "Presupuesto no vinculado",
		description: "La orden no tiene una propuesta aprobada para comparar el gasto.",
		className: "border-[var(--border-medium)] text-[var(--text-secondary)]",
		Icon: CircleHelp,
	},
	within_budget: {
		label: "Consumo controlado",
		description: "El gasto permanece por debajo del umbral preventivo.",
		className: "border-[var(--color-success)] text-[var(--color-success)]",
		Icon: CircleCheck,
	},
	threshold_reached: {
		label: "Umbral preventivo alcanzado",
		description: "Finanzas debe revisar los costos antes de comprometer más presupuesto.",
		className: "border-[var(--color-warning)] text-[var(--color-warning)]",
		Icon: AlertTriangle,
	},
	over_budget: {
		label: "Presupuesto excedido",
		description: "El gasto soportado ya supera el valor aprobado de la propuesta.",
		className: "border-[var(--color-danger)] text-[var(--color-danger)]",
		Icon: OctagonAlert,
	},
} as const;

export function CostBudgetStatus({ summary }: { summary: CostSummary }) {
	const copy = RISK_COPY[summary.budgetRisk];
	const consumption =
		summary.budgetConsumptionPercent.status === "present"
			? summary.budgetConsumptionPercent.value
			: 0;
	const approvedBudget =
		summary.approvedBudget.status === "present"
			? formatCurrency(summary.approvedBudget.value)
			: "Sin propuesta aprobada";
	const progress = Math.min(Math.max(consumption * 100, 0), 100);

	return (
		<section
			aria-label="Control del presupuesto aprobado"
			className={`border-l-4 bg-[var(--surface-secondary)] px-4 py-4 ${copy.className}`}
		>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div>
					<div className="flex items-center gap-2">
						<copy.Icon className="size-4" aria-hidden="true" />
						<h3 className="text-sm font-semibold text-[var(--text-primary)]">{copy.label}</h3>
					</div>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">{copy.description}</p>
					<progress
						className="mt-4 h-1.5 w-full overflow-hidden rounded-full accent-current [&::-webkit-progress-bar]:bg-[var(--border-subtle)] [&::-webkit-progress-value]:bg-current"
						value={Math.round(progress)}
						max={100}
						aria-label={`${copy.label}: ${Math.round(progress)}%`}
					/>
				</div>
				<dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm lg:text-right">
					<div>
						<dt className="text-[var(--text-tertiary)]">Consumo</dt>
						<dd className="font-semibold text-[var(--text-primary)]">
							{summary.budgetConsumptionPercent.status === "present"
								? `${formatPercent(consumption)} consumido`
								: "No calculable"}
						</dd>
					</div>
					<div>
						<dt className="text-[var(--text-tertiary)]">Presupuesto aprobado</dt>
						<dd className="font-semibold text-[var(--text-primary)]">{approvedBudget}</dd>
					</div>
				</dl>
			</div>
		</section>
	);
}
