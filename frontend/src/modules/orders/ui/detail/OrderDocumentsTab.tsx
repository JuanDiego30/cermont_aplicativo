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
				className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
			>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="mb-4 size-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
					<div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section
				aria-label="Documentos de la orden"
				className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/20"
			>
				<div className="flex items-start gap-3">
					<AlertCircle
						className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400"
						aria-hidden="true"
					/>
					<div>
						<p className="text-sm font-medium text-red-900 dark:text-red-300">
							Error al cargar los documentos.
						</p>
						<p className="mt-1 text-xs text-red-700 dark:text-red-400">
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
			className="space-y-6 rounded-xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
		>
			<DocumentUploader defaultOrderId={orderId} />

			{(data ?? []).length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText className="mb-4 size-10 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
					<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Sin documentos</h3>
					<p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
						No hay documentos asociados a esta orden. Suba un documento para comenzar.
					</p>
				</div>
			) : (
				<DocumentGallery documents={data ?? []} />
			)}
		</section>
	);
}
