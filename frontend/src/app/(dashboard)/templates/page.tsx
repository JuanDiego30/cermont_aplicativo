"use client";

import { FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useTemplates } from "@/modules/templates/queries";

const dateFormatter = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export default function TemplatesPage() {
	const { data, isLoading, isError, refetch } = useTemplates();
	const items = data?.items ?? [];

	return (
		<section className="space-y-6" aria-labelledby="templates-title">
			<header className="space-y-4">
				<div>
					<p className="text-sm font-medium text-[var(--color-brand)]">Gestión</p>
					<h1
						id="templates-title"
						className="mt-2 text-2xl font-semibold text-[var(--text-primary)]"
					>
						Plantillas documentales
					</h1>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
						Plantillas y formularios dinámicos derivados de documentos para planeación, ejecución y
						cierre.
					</p>
				</div>
			</header>

			{isLoading && (
				<div className="flex items-center justify-center py-16" role="status">
					<Loader2 className="size-7 animate-spin text-[var(--color-brand)]" aria-hidden="true" />
					<span className="sr-only">Cargando plantillas</span>
				</div>
			)}

			{isError && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-5">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">
						No se pudo cargar el módulo
					</h2>
					<p className="mt-1 text-sm text-[var(--text-secondary)]">
						El endpoint respondió con error.
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

			{!isLoading && !isError && items.length === 0 && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] p-6">
					<div className="flex items-start gap-4">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-brand-blue-bg)] text-[var(--color-brand)]">
							<FileText className="size-5" aria-hidden="true" />
						</div>
						<div>
							<h2 className="text-base font-semibold text-[var(--text-primary)]">Sin plantillas</h2>
							<p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
								Crea plantillas desde documentos para estandarizar formularios de planeación,
								ejecución y mantenimiento.
							</p>
						</div>
					</div>
				</div>
			)}

			{items.length > 0 && (
				<div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-card md:block">
					<table className="min-w-full divide-y divide-[var(--border-subtle)] text-sm">
						<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase text-[var(--text-muted)]">
							<tr>
								<th className="px-4 py-3 font-semibold">Nombre</th>
								<th className="px-4 py-3 font-semibold">Versión</th>
								<th className="px-4 py-3 font-semibold">Estado</th>
								<th className="px-4 py-3 font-semibold">Actualizado</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{items.map((tpl) => (
								<tr key={tpl._id}>
									<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
										<Link href={`/templates/${tpl._id}`}>{tpl.name}</Link>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">v{tpl.version ?? 1}</td>
									<td className="px-4 py-3">
										<span className="inline-flex rounded-full border px-2.5 py-1 text-xs font-medium border-[var(--border-default)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
											{tpl.status}
										</span>
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">
										{dateFormatter.format(new Date(tpl.updatedAt))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="grid gap-3 md:hidden">
				{items.map((tpl) => (
					<article
						key={tpl._id}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-card"
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-[var(--text-primary)]">{tpl.name}</p>
								<p className="mt-1 text-xs text-[var(--text-secondary)]">
									v{tpl.version ?? 1} · {tpl.status}
								</p>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
