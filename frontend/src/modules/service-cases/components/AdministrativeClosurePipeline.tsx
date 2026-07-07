"use client";

import type { ClosureWorkflowSummary, CostTraceabilitySummary } from "@cermont/shared-types";
import {
	Banknote,
	CircleCheck,
	CircleDashed,
	Clock3,
	FileSignature,
	Receipt,
	ScrollText,
} from "lucide-react";
import type { ComponentType } from "react";

type StageStatus = "completed" | "in_progress" | "pending";

interface PipelineStage {
	key: string;
	label: string;
	detail: string;
	status: StageStatus;
	icon: ComponentType<{ className?: string }>;
	amount?: number;
}

interface AdministrativeClosurePipelineProps {
	closure: ClosureWorkflowSummary;
	billing: CostTraceabilitySummary["billing"];
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

const STATUS_LABEL: Record<StageStatus, string> = {
	completed: "Completado",
	in_progress: "En trámite",
	pending: "Pendiente",
};

const STATUS_CLASSES: Record<StageStatus, string> = {
	completed: "border-brand-annotate text-brand-annotate",
	in_progress: "border-brand-warn text-brand-warn",
	pending: "border-hairline text-steel",
};

function stageStatus(approved: boolean, submitted: boolean): StageStatus {
	if (approved) {
		return "completed";
	}
	if (submitted) {
		return "in_progress";
	}
	return "pending";
}

function buildStages(
	closure: ClosureWorkflowSummary,
	billing: CostTraceabilitySummary["billing"],
): PipelineStage[] {
	return [
		{
			key: "delivery",
			label: "Acta de entrega",
			detail: closure.deliveryRecordSigned ? "Firmada por el cliente" : "Sin firma del cliente",
			status: closure.deliveryRecordSigned ? "completed" : "pending",
			icon: FileSignature,
		},
		{
			key: "ses",
			label: "SES / Ariba",
			detail: closure.sesApproved
				? "Aprobada por el cliente"
				: closure.sesSubmitted
					? "Radicada, esperando aprobación"
					: "Sin radicar en Ariba",
			status: stageStatus(closure.sesApproved, closure.sesSubmitted),
			icon: ScrollText,
			amount: billing.sesValue,
		},
		{
			key: "invoice",
			label: "Factura",
			detail: closure.invoiceApproved
				? "Aprobada por el cliente"
				: closure.invoiceSubmitted
					? "Radicada, esperando aprobación"
					: "Sin emitir",
			status: stageStatus(closure.invoiceApproved, closure.invoiceSubmitted),
			icon: Receipt,
			amount: billing.invoiceValue,
		},
		{
			key: "payment",
			label: "Pago",
			detail: closure.paymentReconciled ? "Conciliado" : "Sin registrar",
			status: closure.paymentReconciled ? "completed" : "pending",
			icon: Banknote,
			amount: billing.paidValue,
		},
	];
}

function StageIcon({ stage }: { stage: PipelineStage }) {
	if (stage.status === "completed") {
		return <CircleCheck className="size-4" aria-hidden="true" />;
	}
	if (stage.status === "in_progress") {
		return <Clock3 className="size-4" aria-hidden="true" />;
	}
	return <CircleDashed className="size-4" aria-hidden="true" />;
}

export function AdministrativeClosurePipeline({
	closure,
	billing,
}: AdministrativeClosurePipelineProps) {
	const stages = buildStages(closure, billing);
	const isOverdue = closure.daysOverdue > 0;

	return (
		<section
			aria-label="Cierre administrativo"
			className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
					Cierre administrativo — SES → Factura → Pago
				</p>
				{closure.caseClosed ? (
					<span className="rounded-full border border-brand-annotate px-2.5 py-1 text-[10px] font-bold uppercase text-brand-annotate">
						Caso cerrado
					</span>
				) : closure.closingPackageReady ? (
					<span className="rounded-full border border-[var(--color-brand)] px-2.5 py-1 text-[10px] font-bold uppercase text-[var(--color-brand)]">
						Paquete de cierre listo
					</span>
				) : null}
			</div>

			{isOverdue && (
				<div
					role="alert"
					className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-3 py-2 text-xs font-semibold text-[var(--color-danger)]"
				>
					Cierre vencido hace {closure.daysOverdue === 1 ? "1 día" : `${closure.daysOverdue} días`}{" "}
					— priorizar radicación y cobro (FALLA 4).
				</div>
			)}

			<ol className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
				{stages.map((stage) => (
					<li
						key={stage.key}
						className={`rounded-[var(--radius-md)] border bg-[var(--surface-secondary)] p-3 ${STATUS_CLASSES[stage.status]}`}
					>
						<div className="flex items-center justify-between gap-2">
							<span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-primary)]">
								<stage.icon className="size-3.5" aria-hidden="true" />
								{stage.label}
							</span>
							<span className="flex items-center gap-1 text-[10px] font-semibold uppercase">
								<StageIcon stage={stage} />
								{STATUS_LABEL[stage.status]}
							</span>
						</div>
						<p className="mt-2 text-[11px] text-[var(--text-secondary)]">{stage.detail}</p>
						{typeof stage.amount === "number" && stage.amount > 0 && (
							<p className="mt-1 font-mono text-[11px] font-semibold text-[var(--text-primary)]">
								{CURRENCY_FORMATTER.format(stage.amount)}
							</p>
						)}
					</li>
				))}
			</ol>

			{billing.pendingValue > 0 && (
				<p className="mt-3 text-[11px] text-[var(--text-secondary)]">
					Pendiente por cobrar:{" "}
					<span className="font-mono font-semibold text-[var(--text-primary)]">
						{CURRENCY_FORMATTER.format(billing.pendingValue)}
					</span>
				</p>
			)}
		</section>
	);
}
