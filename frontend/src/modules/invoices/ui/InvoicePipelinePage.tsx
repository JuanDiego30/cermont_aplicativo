"use client";

import { AlertTriangle, ReceiptText } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import type { InvoicePipeline, PipelineStage } from "../api/invoice.api";
import { useInvoicePipeline } from "../hooks/useInvoicePipeline";
import { AgingDashboard } from "./AgingDashboard";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { PaymentRecordCard } from "./PaymentRecordCard";

const COP_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const STAGES = [
	{ key: "ses", label: "SES" },
	{ key: "invoice", label: "Factura" },
	{ key: "payment", label: "Pago" },
] as const satisfies readonly { key: keyof InvoicePipeline; label: string }[];

function stageTone(status: string): string {
	if (status === "approved" || status === "paid" || status === "completed") {
		return "bg-[var(--color-success)]";
	}
	if (status === "rejected" || status === "cancelled") {
		return "bg-[var(--color-danger)]";
	}
	if (status === "not_created") {
		return "bg-[var(--text-tertiary)]";
	}
	return "bg-[var(--color-warning)]";
}

function PipelineStageCard({ label, stage }: { label: string; stage: PipelineStage }) {
	return (
		<article className="flex min-w-40 flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 text-center">
			<span className={`size-4 rounded-full ${stageTone(stage.status)}`} aria-hidden="true" />
			<h2 className="text-base font-semibold text-[var(--text-primary)]">{label}</h2>
			<InvoiceStatusBadge status={stage.status} />
			{stage.amount > 0 ? (
				<span className="font-mono text-sm text-[var(--text-secondary)]">
					{COP_FORMATTER.format(stage.amount)}
				</span>
			) : null}
			{stage.code ? (
				<span className="text-xs text-[var(--text-tertiary)]">{stage.code}</span>
			) : null}
			{stage.agingDays ? (
				<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-1 text-xs text-[var(--text-secondary)]">
					{stage.agingDays} días
				</span>
			) : null}
		</article>
	);
}

interface InvoicePipelinePageProps {
	serviceCaseId: string;
}

export default function InvoicePipelinePage({ serviceCaseId }: InvoicePipelinePageProps) {
	const pipelineQuery = useInvoicePipeline(serviceCaseId);

	if (pipelineQuery.isLoading) {
		return (
			<section className="space-y-6" aria-label="Cargando pipeline de facturación">
				<Skeleton variant="text" className="h-8 w-72" />
				<Skeleton variant="kpi-card" />
				<Skeleton variant="chart" height={220} />
			</section>
		);
	}

	if (pipelineQuery.isError) {
		return (
			<EmptyState
				icon={AlertTriangle}
				title="No se pudo cargar el pipeline"
				description="Verifica la conexión y vuelve a intentar."
				action={{ label: "Reintentar", onClick: () => void pipelineQuery.refetch() }}
			/>
		);
	}

	const pipeline = pipelineQuery.data?.pipeline;
	if (!pipeline) {
		return (
			<EmptyState
				icon={ReceiptText}
				title="Pipeline aún no disponible"
				description="El seguimiento aparecerá cuando el caso tenga una SES, factura o pago asociado."
			/>
		);
	}

	return (
		<section className="space-y-8" aria-labelledby="invoice-pipeline-title">
			<header>
				<h1
					id="invoice-pipeline-title"
					className="text-2xl font-semibold text-[var(--text-primary)]"
				>
					Pipeline de facturación
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Seguimiento real de SES, factura y pago.
				</p>
			</header>

			<AgingDashboard stages={[pipeline.invoice]} />

			<div className="overflow-x-auto pb-2">
				<ol className="flex min-w-[36rem] items-center gap-3" aria-label="Etapas del pipeline">
					{STAGES.map(({ key, label }, index) => (
						<li
							key={key}
							data-testid="invoice-pipeline-stage"
							className="flex flex-1 items-center gap-3"
						>
							<PipelineStageCard label={label} stage={pipeline[key]} />
							{index < STAGES.length - 1 ? (
								<span
									className="h-px min-w-8 flex-1 bg-[var(--border-default)]"
									aria-hidden="true"
								/>
							) : null}
						</li>
					))}
				</ol>
			</div>

			<PaymentRecordCard payment={pipeline.payment} />
		</section>
	);
}
