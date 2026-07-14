"use client";

import type {
	CermontOperationalStepCode,
	ServiceCaseWorkflowViewModel,
} from "@cermont/shared-types";
import { FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";
import { AdministrativeClosurePipeline } from "./AdministrativeClosurePipeline";
import { CockpitTabs } from "./CockpitTabs";
import { CostComparisonPanel } from "./CostComparisonPanel";
import { EvidenceGallerySection } from "./EvidenceGallerySection";
import { LinkedDocumentsSection } from "./LinkedDocumentsSection";
import { NextActionPanel } from "./NextActionPanel";
import { OperationalStepProgress } from "./OperationalStepProgress";
import { SlaDeadlineBadge } from "./SlaDeadlineBadge";
import { StepRequirementPanel } from "./StepRequirementPanel";
import { WorkflowBlockerList } from "./WorkflowBlockerList";

interface ServiceCaseWorkflowCockpitProps {
	isAdvancing?: boolean;
	onAdvance?: () => void;
	serviceCase: ServiceCaseWorkflowViewModel;
}

const ARTIFACT_LINKS: Record<string, string> = {
	workRequest: "/work-requests/",
	siteVisit: "/site-visits/",
	proposal: "/proposals/",
	purchaseOrder: "/purchase-orders/",
	workOrder: "/orders/",
	planningPacket: "/planning/",
	executionSession: "/execution/",
	technicalReport: "/reports/",
	deliveryRecord: "/delivery-records/",
	serviceEntrySheet: "/billing/ses/",
	invoice: "/billing/invoices/",
	payment: "/payments/",
};

const ARTIFACT_NAMES: Record<string, string> = {
	workRequest: "Solicitud",
	siteVisit: "Visita técnica",
	proposal: "Propuesta",
	purchaseOrder: "PO",
	workOrder: "Orden de trabajo",
	planningPacket: "Planeación",
	executionSession: "Ejecución",
	technicalReport: "Informe técnico",
	deliveryRecord: "Acta de entrega",
	serviceEntrySheet: "SES / Ariba",
	invoice: "Factura",
	payment: "Pago",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("es-CO", {
	style: "currency",
	currency: "COP",
	maximumFractionDigits: 0,
});

function formatDate(value: Date | string): string {
	return DATE_FORMATTER.format(new Date(value));
}

function formatMoney(value: number | undefined): string {
	if (typeof value !== "number") {
		return "Sin dato";
	}

	return CURRENCY_FORMATTER.format(value);
}

function statusColor(status: string): string {
	const done = ["approved", "signed", "completed", "paid", "reconciled", "accepted"];
	if (done.includes(status)) {
		return "text-[var(--color-success)]";
	}
	if (status === "rejected" || status === "cancelled") {
		return "text-[var(--color-danger)]";
	}
	return "text-[var(--color-warning)]";
}

function resolveUploadPurpose(
	stepNumber: number | undefined,
): "closing_evidence" | "support_document" {
	return stepNumber && stepNumber >= 8 ? "closing_evidence" : "support_document";
}

export function ServiceCaseWorkflowCockpit({
	isAdvancing,
	onAdvance,
	serviceCase,
}: ServiceCaseWorkflowCockpitProps) {
	const currentStepCode = (serviceCase.currentStepCode ||
		"step_01_work_request") as CermontOperationalStepCode;
	const currentStep =
		serviceCase.steps.find((step) => step.code === currentStepCode) ?? serviceCase.steps[0];
	const orderId = serviceCase.artifacts.workOrder?.id;
	const operationalSummary = serviceCase.operationalSummary;
	const financialSummary = serviceCase.financialSummary;
	const uploadPurpose = resolveUploadPurpose(currentStep?.stepNumber);

	return (
		<div className="space-y-6">
			<WorkflowHeader
				clientName={serviceCase.clientName}
				code={serviceCase.code}
				currentStepNumber={currentStep?.stepNumber}
				currentStepCode={currentStepCode}
				daysInCurrentStep={operationalSummary?.daysInCurrentStep}
				deadline={serviceCase.deadline}
				orderId={orderId}
				serviceCaseId={serviceCase.serviceCaseId}
				updatedAt={serviceCase.updatedAt}
				uploadPurpose={uploadPurpose}
			/>

			<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-2 shadow-card">
				<OperationalStepProgress currentStepCode={currentStepCode} steps={serviceCase.steps} />
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
				<div className="space-y-6">
					{currentStep ? (
						<StepRequirementPanel
							step={currentStep}
							requirements={serviceCase.activeStepRequirements || currentStep.requirements || []}
							blockers={serviceCase.blockers || []}
							canAdvance={serviceCase.canAdvance ?? false}
							onAdvance={onAdvance}
							isAdvancing={isAdvancing}
							showBlockers={false}
						/>
					) : null}

					<WorkflowSummaryPanels
						blockerCount={serviceCase.blockers.length}
						financialSummary={financialSummary}
						operationalSummary={operationalSummary}
					/>

					<CockpitTabs
						ariaLabel="Contenido del caso por categoría"
						tabs={[
							{
								id: "documents",
								label: "Documentos",
								badge: (serviceCase.documents ?? []).length,
								content: (
									<div className="space-y-5">
										<ArtifactsSection artifacts={serviceCase.artifacts ?? {}} />
										<LinkedDocumentsSection documents={serviceCase.documents ?? []} />
									</div>
								),
							},
							{
								id: "evidences",
								label: "Evidencias",
								badge: (serviceCase.evidences ?? []).length,
								content: <EvidenceGallerySection evidences={serviceCase.evidences ?? []} />,
							},
							{
								id: "costs",
								label: "Costos",
								content:
									serviceCase.costs.estimated.estimatedTotalCost > 0 ||
									serviceCase.costs.actual.actualTotalCost > 0 ||
									serviceCase.costs.billing.invoiceValue > 0 ? (
										<CostComparisonPanel
											costs={serviceCase.costs}
											serviceCaseId={serviceCase.serviceCaseId}
										/>
									) : (
										<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
											Sin datos de costos registrados para este caso todavía.
										</div>
									),
							},
							{
								id: "closure",
								label: "Cierre admin",
								content: (
									<AdministrativeClosurePipeline
										closure={serviceCase.closure}
										billing={serviceCase.costs.billing}
									/>
								),
							},
						]}
					/>
				</div>

				<div className="space-y-6">
					<WorkflowBlockerList
						blockers={serviceCase.blockers || []}
						serviceCaseId={serviceCase.serviceCaseId}
					/>
					<NextActionPanel
						blockers={serviceCase.blockers || []}
						nextActions={serviceCase.nextActions || []}
						orderId={orderId}
						serviceCaseId={serviceCase.serviceCaseId}
						stepCode={currentStepCode}
					/>
					<TimelineSection timeline={serviceCase.timeline ?? []} />
				</div>
			</div>
		</div>
	);
}

function WorkflowHeader({
	clientName,
	code,
	currentStepCode,
	currentStepNumber,
	daysInCurrentStep,
	deadline,
	orderId,
	serviceCaseId,
	updatedAt,
	uploadPurpose,
}: {
	clientName: string;
	code: string;
	currentStepCode: CermontOperationalStepCode;
	currentStepNumber?: number;
	daysInCurrentStep?: number;
	deadline?: string;
	orderId?: string;
	serviceCaseId: string;
	updatedAt: string;
	uploadPurpose: "closing_evidence" | "support_document";
}) {
	const isStuck = typeof daysInCurrentStep === "number" && daysInCurrentStep >= 5;
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-card">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex gap-4">
					<div className="rounded-xl bg-[var(--color-brand-blue-bg)] p-3">
						<LayoutDashboard className="size-6 text-[var(--color-brand)]" />
					</div>
					<div className="space-y-2">
						<div className="flex flex-wrap items-center gap-2">
							<h2 id="sc-detail-title" className="text-xl font-bold text-[var(--text-primary)]">
								{code}
							</h2>
							<span className="rounded-full border border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-3 py-1 text-[10px] font-bold uppercase text-[var(--color-brand)]">
								Workflow 14 pasos
							</span>
						</div>
						<p className="text-sm text-[var(--text-secondary)]">{clientName}</p>
						<div className="flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
							<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1">
								Paso actual: {currentStepNumber || "?"}
							</span>
							{typeof daysInCurrentStep === "number" && (
								<span
									className={`rounded-full border px-2.5 py-1 font-semibold ${
										isStuck
											? "border-brand-warn bg-warning-bg text-brand-warn"
											: "border-[var(--border-subtle)] bg-[var(--surface-secondary)]"
									}`}
									title={isStuck ? "Este caso lleva varios días sin avanzar" : undefined}
								>
									{isStuck ? "⚠ " : ""}
									{daysInCurrentStep === 0
										? "Avanzado hoy"
										: daysInCurrentStep === 1
											? "1 día en este paso"
											: `${daysInCurrentStep} días en este paso`}
								</span>
							)}
							<span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-2.5 py-1">
								Actualizado: {formatDate(updatedAt)}
							</span>
							{deadline && <SlaDeadlineBadge deadline={deadline} />}
						</div>
					</div>
				</div>

				<ContextualDocumentUploadModal
					defaultOrderId={orderId}
					defaultPurpose={uploadPurpose}
					defaultServiceCaseId={serviceCaseId}
					defaultStepCode={currentStepCode}
					title="Adjuntar soporte al paso actual"
				>
					<button
						type="button"
						className="rounded-[var(--radius-lg)] border border-[var(--color-brand)] bg-[var(--color-brand-blue-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-brand)] transition-colors hover:bg-[var(--surface-primary)]"
					>
						Adjuntar soporte contextual
					</button>
				</ContextualDocumentUploadModal>
			</div>
		</div>
	);
}

function WorkflowSummaryPanels({
	blockerCount,
	financialSummary,
	operationalSummary,
}: {
	blockerCount: number;
	financialSummary: ServiceCaseWorkflowViewModel["financialSummary"];
	operationalSummary: ServiceCaseWorkflowViewModel["operationalSummary"];
}) {
	const daysInStep =
		typeof operationalSummary?.daysInCurrentStep === "number"
			? operationalSummary.daysInCurrentStep
			: null;

	const operationalItems = [
		{
			label: "Días en paso actual",
			value:
				daysInStep !== null
					? daysInStep === 0
						? "Hoy"
						: daysInStep === 1
							? "1 día"
							: `${daysInStep} días`
					: "—",
		},
		{
			label: "Evidencias",
			value: String(operationalSummary?.evidenceCount ?? 0),
		},
		{
			label: "Bloqueadores",
			value: String(operationalSummary?.blockersCount ?? blockerCount),
		},
		{
			label: "Horas reales",
			value:
				typeof operationalSummary?.totalLaborHours === "number"
					? `${operationalSummary.totalLaborHours} h`
					: "Sin dato",
		},
		{
			label: "Materiales",
			value: String(operationalSummary?.totalMaterialLines ?? 0),
		},
	];

	const financialItems = [
		{ label: "Propuesta", value: formatMoney(financialSummary?.proposalAmount) },
		{ label: "Costo real", value: formatMoney(financialSummary?.actualCost) },
		{ label: "Facturado", value: formatMoney(financialSummary?.invoicedAmount) },
		{ label: "Pagado", value: formatMoney(financialSummary?.paidAmount) },
	];

	return (
		<div className="grid gap-4 xl:grid-cols-2">
			<SummarySection title="Resumen operativo" items={operationalItems} />
			<SummarySection title="Resumen financiero" items={financialItems} />
		</div>
	);
}

function SummarySection({
	items,
	title,
}: {
	items: Array<{ label: string; value: string }>;
	title: string;
}) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
				{title}
			</p>
			<div className="mt-4 grid gap-3 sm:grid-cols-2">
				{items.map((item) => (
					<SummaryItem key={item.label} label={item.label} value={item.value} />
				))}
			</div>
		</section>
	);
}

function ArtifactsSection({ artifacts }: { artifacts: ServiceCaseWorkflowViewModel["artifacts"] }) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
					<FileText className="size-4 text-[var(--color-brand)]" />
					Soportes y entregables vinculados
				</h3>
			</div>
			<div className="grid gap-3 sm:grid-cols-2">
				{Object.entries(artifacts).map(([key, artifact]) => {
					if (!artifact) {
						return null;
					}

					return <ArtifactCard key={key} artifact={artifact} artifactKey={key} />;
				})}
			</div>
		</section>
	);
}

function ArtifactCard({
	artifact,
	artifactKey,
}: {
	artifact: { code?: string; id: string; status: string; updatedAt: string };
	artifactKey: string;
}) {
	const name = ARTIFACT_NAMES[artifactKey] ?? artifactKey;
	const href = ARTIFACT_LINKS[artifactKey];

	return (
		<Link
			href={href ? `${href}${artifact.id}` : "#"}
			className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3 transition-all hover:border-[var(--color-brand)] hover:shadow-sm"
		>
			<p className="text-[11px] font-bold text-[var(--text-primary)]">{name}</p>
			<div className="mt-1 flex items-center justify-between">
				<p className="font-mono text-[10px] text-[var(--text-muted)]">
					{artifact.code ?? String(artifact.id).slice(-8)}
				</p>
				<span
					className={`inline-flex rounded-full border border-current bg-canvas px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusColor(artifact.status)}`}
				>
					{artifact.status}
				</span>
			</div>
		</Link>
	);
}

function TimelineSection({ timeline }: { timeline: ServiceCaseWorkflowViewModel["timeline"] }) {
	if (timeline.length === 0) {
		return null;
	}

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-card">
			<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
				Línea de tiempo
			</p>
			<div className="mt-4 space-y-4">
				{[...timeline]
					.reverse()
					.slice(0, 8)
					.map((entry) => (
						<div key={entry.eventId} className="flex gap-3 text-[11px]">
							<div className="flex shrink-0 flex-col items-center">
								<div className="size-2 rounded-full bg-[var(--color-brand)]" />
								<div className="mt-1 h-full w-0.5 bg-[var(--border-subtle)]" />
							</div>
							<div className="space-y-1 pb-4">
								<p className="font-bold text-[var(--text-primary)]">{entry.command}</p>
								<p className="text-[var(--text-muted)]">{formatDate(entry.occurredAt)}</p>
								{entry.notes ? (
									<p className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-2 text-[var(--text-secondary)]">
										{entry.notes}
									</p>
								) : null}
							</div>
						</div>
					))}
			</div>
		</section>
	);
}

function SummaryItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-3">
			<p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
				{label}
			</p>
			<p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{value}</p>
		</div>
	);
}
