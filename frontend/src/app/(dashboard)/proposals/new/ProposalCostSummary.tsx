"use client";

interface ProposalCostSummaryProps {
	subtotal: number;
	taxAmount: number;
	total: number;
	formatCOP: (value: number) => string;
}

export function ProposalCostSummary({
	subtotal,
	taxAmount,
	total,
	formatCOP,
}: ProposalCostSummaryProps) {
	return (
		<section
			className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]"
			aria-labelledby="cost-breakdown-title"
		>
			<h2 id="cost-breakdown-title" className="text-base font-semibold text-[var(--text-primary)]">
				Resumen de Costos
			</h2>
			<div className="mt-4 space-y-2 border-b border-[var(--border-subtle)] pb-4">
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">Subtotal</span>
					<span className="font-medium text-foreground">{formatCOP(subtotal)}</span>
				</div>
				<div className="flex justify-between text-sm">
					<span className="text-muted-foreground">IVA (19%)</span>
					<span className="font-medium text-foreground">{formatCOP(taxAmount)}</span>
				</div>
			</div>
			<div className="mt-4 flex justify-between">
				<span className="text-base font-semibold text-foreground">Total</span>
				<span className="text-xl font-bold text-brand">{formatCOP(total)}</span>
			</div>
		</section>
	);
}
