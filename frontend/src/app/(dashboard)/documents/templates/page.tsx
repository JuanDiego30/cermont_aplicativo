"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/core/ui/EmptyState";
import { apiClient } from "@/lib/http/api-client";
import { formatLocaleDate } from "@/lib/utils/format-date";

type TemplateDraft = {
	_id: string;
	name: string;
	purpose: string;
	status: string;
	createdAt: string;
	updatedAt: string;
};

const TEMPLATE_KEYS = {
	all: ["template-drafts"] as const,
	list: () => [...TEMPLATE_KEYS.all, "list"] as const,
};

function useTemplateDrafts() {
	return useQuery({
		queryKey: TEMPLATE_KEYS.list(),
		queryFn: async () => {
			const res = await apiClient.get<{ success: boolean; data: TemplateDraft[] }>(
				"/template-drafts",
			);
			return res.data;
		},
	});
}

function useDeleteTemplateDraft() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			await apiClient.delete(`/template-drafts/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TEMPLATE_KEYS.all });
		},
	});
}

function statusBadge(status: string) {
	const map: Record<string, string> = {
		draft: "bg-zinc-100 text-charcoal dark:bg-surface dark:text-muted-text",
		submitted: "bg-amber-100 text-brand-warn dark:bg-amber-900/20 dark:text-brand-warn",
		approved: "bg-success-bg text-brand-annotate dark:bg-green-900/20 dark:text-brand-annotate",
		rejected: "bg-danger-bg text-brand-error dark:bg-red-900/20 dark:text-brand-error",
		converted: "bg-info-bg text-brand-green dark:bg-blue-900/20 dark:text-brand-green",
	};
	return map[status] ?? map.draft;
}

export default function TemplatesPage() {
	const { data: templates, isLoading, error } = useTemplateDrafts();
	const deleteMutation = useDeleteTemplateDraft();

	if (isLoading) {
		return (
			<section className="space-y-6" aria-labelledby="templates-page-title">
				<div className="flex h-40 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<Loader2 className="size-5 animate-spin text-[var(--text-tertiary)]" aria-hidden="true" />
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="space-y-6" aria-labelledby="templates-page-title">
				<div className="rounded-[var(--radius-xl)] border border-red-200 bg-danger-bg p-6 text-brand-error dark:border-red-900/30 dark:bg-red-900/10 dark:text-brand-error">
					Error al cargar las plantillas. Intente de nuevo.
				</div>
			</section>
		);
	}

	const items = templates ?? [];

	return (
		<section className="space-y-6" aria-labelledby="templates-page-title">
			<div className="flex items-center justify-between">
				<h1 id="templates-page-title" className="text-xl font-semibold text-[var(--text-primary)]">
					Plantillas de Documentos
				</h1>
				<Link
					href="/documents/templates/new"
					className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nueva Plantilla
				</Link>
			</div>

			{items.length === 0 ? (
				<EmptyState
					icon="documents"
					title="No hay plantillas"
					description="Crea tu primera plantilla para agilizar la generación de documentos."
				/>
			) : (
				<div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-2)]">
					<table className="w-full text-left text-sm">
						<thead className="border-b border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
							<tr>
								<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Nombre</th>
								<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Propósito</th>
								<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Estado</th>
								<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">Actualizado</th>
								<th className="px-4 py-3 font-medium text-[var(--text-secondary)]">
									<span className="sr-only">Acciones</span>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--border-subtle)]">
							{items.map((template) => (
								<tr
									key={template._id}
									className="transition-colors hover:bg-[var(--surface-secondary)]"
								>
									<td className="px-4 py-3 font-medium text-[var(--text-primary)]">
										{template.name}
									</td>
									<td className="px-4 py-3 text-[var(--text-secondary)]">{template.purpose}</td>
									<td className="px-4 py-3">
										<span
											className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(template.status)}`}
										>
											{template.status}
										</span>
									</td>
								<td className="px-4 py-3 text-[var(--text-tertiary)]">
									{formatLocaleDate(template.updatedAt, { dateStyle: "medium" })}
								</td>
									<td className="px-4 py-3 text-right">
										<button
											type="button"
											onClick={() => {
												if (window.confirm("¿Eliminar esta plantilla?")) {
													deleteMutation.mutate(template._id);
												}
											}}
											className="text-xs text-brand-error hover:underline dark:text-brand-error"
										>
											Eliminar
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
