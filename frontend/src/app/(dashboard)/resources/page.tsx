"use client";

/**
 * Resources List Page — Full CRUD catalog view
 *
 * Features:
 *   - Tabs to filter by resource type
 *   - Search by name / type / brand / model
 *   - Create resource dialog (ResourceForm)
 *   - Delete with AlertDialog confirmation
 *   - Stats summary row
 *   - Loading / error / empty states
 *   - Links to detail page
 */

import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { useDeleteResource, useResourceList } from "@/modules/resources/hooks/useResources";
import { ResourceForm } from "@/modules/resources/ui/ResourceForm";
import { ResourceCard } from "./ResourceCard";
import { RESOURCE_TYPE_LABELS, RESOURCE_TYPE_ORDER } from "./resource-constants";

type TabValue = "all" | (typeof RESOURCE_TYPE_ORDER)[number];

export default function ResourcesPage() {
	const [query, setQuery] = useState("");
	const [activeTab, setActiveTab] = useState<TabValue>("all");
	const [formOpen, setFormOpen] = useState(false);

	const selectedType = activeTab === "all" ? undefined : activeTab;

	const {
		data: paginated,
		isLoading,
		isError,
		error,
		refetch,
	} = useResourceList({
		search: query || undefined,
		type: selectedType,
		limit: 100,
	});

	const deleteMutation = useDeleteResource();

	const resources = useMemo(() => paginated?.data ?? [], [paginated]);

	// Stats
	const stats = useMemo(() => {
		const total = resources.length;
		const active = resources.filter((r) => r.active !== false).length;
		const maintenance = resources.filter((r) => r.status === "maintenance").length;
		const lowStock = resources.filter((r) => r.status === "expired" || r.active === false).length;
		return { total, active, maintenance, lowStock };
	}, [resources]);

	// Tabs
	const tabOptions: { value: TabValue; label: string }[] = useMemo(
		() => [
			{ value: "all", label: "Todos" },
			...RESOURCE_TYPE_ORDER.map((t) => ({
				value: t as TabValue,
				label: RESOURCE_TYPE_LABELS[t] ?? t,
			})),
		],
		[],
	);

	// Handlers
	const handleDelete = useCallback(
		async (id: string) => {
			try {
				await deleteMutation.mutateAsync(id);
			} catch {
				// handled by React Query
			}
		},
		[deleteMutation],
	);

	return (
		<section className="space-y-6" aria-labelledby="resources-page-title">
			{/* Header */}
			<header className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
							Catálogo
						</p>
						<h1
							id="resources-page-title"
							className="text-2xl font-semibold text-[var(--text-primary)]"
						>
							Recursos
						</h1>
						<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
							Gestiona herramientas, equipos, materiales y otros recursos operativos.
						</p>
					</div>

					<Button onClick={() => setFormOpen(true)} variant="primary">
						<Plus aria-hidden="true" className="size-4" />
						Nuevo recurso
					</Button>
				</div>
			</header>

			{/* Stats row */}
			<section aria-label="Resumen" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[
					{ label: "Total", value: stats.total },
					{ label: "Activos", value: stats.active, success: true },
					{ label: "En mantenimiento", value: stats.maintenance, warning: true },
					{ label: "Stock bajo / inactivos", value: stats.lowStock, danger: true },
				].map((stat) => (
					<article
						key={stat.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{stat.label}
						</p>
						<p
							className={`mt-2 text-3xl font-semibold ${
								stat.success
									? "text-[var(--color-success)]"
									: stat.warning
										? "text-[var(--color-warning)]"
										: stat.danger
											? "text-[var(--color-danger)]"
											: "text-[var(--text-primary)]"
							}`}
						>
							{stat.value}
						</p>
					</article>
				))}
			</section>

			{/* Search + tabs */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div className="relative w-full lg:max-w-md">
						<label htmlFor="resource-search" className="sr-only">
							Buscar recursos
						</label>
						<Search
							aria-hidden="true"
							className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]"
						/>
						<input
							id="resource-search"
							name="q"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Buscar por nombre, tipo, marca…"
							className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-primary)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--color-brand-blue)]/20"
						/>
					</div>
				</div>

				{/* Tabs */}
				<div
					className="mt-4 flex flex-wrap gap-2"
					role="tablist"
					aria-label="Filtrar por tipo de recurso"
				>
					{tabOptions.map((tab) => (
						<button
							key={tab.value}
							role="tab"
							type="button"
							aria-selected={activeTab === tab.value}
							onClick={() => setActiveTab(tab.value)}
							className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
								activeTab === tab.value
									? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
									: "border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Resource list */}
			<section aria-labelledby="resources-list-title" className="space-y-4">
				<h2 id="resources-list-title" className="sr-only">
					Listado de recursos
				</h2>

				{isLoading ? (
					<div className="flex h-40 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
						<Loader2 className="mr-2 size-6 animate-spin" aria-hidden="true" />
						Cargando recursos…
					</div>
				) : isError ? (
					<div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-8 text-center">
						<p className="text-sm font-medium text-[var(--color-danger)]">
							{(error as Error).message}
						</p>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							Reintentar
						</Button>
					</div>
				) : resources.length === 0 ? (
					<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
						<EmptyState
							title={query || activeTab !== "all" ? "Sin resultados" : "No hay recursos"}
							description={
								query || activeTab !== "all"
									? "Prueba con otro filtro o cambia el término de búsqueda."
									: "Crea tu primer recurso para empezar a gestionar el catálogo."
							}
							icon="resources"
							action={
								query || activeTab !== "all"
									? {
											label: "Limpiar filtros",
											onClick: () => {
												setQuery("");
												setActiveTab("all");
											},
										}
									: {
											label: "Crear recurso",
											onClick: () => setFormOpen(true),
										}
							}
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{resources.map((resource) => (
							<div key={resource._id} className="group relative">
								<ResourceCard resource={resource} />

								{/* Delete button */}
								<button
									type="button"
									onClick={() => handleDelete(resource._id)}
									className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] opacity-0 transition-opacity hover:bg-[var(--color-danger)] hover:text-white group-hover:opacity-100"
									aria-label={`Eliminar ${resource.name}`}
									disabled={deleteMutation.isPending}
								>
									<Trash2 className="size-3.5" aria-hidden="true" />
								</button>
							</div>
						))}
					</div>
				)}
			</section>

			{/* Create / Edit dialog */}
			<ResourceForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => refetch()} />
		</section>
	);
}
