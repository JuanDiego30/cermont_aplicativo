"use client";

/**
 * Kits List Page — Kit template catalog view
 *
 * Features:
 *   - Filter by category
 *   - Search by name / description
 *   - Create kit dialog (KitForm)
 *   - Delete with confirmation
 *   - Publish / Archive actions
 *   - Loading / error / empty states
 */

import { hasRole, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import { Archive, CheckCircle2, Loader2, Package2, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	useArchiveKit,
	useDeleteKit,
	useKitList,
	usePublishKit,
} from "@/modules/kits/hooks/useKits";
import { KitForm } from "@/modules/kits/ui/KitForm";

const CATEGORY_LABELS: Record<string, string> = {
	electrico: "Eléctrico",
	mecanico: "Mecánico",
	civil: "Civil",
	instrumentacion: "Instrumentación",
	general: "General",
};

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	published: "Publicado",
	archived: "Archivado",
};

const STATUS_STYLES: Record<string, string> = {
	draft:
		"bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[color:var(--color-warning)]/15",
	published:
		"bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[color:var(--color-success)]/15",
	archived:
		"bg-[var(--surface-secondary)] text-[var(--text-tertiary)] ring-[var(--border-default)]/30",
};

export default function KitsListPage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canManage = hasRole(role, MAINTENANCE_MANAGEMENT_ROLES);
	const canPublish = hasRole(role, MANAGEMENT_ROLES);

	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState<string>("");
	const [formOpen, setFormOpen] = useState(false);

	const {
		data: paginated,
		isLoading,
		isError,
		error,
		refetch,
	} = useKitList({
		search: searchQuery || undefined,
		category: categoryFilter || undefined,
		limit: 100,
	});

	const deleteMutation = useDeleteKit();
	const publishMutation = usePublishKit();
	const archiveMutation = useArchiveKit();

	const kits = useMemo(() => paginated?.data ?? [], [paginated]);

	// Stats
	const stats = useMemo(() => {
		const total = kits.length;
		const published = kits.filter((k) => k.status === "published").length;
		const drafts = kits.filter((k) => k.status === "draft").length;
		const archived = kits.filter((k) => k.status === "archived").length;
		return { total, published, drafts, archived };
	}, [kits]);

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

	const handlePublish = useCallback(
		async (id: string) => {
			try {
				await publishMutation.mutateAsync(id);
			} catch {
				// handled by React Query
			}
		},
		[publishMutation],
	);

	const handleArchive = useCallback(
		async (id: string) => {
			try {
				await archiveMutation.mutateAsync(id);
			} catch {
				// handled by React Query
			}
		},
		[archiveMutation],
	);

	return (
		<section className="space-y-6" aria-labelledby="kits-page-title">
			{/* Header */}
			<header className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-tertiary)]">
							Catálogo
						</p>
						<h1 id="kits-page-title" className="text-2xl font-semibold text-[var(--text-primary)]">
							Kits Típicos
						</h1>
						<p className="max-w-2xl text-sm text-[var(--text-secondary)]">
							Gestiona kits de herramientas, equipos y materiales por tipo de actividad.
						</p>
					</div>

					{canManage && (
						<Button onClick={() => setFormOpen(true)} variant="primary">
							<Plus aria-hidden="true" className="size-4" />
							Nuevo kit
						</Button>
					)}
				</div>
			</header>

			{/* Stats row */}
			<section aria-label="Resumen" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{[
					{ label: "Total", value: stats.total, style: "" },
					{ label: "Publicados", value: stats.published, style: "text-[var(--color-success)]" },
					{ label: "Borradores", value: stats.drafts, style: "text-[var(--color-warning)]" },
					{ label: "Archivados", value: stats.archived, style: "text-[var(--text-tertiary)]" },
				].map((stat) => (
					<article
						key={stat.label}
						className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]"
					>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
							{stat.label}
						</p>
						<p
							className={`mt-2 text-3xl font-semibold ${stat.style || "text-[var(--text-primary)]"}`}
						>
							{stat.value}
						</p>
					</article>
				))}
			</section>

			{/* Search + filters */}
			<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div className="relative w-full lg:max-w-md">
						<label htmlFor="kit-search" className="sr-only">
							Buscar kits
						</label>
						<input
							id="kit-search"
							name="q"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Buscar por nombre…"
							className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] py-2.5 pl-4 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-brand-blue)]/20"
						/>
					</div>

					{/* Category filter */}
					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setCategoryFilter("")}
							className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
								!categoryFilter
									? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
									: "border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							}`}
						>
							Todos
						</button>
						{Object.entries(CATEGORY_LABELS).map(([value, label]) => (
							<button
								key={value}
								type="button"
								onClick={() => setCategoryFilter(value)}
								className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
									categoryFilter === value
										? "bg-[var(--color-brand-blue)] text-white shadow-[var(--shadow-brand)]"
										: "border border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Kit list */}
			<section aria-labelledby="kits-list-title" className="space-y-4">
				<h2 id="kits-list-title" className="sr-only">
					Listado de kits
				</h2>

				{isLoading ? (
					<div className="flex h-40 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
						<Loader2 className="mr-2 size-6 animate-spin" aria-hidden="true" />
						Cargando kits…
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
				) : kits.length === 0 ? (
					<div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] shadow-[var(--shadow-1)]">
						<EmptyState
							title={searchQuery || categoryFilter ? "Sin resultados" : "No hay kits"}
							description={
								searchQuery || categoryFilter
									? "Prueba con otro filtro o cambia el término de búsqueda."
									: "Crea tu primer kit para empezar a gestionar el catálogo."
							}
							icon="resources"
							action={
								searchQuery || categoryFilter
									? {
											label: "Limpiar filtros",
											onClick: () => {
												setSearchQuery("");
												setCategoryFilter("");
											},
										}
									: canManage
										? {
												label: "Crear kit",
												onClick: () => setFormOpen(true),
											}
										: undefined
							}
						/>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
						{kits.map((kit) => (
							<article
								key={kit._id}
								className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0 flex-1">
										<div className="flex items-center gap-2">
											<div className="rounded-lg bg-[var(--color-info-bg)] p-1.5">
												<Package2 aria-hidden="true" className="size-4 text-[var(--color-info)]" />
											</div>
											<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
												{kit.name}
											</h3>
										</div>
										<p className="mt-2 text-xs text-[var(--text-secondary)]">
											{CATEGORY_LABELS[kit.category] ?? kit.category}
										</p>
										<p className="mt-1 text-xs text-[var(--text-tertiary)]">
											{kit.items?.length ?? 0} ítem(s) &middot; v{kit.version}
										</p>
									</div>
									<span
										className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ring-1 ring-inset ${STATUS_STYLES[kit.status] ?? ""}`}
									>
										{STATUS_LABELS[kit.status] ?? kit.status}
									</span>
								</div>

								{kit.description && (
									<p className="mt-3 line-clamp-2 text-sm text-[var(--text-secondary)]">
										{kit.description}
									</p>
								)}

								{/* Actions */}
								<div className="mt-4 flex items-center gap-2">
									{canPublish && kit.status === "draft" && (
										<button
											type="button"
											onClick={() => handlePublish(kit._id)}
											className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-success)] hover:text-[var(--color-success)]/80 transition-colors"
											disabled={publishMutation.isPending}
										>
											<CheckCircle2 aria-hidden="true" className="size-3.5" />
											Publicar
										</button>
									)}
									{canPublish && kit.status === "published" && (
										<button
											type="button"
											onClick={() => handleArchive(kit._id)}
											className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
											disabled={archiveMutation.isPending}
										>
											<Archive aria-hidden="true" className="size-3.5" />
											Archivar
										</button>
									)}
									{canManage && kit.status === "draft" && (
										<button
											type="button"
											onClick={() => handleDelete(kit._id)}
											className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-danger)] hover:text-[var(--color-danger)]/80 transition-colors"
											disabled={deleteMutation.isPending}
										>
											<Trash2 aria-hidden="true" className="size-3.5" />
											Eliminar
										</button>
									)}
								</div>
							</article>
						))}
					</div>
				)}
			</section>

			{/* Create dialog */}
			<KitForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => refetch()} />
		</section>
	);
}
