"use client";

import type { CostProposalInput, CostProposalResult } from "@cermont/shared-types";
import { AlertTriangle, Calculator, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useCostSuggestion } from "../hooks/useCostSuggestion";
import { CostProposalAssistantForm } from "./CostProposalAssistantForm";
import { CostProposalAssistantResults } from "./CostProposalAssistantResults";
import { CostProposalAssistantSummary } from "./CostProposalAssistantSummary";

const copFormatter = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatCOP(value: number): string {
	return copFormatter.format(value);
}

interface CostProposalAssistantProps {
	/** Called when user wants to apply calculated costs to a proposal form */
	onApplyToProposal?: (result: CostProposalResult) => void;
	/** Pre-populated data (e.g. from a service case context) */
	initialData?: Partial<CostProposalInput>;
}

export function CostProposalAssistant({
	onApplyToProposal,
	initialData,
}: CostProposalAssistantProps) {
	const [result, setResult] = useState<CostProposalResult | null>(null);
	const mutation = useCostSuggestion();

	const handleSubmit = async (data: CostProposalInput) => {
		const suggestion = await mutation.mutateAsync(data);
		setResult(suggestion);
	};

	const handleReset = () => {
		setResult(null);
		mutation.reset();
	};

	const skeletonKeys = useMemo(() => Array.from({ length: 6 }, (_, i) => `skeleton-${i}`), []);

	// Loading state
	if (mutation.isPending) {
		return (
			<div className="space-y-4 py-12">
				<div className="flex flex-col items-center gap-4 text-center">
					<Loader2 className="size-10 animate-spin text-[var(--color-brand)]" />
					<div>
						<p className="text-sm font-medium text-[var(--text-primary)]">Calculando costos…</p>
						<p className="mt-1 text-xs text-[var(--text-tertiary)]">
							Consultando catálogo de costos y calculando desglose
						</p>
					</div>
				</div>
				{/* Skeleton table */}
				<div className="animate-pulse space-y-3 rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6">
					{skeletonKeys.map((key) => (
						<div key={key} className="h-8 rounded bg-[var(--surface-secondary)]" />
					))}
				</div>
			</div>
		);
	}

	// Error state
	if (mutation.isError) {
		return (
			<div className="flex flex-col items-center gap-4 py-12 text-center">
				<AlertTriangle className="size-10 text-[var(--color-danger)]" />
				<div>
					<p className="text-sm font-medium text-[var(--text-primary)]">Error al calcular costos</p>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">
						{mutation.error instanceof Error
							? mutation.error.message
							: "Ocurrió un error inesperado"}
					</p>
				</div>
				<button
					type="button"
					onClick={handleReset}
					className="rounded-full border border-[var(--border-medium)] bg-[var(--surface-card)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
				>
					Intentar de nuevo
				</button>
			</div>
		);
	}

	// Result state
	if (result) {
		return (
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
					<Calculator className="size-5 text-green-600" />
					<div>
						<p className="text-sm font-semibold text-green-800">Desglose de costos generado</p>
						<p className="text-xs text-green-600">
							Total propuesta: {formatCOP(result.totalRounded)}
						</p>
					</div>
				</div>

				<CostProposalAssistantResults result={result} formatCOP={formatCOP} />

				<CostProposalAssistantSummary
					result={result}
					formatCOP={formatCOP}
					onApplyToProposal={onApplyToProposal}
					onReset={handleReset}
				/>
			</div>
		);
	}

	// Empty / initial state — show form
	return (
		<div className="space-y-6">
			<header className="space-y-1">
				<div className="flex items-center gap-2">
					<Calculator className="size-5 text-[var(--color-brand)]" />
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">Asistente de costos</h2>
				</div>
				<p className="text-sm text-[var(--text-secondary)]">
					Complete los datos de la actividad para recibir un desglose detallado de costos estimados.
				</p>
			</header>

			<div className="rounded-3xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 shadow-sm sm:p-6">
				<CostProposalAssistantForm
					onSubmit={handleSubmit}
					isSubmitting={false}
					initialData={initialData}
				/>
			</div>
		</div>
	);
}
