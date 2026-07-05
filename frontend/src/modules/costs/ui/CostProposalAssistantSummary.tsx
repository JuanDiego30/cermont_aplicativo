"use client";

import type { CostProposalResult } from "@cermont/shared-types";
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, RotateCcw } from "lucide-react";

interface CostProposalAssistantSummaryProps {
	result: CostProposalResult;
	formatCOP: (value: number) => string;
	onApplyToProposal?: (result: CostProposalResult) => void;
	onReset?: () => void;
}

export function CostProposalAssistantSummary({
	result,
	formatCOP,
	onApplyToProposal,
	onReset,
}: CostProposalAssistantSummaryProps) {
	return (
		<div className="space-y-6">
			{/* Observations */}
			{result.observations.length > 0 && (
				<section className="space-y-3 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
					<header className="flex items-center gap-2">
						<AlertTriangle className="size-4 text-amber-500" />
						<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
							Observaciones
						</h3>
					</header>
					<ul className="space-y-2">
						{result.observations.map((obs) => (
							<li key={obs} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
								<span className="mt-0.5 text-amber-500">•</span>
								{obs}
							</li>
						))}
					</ul>
				</section>
			)}

			{/* Suggested Actions */}
			<section className="space-y-3 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
				<header className="flex items-center gap-2">
					<CheckCircle2 className="size-4 text-[var(--color-brand)]" />
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Acciones sugeridas
					</h3>
				</header>
				<ul className="space-y-2">
					{result.suggestedActions.map((action, actionIdx) => (
						<li
							key={action}
							className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
						>
							<span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-[var(--border-medium)] text-[9px] text-[var(--text-tertiary)]">
								{actionIdx + 1}
							</span>
							{action}
						</li>
					))}
				</ul>
			</section>

			{/* Budget Comparison */}
			{result.clientBudgetComparison.status === "present" && (
				<section className="space-y-3 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
					<header>
						<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
							Comparativo vs presupuesto
						</h3>
					</header>

					<div className="grid grid-cols-3 gap-3 text-center">
						<div>
							<p className="text-xs text-[var(--text-tertiary)]">Presupuesto</p>
							<p className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
								{formatCOP(result.clientBudgetComparison.value.clientBudget)}
							</p>
						</div>
						<div>
							<p className="text-xs text-[var(--text-tertiary)]">Propuesto</p>
							<p className="text-lg font-semibold tabular-nums text-[var(--text-primary)]">
								{formatCOP(result.clientBudgetComparison.value.proposedTotal)}
							</p>
						</div>
						<div>
							<p className="text-xs text-[var(--text-tertiary)]">Diferencia</p>
							<p
								className={`text-lg font-semibold tabular-nums ${
									result.clientBudgetComparison.value.isWithinBudget
										? "text-[var(--color-success)]"
										: "text-[var(--color-danger)]"
								}`}
							>
								{result.clientBudgetComparison.value.differencePercent > 0 ? "+" : ""}
								{result.clientBudgetComparison.value.differencePercent.toFixed(1)}%
							</p>
						</div>
					</div>

					{result.clientBudgetComparison.value.isWithinBudget ? (
						<div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
							<CheckCircle2 className="size-4" />
							Dentro del presupuesto del cliente
						</div>
					) : (
						<div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
							<AlertTriangle className="size-4" />
							Excede el presupuesto del cliente en{" "}
							{formatCOP(Math.abs(result.clientBudgetComparison.value.difference))}
						</div>
					)}
				</section>
			)}

			{/* Actions */}
			<div className="flex flex-col gap-3 sm:flex-row">
				{onApplyToProposal && (
					<button
						type="button"
						onClick={() => onApplyToProposal(result)}
						className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
					>
						<FileText className="size-4" />
						Aplicar a propuesta
						<ArrowRight className="size-4" />
					</button>
				)}
				{onReset && (
					<button
						type="button"
						onClick={onReset}
						className="flex items-center justify-center gap-2 rounded-full border border-[var(--border-medium)] bg-[var(--surface-card)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
					>
						<RotateCcw className="size-4" />
						Nuevo cálculo
					</button>
				)}
			</div>
		</div>
	);
}
