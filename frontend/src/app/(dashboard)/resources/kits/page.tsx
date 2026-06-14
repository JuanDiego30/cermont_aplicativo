"use client";

import { hasRole, MAINTENANCE_MANAGEMENT_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import { Loader2, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { KIT_ACTIVITY_LABELS } from "@/modules/kits/constants";
import {
	useActivateKit,
	useArchiveKit,
	useDeleteKit,
	useKitList,
} from "@/modules/kits/hooks/useKits";
import { KitCard } from "@/modules/kits/ui/KitCard";
import { KitForm } from "@/modules/kits/ui/KitForm";
import { KitsStatsGrid } from "@/modules/kits/ui/KitsStatsGrid";

export default function KitsListPage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canManage = hasRole(role, MAINTENANCE_MANAGEMENT_ROLES);
	const canPublish = hasRole(role, MANAGEMENT_ROLES);

	const [searchQuery, setSearchQuery] = useState("");
	const [activityFilter, setActivityFilter] = useState<string>("");
	const [formOpen, setFormOpen] = useState(false);

	const {
		data: paginated,
		isLoading,
		isError,
		error,
		refetch,
	} = useKitList({
		search: searchQuery || undefined,
		activityType: activityFilter || undefined,
		limit: 100,
	});

	const deleteMutation = useDeleteKit();
	const activateMutation = useActivateKit();
	const archiveMutation = useArchiveKit();

	const kits = useMemo(() => paginated?.data ?? [], [paginated]);

	const stats = useMemo(() => {
		const total = kits.length;
		const activeKits = kits.filter((k) => k.status === "active").length;
		const drafts = kits.filter((k) => k.status === "draft").length;
		const archived = kits.filter((k) => k.status === "archived").length;
		return { total, active: activeKits, drafts, archived };
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

	const handleActivate = useCallback(
		async (id: string) => {
			try {
				await activateMutation.mutateAsync(id);
			} catch {
				// handled by React Query
			}
		},
		[activateMutation],
	);

	const handleArchive = useCallback(
		async (id: string) => {
			const reason = window.prompt("Motivo para archivar:");
			if (!reason?.trim()) {
				return;
			}
			try {
				await archiveMutation.mutateAsync({ id, reason: reason.trim() });
			} catch {
				// handled by React Query
			}
		},
		[archiveMutation],
	);

	return (
		<section className="space-y-6" aria-labelledby="kits-page-title">
			<header className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-card)]">
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

			<KitsStatsGrid
				total={stats.total}
				active={stats.active}
				drafts={stats.drafts}
				archived={stats.archived}
			/>

			<div className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)]">
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
							className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] py-2.5 pl-4 pr-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20"
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						<button
							type="button"
							onClick={() => setActivityFilter("")}
							className={`rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
								!activityFilter
									? "bg-[var(--color-brand)] text-white"
									: "border border-[var(--border-medium)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							}`}
						>
							Todos
						</button>
						{Object.entries(KIT_ACTIVITY_LABELS).map(([value, label]) => (
							<button
								key={value}
								type="button"
								onClick={() => setActivityFilter(value)}
								className={`rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
									activityFilter === value
										? "bg-[var(--color-brand)] text-white"
										: "border border-[var(--border-medium)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
								}`}
							>
								{label}
							</button>
						))}
					</div>
				</div>
			</div>

			<section aria-labelledby="kits-list-title" className="space-y-4">
				<h2 id="kits-list-title" className="sr-only">
					Listado de kits
				</h2>

				{isLoading ? (
					<div className="flex h-40 items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-medium)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
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
					<div className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] shadow-[var(--shadow-card)]">
						<EmptyState
							title={searchQuery || activityFilter ? "Sin resultados" : "No hay kits"}
							description={
								searchQuery || activityFilter
									? "Prueba con otro filtro o cambia el término de búsqueda."
									: "Crea tu primer kit para empezar a gestionar el catálogo."
							}
							icon="resources"
							action={
								searchQuery || activityFilter
									? {
											label: "Limpiar filtros",
											onClick: () => {
												setSearchQuery("");
												setActivityFilter("");
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
							<KitCard
								key={kit._id}
								kit={kit}
								canManage={canManage}
								canPublish={canPublish}
								onActivate={handleActivate}
								onArchive={handleArchive}
								onDelete={handleDelete}
								pendingMutation={
									activateMutation.isPending
										? "activate"
										: archiveMutation.isPending
											? "archive"
											: deleteMutation.isPending
												? "delete"
												: undefined
								}
							/>
						))}
					</div>
				)}
			</section>

			<KitForm open={formOpen} onOpenChange={setFormOpen} onSuccess={() => refetch()} />
		</section>
	);
}
