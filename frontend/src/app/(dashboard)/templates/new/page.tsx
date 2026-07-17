"use client";

import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ContextualDocumentUploadModal } from "@/modules/documents/ui/ContextualDocumentUploadModal";

export default function NewTemplatePage() {
	return (
		<section className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
			<Link
				href="/templates"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver a plantillas
			</Link>

			<header>
				<h1 className="text-2xl font-semibold text-[var(--text-primary)]">
					Nueva plantilla
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Carga un documento como fuente de plantilla. El sistema lo procesará y lo
					convertirá en un formulario dinámico reutilizable.
				</p>
			</header>

			<div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-2)]">
				<p className="mb-4 text-sm text-[var(--text-secondary)]">
					Selecciona un archivo PDF, Word o Excel para usarlo como plantilla. El documento
					pasará por un flujo de ingestión, revisión y aprobación antes de quedar
					publicado.
				</p>
				<ContextualDocumentUploadModal
					defaultPurpose="template_source"
					title="Cargar documento como plantilla"
					description="Sube el archivo que servirá como base para la plantilla."
				>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
					>
						<Plus className="size-4" aria-hidden="true" />
						Seleccionar archivo
					</button>
				</ContextualDocumentUploadModal>
			</div>

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-4">
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">
					¿Cómo funciona?
				</h3>
				<ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[var(--text-secondary)]">
					<li>Carga un documento (PDF, Word o Excel)</li>
					<li>El sistema procesa el documento y crea un borrador de plantilla</li>
					<li>Revisa y ajusta los campos del formulario generado</li>
					<li>Una vez aprobada, la plantilla queda disponible para usar en campo</li>
				</ol>
			</div>
		</section>
	);
}
