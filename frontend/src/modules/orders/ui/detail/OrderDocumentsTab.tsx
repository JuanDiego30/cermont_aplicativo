"use client";

import { AlertCircle, FileText } from "lucide-react";
import { useDocuments } from "@/modules/documents/queries";
import { DocumentGallery } from "@/modules/documents/ui/DocumentGallery";
import { DocumentUploader } from "@/modules/documents/ui/DocumentUploader";

interface OrderDocumentsTabProps {
	orderId: string;
}

export function OrderDocumentsTab({ orderId }: OrderDocumentsTabProps) {
	const { data, isLoading, error } = useDocuments({ order_id: orderId });

	if (isLoading) {
		return (
			<section
				aria-label="Documentos de la orden"
				className="rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-6 border-800 bg-950"
			>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="mb-4 size-10 animate-pulse rounded-full bg-[var(--surface-secondary)] bg-800" />
					<div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-secondary)] bg-800" />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				aria-label="Documentos de la orden"
				className="rounded-xl border border-red-200 bg-danger-bg p-6 dark:border-red-900 dark:bg-red-950/20"
			>
				<div className="flex items-start gap-3">
					<AlertCircle
						className="mt-0.5 size-5 shrink-0 text-brand-error dark:text-brand-error"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-brand-error dark:text-brand-error">
							Error al cargar los documentos.
						</p>
						<p className="mt-1 text-xs text-brand-error dark:text-brand-error">
							Intente nuevamente más tarde.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section
			aria-label="Documentos de la orden"
			className="space-y-6 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-card)] p-4 sm:p-6 border-800 bg-950"
		>
			<DocumentUploader defaultOrderId={orderId} />

			{(data ?? []).length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText className="mb-4 size-10 text-muted-text text-600" aria-hidden="true" />
					<h3 className="text-lg font-semibold text-[var(--text-primary)] dark:text-white">
						Sin documentos
					</h3>
					<p className="mt-2 max-w-sm text-sm text-[var(--text-tertiary)] text-400">
						No hay documentos asociados a esta orden. Suba un documento para comenzar.
					</p>
				</div>
			) : (
				<DocumentGallery documents={data ?? []} />
			)}
		</section>
	);
}
