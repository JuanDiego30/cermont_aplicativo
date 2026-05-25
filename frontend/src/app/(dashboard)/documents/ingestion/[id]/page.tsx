"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useTemplateDraft } from "@/modules/templates/queries";
import { TemplateDraftReviewer } from "@/modules/templates/ui/TemplateDraftReviewer";

export default function IngestionReviewPage() {
	return (
		<Suspense fallback={<ReviewLoading />}>
			<IngestionReviewInner />
		</Suspense>
	);
}

function ReviewLoading() {
	return (
		<div className="flex flex-col items-center justify-center py-20 gap-4">
			<Loader2 className="size-8 animate-spin text-[var(--color-brand)]" />
			<p className="text-sm font-medium text-[var(--text-secondary)]">
				Analizando estructura del borrador...
			</p>
		</div>
	);
}

function IngestionReviewInner() {
	const params = useParams();
	const id = params.id as string;
	const { data: envelope, isLoading, isError, refetch } = useTemplateDraft(id);
	const draft = envelope?.data;

	if (isLoading) {
		return <ReviewLoading />;
	}

	if (isError) {
		return (
			<div className="p-8 text-center rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]">
				<h2 className="text-lg font-bold text-[var(--text-primary)]">
					Error al cargar el borrador
				</h2>
				<p className="mt-2 text-sm text-[var(--text-secondary)]">
					No se pudo recuperar la información de la ingesta.
				</p>
				<button
					type="button"
					onClick={() => refetch()}
					className="mt-4 px-4 py-2 bg-white border border-[var(--border-default)] rounded-lg text-sm font-bold"
				>
					Reintentar
				</button>
			</div>
		);
	}

	if (!draft) {
		return (
			<div className="p-12 text-center border-2 border-dashed border-[var(--border-default)] rounded-xl">
				<p className="text-sm text-[var(--text-muted)]">
					El borrador solicitado no existe o ha sido eliminado.
				</p>
				<Link
					href="/documents"
					className="mt-4 inline-block text-[var(--color-brand)] font-bold text-sm hover:underline"
				>
					Volver a Documentos
				</Link>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Link
				href="/documents"
				className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-brand)] hover:opacity-80 transition-opacity"
			>
				<ArrowLeft className="size-4" /> Volver a Gestión de Documentos
			</Link>

			<header className="p-5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-sm">
				<p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
					Ingesta Documental
				</p>
				<h1 className="text-2xl font-black text-[var(--text-primary)] mt-1">
					Revisión de Borrador
				</h1>
				<p className="text-sm text-[var(--text-secondary)] mt-1">
					Valide los campos extraídos automáticamente antes de publicar la plantilla oficial.
				</p>
			</header>

			<TemplateDraftReviewer
				key={`${draft._id}-${draft.updatedAt ?? draft.status}`}
				draft={draft}
			/>
		</div>
	);
}
