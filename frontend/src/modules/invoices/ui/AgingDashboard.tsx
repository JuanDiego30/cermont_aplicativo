import { Clock3 } from "lucide-react";
import type { PipelineStage } from "../api/invoice.api";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const BUCKETS = [
	{ label: "Corriente", detail: "0–30 días", min: 0, max: 30 },
	{ label: "30 días", detail: "31–60 días", min: 31, max: 60 },
	{ label: "60 días", detail: "61–90 días", min: 61, max: 90 },
	{ label: "90 días+", detail: "Más de 90 días", min: 91, max: Number.POSITIVE_INFINITY },
] as const;

interface AgingDashboardProps {
	stages: readonly PipelineStage[];
}

export function AgingDashboard({ stages }: AgingDashboardProps) {
	if (stages.length === 0) {
		return (
			<section
				aria-label="Antigüedad de cartera"
				className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 text-center"
			>
				<Clock3 className="mx-auto size-6 text-[var(--text-tertiary)]" aria-hidden="true" />
				<p className="mt-2 text-sm font-medium text-[var(--text-primary)]">
					Sin cartera registrada
				</p>
				<p className="mt-1 text-xs text-[var(--text-secondary)]">
					Las facturas emitidas aparecerán agrupadas por antigüedad.
				</p>
			</section>
		);
	}

	return (
		<section aria-labelledby="aging-title" data-testid="aging-dashboard">
			<div className="mb-3">
				<h2 id="aging-title" className="text-base font-semibold text-[var(--text-primary)]">
					Antigüedad de cartera
				</h2>
				<p className="text-sm text-[var(--text-secondary)]">
					Conteo y monto por días transcurridos.
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{BUCKETS.map((bucket) => {
					const matches = stages.filter((stage) => {
						const days = stage.agingDays ?? 0;
						return days >= bucket.min && days <= bucket.max;
					});
					const total = matches.reduce((sum, stage) => sum + stage.amount, 0);

					return (
						<article
							key={bucket.label}
							className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
						>
							<p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
								{bucket.label}
							</p>
							<p className="mt-1 text-xs text-[var(--text-secondary)]">{bucket.detail}</p>
							<p className="mt-3 text-2xl font-semibold tabular-nums text-[var(--text-primary)]">
								{matches.length}
							</p>
							<p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
								{COP_FORMATTER.format(total)}
							</p>
						</article>
					);
				})}
			</div>
		</section>
	);
}
