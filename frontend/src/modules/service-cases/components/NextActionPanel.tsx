"use client";

import type { CermontOperationalStepCode, DomainBlocker, NextAction } from "@cermont/shared-types";
import { ArrowRight, FilePlus2, FileUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/Button";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";

interface NextActionPanelProps {
	blockers: DomainBlocker[];
	nextActions: NextAction[];
	orderId?: string;
	serviceCaseId: string;
	stepCode: CermontOperationalStepCode;
}

function hasEvidenceGap(blockers: DomainBlocker[]): boolean {
	return blockers.some(
		(blocker) =>
			blocker.code === "MISSING_STEP_REQUIRED_EVIDENCE" ||
			blocker.field?.includes("photo") ||
			blocker.field?.includes("evidence"),
	);
}

function resolveSupportPurpose(
	stepCode: CermontOperationalStepCode,
	blockers: DomainBlocker[],
): "closing_evidence" | "support_document" {
	if (stepCode >= "step_08_delivery_record" || hasEvidenceGap(blockers)) {
		return "closing_evidence";
	}

	return "support_document";
}

function resolveSupportLabel(
	stepCode: CermontOperationalStepCode,
	blockers: DomainBlocker[],
): string {
	if (stepCode >= "step_08_delivery_record") {
		return "Adjuntar soporte de cierre";
	}

	if (hasEvidenceGap(blockers)) {
		return "Cargar evidencia del paso";
	}

	return "Adjuntar soporte del paso";
}

export function NextActionPanel({
	blockers,
	nextActions,
	orderId,
	serviceCaseId,
	stepCode,
}: NextActionPanelProps) {
	const supportPurpose = resolveSupportPurpose(stepCode, blockers);
	const supportLabel = resolveSupportLabel(stepCode, blockers);

	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-card">
			<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
				Próximas acciones
			</p>
			<h3 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
				Qué hacer ahora para destrabar el caso
			</h3>

			<div className="mt-4 space-y-3">
				<ContextualDocumentUploadModal
					defaultOrderId={orderId}
					defaultPurpose={supportPurpose}
					defaultServiceCaseId={serviceCaseId}
					defaultStepCode={stepCode}
					title={supportLabel}
				>
					<Button
						type="button"
						variant="primary"
						className="w-full justify-between rounded-[var(--radius-lg)]"
					>
						<span className="flex items-center gap-2">
							<FileUp className="size-4" />
							{supportLabel}
						</span>
						<ArrowRight className="size-4" />
					</Button>
				</ContextualDocumentUploadModal>

				<ContextualDocumentUploadModal
					defaultOrderId={orderId}
					defaultPurpose="template_source"
					defaultServiceCaseId={serviceCaseId}
					defaultStepCode={stepCode}
					title="Convertir documento en formulario"
					description="Sube un PDF, Word o Excel y conviértelo en un borrador editable para el paso actual."
				>
					<Button
						type="button"
						variant="secondary"
						className="w-full justify-between rounded-[var(--radius-lg)]"
					>
						<span className="flex items-center gap-2">
							<Sparkles className="size-4 text-[var(--color-brand)]" />
							Convertir documento en formulario
						</span>
						<ArrowRight className="size-4" />
					</Button>
				</ContextualDocumentUploadModal>
			</div>

			{nextActions.length > 0 ? (
				<ul className="mt-5 space-y-2">
					{nextActions.map((action) => (
						<li key={`${action.command}-${action.route || action.label}`}>
							{action.route ? (
								<Link
									href={action.route}
									className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-primary)] transition-colors hover:border-[var(--color-brand)]"
								>
									<span className="flex items-center gap-2">
										<FilePlus2 className="size-3.5 text-[var(--color-brand)]" />
										{action.label}
									</span>
									<span className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
										{action.requiredRole}
									</span>
								</Link>
							) : (
								<div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-xs text-[var(--text-secondary)]">
									{action.label}
								</div>
							)}
						</li>
					))}
				</ul>
			) : (
				<p className="mt-5 text-xs text-[var(--text-secondary)]">
					No hay acciones automáticas adicionales. El caso depende de los soportes y validaciones
					mostradas arriba.
				</p>
			)}
		</section>
	);
}
