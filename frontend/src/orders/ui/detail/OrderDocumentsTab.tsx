"use client";

import { AlertCircle, FileText } from "lucide-react";
import { useDocuments } from "@/documents/queries";
import { DocumentGallery } from "@/documents/ui/DocumentGallery";
import { DocumentUploader } from "@/documents/ui/DocumentUploader";

interface OrderDocumentsTabProps {
	orderId: string;
}

export function OrderDocumentsTab({ orderId }: OrderDocumentsTabProps) {
	const { data, isLoading, error } = useDocuments({ orderId: orderId });
	const planningDocs = (data ?? []).filter((doc) => doc.phase === "planning");
	const executionDocs = (data ?? []).filter((doc) => doc.phase === "execution");
	const closureDocs = (data ?? []).filter((doc) => doc.phase === "closure");

	if (isLoading) {
		return (
			<section
				aria-label="Documentos de la orden"
				className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
			>
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<div className="mb-4 h-10 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
					<div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
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
						className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
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
			className="space-y-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
		>
			<DocumentUploader defaultOrderId={orderId} defaultPhase="planning" />

			{(data ?? []).length === 0 ? (
				<div className="flex flex-col items-center justify-center py-8 text-center">
					<FileText
						className="mb-4 h-10 w-10 text-slate-300 dark:text-slate-600"
						aria-hidden="true"
					/>
					<h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sin documentos</h3>
					<p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
						No hay documentos asociados a esta orden. Suba un documento para comenzar.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<PhaseDocuments title="Planeación" documents={planningDocs} defaultOpen />
					<PhaseDocuments title="Ejecución" documents={executionDocs} />
					<PhaseDocuments title="Cierre" documents={closureDocs} />
				</div>
			)}
		</section>
	);
}

function PhaseDocuments({
	title,
	documents,
	defaultOpen = false,
}: {
	title: string;
	documents: NonNullable<ReturnType<typeof useDocuments>["data"]>;
	defaultOpen?: boolean;
}) {
	return (
		<details
			open={defaultOpen || documents.length > 0}
			className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
		>
			<summary className="cursor-pointer text-sm font-semibold text-slate-900 dark:text-white">
				{title} ({documents.length})
			</summary>
			<div className="mt-4">
				<DocumentGallery documents={documents} />
			</div>
		</details>
	);
}
