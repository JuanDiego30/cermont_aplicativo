"use client";

import type { LinkedDocumentSummary } from "@cermont/shared-types";
import { CERMONT_OPERATIONAL_STEPS } from "@cermont/shared-types";
import { ExternalLink, FileText } from "lucide-react";

interface LinkedDocumentsSectionProps {
	documents: LinkedDocumentSummary[];
}

const PURPOSE_LABEL: Record<LinkedDocumentSummary["purpose"], string> = {
	library: "Biblioteca",
	evidence: "Evidencia",
	form_source: "Formato fuente",
	closure_support: "Soporte de cierre",
	report_attachment: "Anexo de informe",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

function stepLabel(stepCode: string): string {
	const step = CERMONT_OPERATIONAL_STEPS.find((item) => item.code === stepCode);
	return step ? `${step.stepNumber}. ${step.label}` : stepCode;
}

export function LinkedDocumentsSection({ documents }: LinkedDocumentsSectionProps) {
	if (documents.length === 0) {
		return (
			<div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-5 text-center text-sm text-[var(--text-secondary)]">
				Sin documentos vinculados a este caso todavía.
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[560px] text-left text-xs">
				<caption className="sr-only">Documentos vinculados al caso</caption>
				<thead>
					<tr className="border-b border-[var(--border-subtle)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
						<th scope="col" className="px-3 py-2">
							Documento
						</th>
						<th scope="col" className="px-3 py-2">
							Propósito
						</th>
						<th scope="col" className="px-3 py-2">
							Paso
						</th>
						<th scope="col" className="px-3 py-2">
							Cargado
						</th>
						<th scope="col" className="px-3 py-2">
							<span className="sr-only">Acciones</span>
						</th>
					</tr>
				</thead>
				<tbody>
					{documents.map((document) => (
						<tr
							key={document.documentId}
							className="border-b border-[var(--border-subtle)] last:border-b-0"
						>
							<td className="px-3 py-2.5">
								<span className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
									<FileText
										className="size-3.5 shrink-0 text-[var(--color-brand)]"
										aria-hidden="true"
									/>
									{document.title}
								</span>
							</td>
							<td className="px-3 py-2.5 text-[var(--text-secondary)]">
								{PURPOSE_LABEL[document.purpose]}
							</td>
							<td className="px-3 py-2.5 text-[var(--text-secondary)]">
								{document.stepCode ? stepLabel(document.stepCode) : "General"}
							</td>
							<td className="px-3 py-2.5 text-[var(--text-secondary)]">
								{document.uploadedAt
									? DATE_FORMATTER.format(new Date(document.uploadedAt))
									: "Sin fecha"}
							</td>
							<td className="px-3 py-2.5 text-right">
								{document.fileUrl && (
									<a
										href={document.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 font-semibold text-[var(--color-brand)] hover:underline"
									>
										Ver
										<ExternalLink className="size-3" aria-hidden="true" />
									</a>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
