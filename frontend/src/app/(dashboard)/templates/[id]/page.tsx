"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import type { DocumentTemplateItem } from "@/modules/templates/queries";
import { useTemplate } from "@/modules/templates/queries";

export default function TemplateDetailPage() {
	return (
		<Suspense fallback={<DetailSkeleton />}>
			<TemplateDetailInner />
		</Suspense>
	);
}

function DetailSkeleton() {
	return (
		<section className="space-y-6" aria-label="Cargando plantilla">
			<div className="h-8 w-48 animate-pulse rounded-[var(--radius-md)] bg-zinc-100" />
			<div className="h-32 animate-pulse rounded-[var(--radius-lg)] bg-zinc-100" />
		</section>
	);
}

function TemplateDetailInner() {
	const params = useParams();
	const id = (params.id as string) ?? "";
	const { data: envelope, isLoading, isError, refetch } = useTemplate(id);
	const tpl = envelope?.data;

	return (
		<section className="space-y-6" aria-labelledby="template-detail-title">
			<Link
				href="/templates"
				className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-brand)]"
			>
				<ArrowLeft className="size-4" aria-hidden="true" /> Volver a Plantillas
			</Link>

			{isLoading && (
				<div className="flex items-center justify-center py-16" role="status">
					<Loader2 className="size-7 animate-spin text-[var(--color-brand)]" aria-hidden="true" />
					<span className="sr-only">Cargando plantilla</span>
				</div>
			)}

			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar la plantilla
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						Ocurrió un error al obtener los datos.
					</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm font-medium text-[var(--text-primary)]"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !isError && !tpl && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						Plantilla no encontrada
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El identificador no corresponde a ninguna plantilla.
					</p>
				</div>
			)}

			{tpl && <TemplateContent tpl={tpl} />}
		</section>
	);
}

function TemplateContent({ tpl }: { tpl: DocumentTemplateItem }) {
	const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
	const fmtDate = (v: string) => dateFmt.format(new Date(v));

	return (
		<div className="space-y-4">
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-card">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2
							id="template-detail-title"
							className="text-xl font-semibold text-[var(--text-primary)]"
						>
							{tpl.name}
						</h2>
						<p className="text-sm text-[var(--text-secondary)]">v{tpl.version ?? 1}</p>
					</div>
					<span className="inline-flex rounded-full border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
						{tpl.status}
					</span>
				</div>
			</div>

			{tpl.description && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card">
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">Descripción</h3>
					<p className="mt-2 text-sm text-[var(--text-secondary)]">{tpl.description}</p>
				</div>
			)}

			<div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
				<span>Creado: {fmtDate(tpl.createdAt)}</span>
				<span>Actualizado: {fmtDate(tpl.updatedAt)}</span>
			</div>
		</div>
	);
}
