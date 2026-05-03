"use client";

import { ExternalLink, FileWarning, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toApiUrl } from "@/_shared/lib/http/api-client";

interface PdfPreviewPanelProps {
	orderId: string;
	pdfUrl: string | null;
	reportSummary: string | null;
}

function resolvePdfPreviewUrl(orderId: string, pdfUrl: string | null): string {
	if (pdfUrl?.startsWith("http://") || pdfUrl?.startsWith("https://")) {
		return pdfUrl;
	}

	if (pdfUrl?.startsWith("/api/reports/")) {
		return toApiUrl(pdfUrl.replace(/^\/api/, ""));
	}

	if (pdfUrl?.startsWith("/reports/")) {
		return toApiUrl(pdfUrl);
	}

	return toApiUrl(`/reports/order/${encodeURIComponent(orderId)}/pdf`);
}

export function PdfPreviewPanel({ orderId, pdfUrl, reportSummary }: PdfPreviewPanelProps) {
	const [isLoading, setIsLoading] = useState(true);
	const hasReportDraft = Boolean(reportSummary || pdfUrl);
	const iframeSrc = useMemo(() => resolvePdfPreviewUrl(orderId, pdfUrl), [orderId, pdfUrl]);

	if (!hasReportDraft) {
		return (
			<section className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] px-6 text-center">
				<FileWarning className="h-10 w-10 text-[var(--color-warning)]" aria-hidden="true" />
				<div>
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						Informe pendiente por generar
					</h3>
					<p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">
						Sincroniza la orden para crear el borrador y habilitar la vista previa del PDF.
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
			<header className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] px-4 py-2">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">
					Vista previa del informe
				</h3>
				<a
					href={iframeSrc}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-md)] px-2 py-1 text-xs font-semibold text-[var(--color-brand-blue)] transition-colors hover:bg-[var(--color-info-bg)]"
				>
					<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
					Abrir PDF
				</a>
			</header>

			{reportSummary ? (
				<aside className="border-b border-[var(--border-default)] px-4 py-3">
					<p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">Resumen</p>
					<p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{reportSummary}</p>
				</aside>
			) : null}

			{isLoading ? (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--surface-primary)]/85">
					<Loader2 className="h-8 w-8 animate-spin text-[var(--color-brand-blue)]" />
				</div>
			) : null}

			<iframe
				src={iframeSrc}
				title={`Informe de trabajo ${orderId}`}
				className="min-h-0 flex-1 bg-white"
				onLoad={() => setIsLoading(false)}
			/>
		</section>
	);
}
