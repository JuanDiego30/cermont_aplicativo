"use client";

import { hasRole } from "@cermont/domain";
import type { MaintenanceKit } from "@cermont/shared-types";
import { useGSAP } from "@gsap/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import gsap from "gsap";
import { ArrowRight, Loader2, Package2, PencilLine, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useRef, useState } from "react";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import { prefersReducedMotion } from "@/lib/utils/reduced-motion";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	formatMaintenanceKitActivityLabel,
	MAINTENANCE_KIT_ACTIVITY_OPTIONS,
	MAINTENANCE_KIT_CREATE_ROLES,
	MAINTENANCE_KIT_DELETE_ROLES,
	MAINTENANCE_KIT_EDIT_ROLES,
	MAINTENANCE_KIT_VISIBILITY_OPTIONS,
} from "@/modules/maintenance/constants";
import { useDeleteMaintenanceKit, useMaintenanceKits } from "@/modules/maintenance/queries";

gsap.registerPlugin(useGSAP);

const PAGE_SIZE = 100;

const VISIBILITY_TO_BOOLEAN: Record<string, boolean | undefined> = {
	all: undefined,
	active: true,
	inactive: false,
};

interface MaintenanceKitPermissions {
	create: boolean;
	edit: boolean;
	delete: boolean;
}

export default function MaintenancePage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canCreate = hasRole(role, MAINTENANCE_KIT_CREATE_ROLES);
	const canEdit = hasRole(role, MAINTENANCE_KIT_EDIT_ROLES);
	const canDelete = hasRole(role, MAINTENANCE_KIT_DELETE_ROLES);

	const [search, setSearch] = useState("");
	const [activityFilter, setActivityFilter] = useState<string>("all");
	const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
	const [page, setPage] = useState(1);

	const pageRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			if (prefersReducedMotion() || !pageRef.current) {
				return;
			}

			const scope = pageRef.current;
			const targets = scope.querySelectorAll("[data-maint-reveal]");

			if (targets.length === 0) {
				return;
			}

			gsap.from(targets, {
				opacity: 0,
				y: 20,
				stagger: 0.1,
				duration: 0.5,
				ease: "power2.out",
				clearProps: "all",
			});
		},
		{ scope: pageRef, dependencies: [] },
	);

	const deferredSearch = useDeferredValue(search.trim());
	const deleteMutation = useDeleteMaintenanceKit();

	const maintenanceKitQuery = useMaintenanceKits({
		page,
		limit: PAGE_SIZE,
		search: deferredSearch || undefined,
		activityType: activityFilter === "all" ? undefined : activityFilter,
		isActive: VISIBILITY_TO_BOOLEAN[visibilityFilter],
	});

	const kitPage = maintenanceKitQuery.data;
	const kits = kitPage?.items ?? [];
	const totalKits = kitPage?.total ?? 0;

	const handleFilterReset = () => {
		setSearch("");
		setActivityFilter("all");
		setVisibilityFilter("all");
		setPage(1);
	};

	const handleDeleteKit = async (id: string, name: string) => {
		const confirmed = window.confirm(`¿Deseas desactivar el kit "${name}"?`);
		if (!confirmed) {
			return;
		}

		await deleteMutation.mutateAsync(id);
	};

	const loading = maintenanceKitQuery.isLoading && !kitPage;
	const error = maintenanceKitQuery.error;
	const permissions: MaintenanceKitPermissions = {
		create: canCreate,
		edit: canEdit,
		delete: canDelete,
	};

	if (loading) {
		return (
			<section className="flex h-64 items-center justify-center">
				<div className="flex items-center gap-2 text-zinc-500">
					<Loader2 className="size-5 animate-spin" />
					Cargando…
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
				{(error as Error).message}
			</section>
		);
	}

	return (
		<section ref={pageRef} className="space-y-6" aria-labelledby="maintenance-page-title">
			<div
				className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-900 px-6 py-8 text-white"
				data-dash="hero"
			>
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="space-y-2">
						<h1 id="maintenance-page-title" className="text-3xl font-semibold">
							Catálogo de Kits
						</h1>
						<p className="text-sm text-white/70">{totalKits} kits registrados</p>
					</div>
					{canCreate ? (
						<Link
							href="/maintenance/new"
							className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
						>
							<Plus className="size-4" />
							Nuevo Kit
						</Link>
					) : null}
				</div>
			</div>

			<MaintenanceCatalogSection
				activityFilter={activityFilter}
				isDeleting={deleteMutation.isPending}
				isFetching={maintenanceKitQuery.isFetching}
				kitPage={kitPage}
				kits={kits}
				page={page}
				permissions={permissions}
				search={search}
				visibilityFilter={visibilityFilter}
				onActivityFilterChange={(value) => {
					setActivityFilter(value);
					setPage(1);
				}}
				onDelete={handleDeleteKit}
				onPageChange={setPage}
				onReset={handleFilterReset}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				onVisibilityFilterChange={(value) => {
					setVisibilityFilter(value);
					setPage(1);
				}}
			/>
		</section>
	);
}

function MaintenanceCatalogSection({
	activityFilter,
	isDeleting,
	isFetching,
	kitPage,
	kits,
	page,
	permissions,
	search,
	visibilityFilter,
	onActivityFilterChange,
	onDelete,
	onPageChange,
	onReset,
	onSearchChange,
	onVisibilityFilterChange,
}: {
	activityFilter: string;
	isDeleting: boolean;
	isFetching: boolean;
	kitPage?: { page: number; totalPages: number };
	kits: MaintenanceKit[];
	page: number;
	permissions: MaintenanceKitPermissions;
	search: string;
	visibilityFilter: string;
	onActivityFilterChange: (value: string) => void;
	onDelete: (id: string, name: string) => void;
	onPageChange: (updater: (current: number) => number) => void;
	onReset: () => void;
	onSearchChange: (value: string) => void;
	onVisibilityFilterChange: (value: string) => void;
}) {
	return (
		<section className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)] transition-shadow hover:shadow-[var(--shadow-2)]">
			<MaintenanceCatalogHeader onReset={onReset} />
			<MaintenanceCatalogFilters
				activityFilter={activityFilter}
				search={search}
				visibilityFilter={visibilityFilter}
				onActivityFilterChange={onActivityFilterChange}
				onSearchChange={onSearchChange}
				onVisibilityFilterChange={onVisibilityFilterChange}
			/>
			<MaintenanceCatalogBody
				isDeleting={isDeleting}
				isFetching={isFetching}
				kits={kits}
				onDelete={onDelete}
				permissions={permissions}
			/>
			<MaintenancePagination kitPage={kitPage} page={page} onPageChange={onPageChange} />
		</section>
	);
}

function MaintenanceCatalogHeader({ onReset }: { onReset: () => void }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h2 className="text-xl font-semibold text-[var(--text-primary)]">Catálogo de kits</h2>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Revisa, filtra y administra los kits típicos disponibles.
				</p>
			</div>

			<button
				type="button"
				onClick={onReset}
				className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
			>
				Restablecer filtros
			</button>
		</div>
	);
}

function MaintenanceCatalogFilters({
	activityFilter,
	search,
	visibilityFilter,
	onActivityFilterChange,
	onSearchChange,
	onVisibilityFilterChange,
}: {
	activityFilter: string;
	search: string;
	visibilityFilter: string;
	onActivityFilterChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	onVisibilityFilterChange: (value: string) => void;
}) {
	return (
		<div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr]">
			<FormField label="Buscar" htmlFor="maintenance-kit-search">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
					<TextField
						id="maintenance-kit-search"
						value={search}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder="Buscar por nombre"
						className="pl-9"
					/>
				</div>
			</FormField>

			<FormField label="Actividad" htmlFor="maintenance-kit-activity-filter">
				<Select
					id="maintenance-kit-activity-filter"
					value={activityFilter}
					onChange={(event) => onActivityFilterChange(event.target.value)}
				>
					<option value="all">Todas</option>
					{MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
			</FormField>

			<FormField label="Estado" htmlFor="maintenance-kit-visibility-filter">
				<Select
					id="maintenance-kit-visibility-filter"
					value={visibilityFilter}
					onChange={(event) => onVisibilityFilterChange(event.target.value)}
				>
					{MAINTENANCE_KIT_VISIBILITY_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</Select>
			</FormField>
		</div>
	);
}

function MaintenanceCatalogBody({
	isDeleting,
	isFetching,
	kits,
	onDelete,
	permissions,
}: {
	isDeleting: boolean;
	isFetching: boolean;
	kits: MaintenanceKit[];
	onDelete: (id: string, name: string) => void;
	permissions: MaintenanceKitPermissions;
}) {
	return (
		<div className="mt-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-primary)]">
			{isFetching && kits.length > 0 ? <MaintenanceFetchingNotice /> : null}
			{kits.length === 0 ? (
				<MaintenanceEmptyCatalog canCreate={permissions.create} />
			) : (
				<MaintenanceKitTable
					isDeleting={isDeleting}
					kits={kits}
					onDelete={onDelete}
					permissions={permissions}
				/>
			)}
		</div>
	);
}

function MaintenanceFetchingNotice() {
	return (
		<div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--surface-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
			<Loader2 className="size-4 animate-spin" />
			Actualizando catálogo…
		</div>
	);
}

function MaintenanceEmptyCatalog({ canCreate }: { canCreate: boolean }) {
	return (
		<div className="flex min-h-[280px] flex-col items-center justify-center gap-4 px-6 py-10 text-center">
			<div className="rounded-full bg-[var(--surface-secondary)] p-4 text-[var(--text-tertiary)]">
				<Package2 className="size-6" />
			</div>
			<div className="max-w-md space-y-2">
				<h3 className="text-lg font-semibold text-[var(--text-primary)]">
					No hay kits en la vista actual
				</h3>
				<p className="text-sm text-[var(--text-secondary)]">
					Prueba otro filtro o crea un nuevo kit para arrancar el catálogo.
				</p>
			</div>
			{canCreate ? (
				<Link
					href="/maintenance/new"
					className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-blue-hover)]"
				>
					<Plus className="size-4" />
					Crear kit
				</Link>
			) : null}
		</div>
	);
}

function MaintenanceKitTable({
	isDeleting,
	kits,
	onDelete,
	permissions,
}: {
	isDeleting: boolean;
	kits: MaintenanceKit[];
	onDelete: (id: string, name: string) => void;
	permissions: MaintenanceKitPermissions;
}) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[900px] text-sm">
				<caption className="sr-only">
					Listado de kits típicos con acceso al detalle, edición y desactivación.
				</caption>
				<MaintenanceKitTableHead />
				<tbody className="divide-y divide-[var(--border-default)]">
					{kits.map((kit) => (
						<MaintenanceKitRow
							key={kit._id}
							isDeleting={isDeleting}
							kit={kit}
							onDelete={onDelete}
							permissions={permissions}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

function MaintenanceKitTableHead() {
	return (
		<thead className="bg-[var(--surface-secondary)] text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
			<tr>
				<th scope="col" className="px-4 py-3 font-semibold">
					Kit
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Actividad
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Herramientas
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Equipos
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Estado
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Actualizado
				</th>
				<th scope="col" className="px-4 py-3 font-semibold">
					Acciones
				</th>
			</tr>
		</thead>
	);
}

function getKitSummary(toolCount: number, equipmentCount: number): string {
	const toolLabel = toolCount === 1 ? "1 herramienta" : `${toolCount} herramientas`;
	const equipmentLabel = equipmentCount === 1 ? "1 equipo" : `${equipmentCount} equipos`;
	return `${toolLabel} · ${equipmentLabel}`;
}

function MaintenanceKitRow({
	isDeleting,
	kit,
	onDelete,
	permissions,
}: {
	isDeleting: boolean;
	kit: MaintenanceKit;
	onDelete: (id: string, name: string) => void;
	permissions: MaintenanceKitPermissions;
}) {
	const updatedAt = kit.updatedAt
		? format(new Date(kit.updatedAt), "dd MMM yyyy", { locale: es })
		: ",";

	return (
		<tr className="transition-colors hover:bg-[var(--surface-secondary)]">
			<td className="p-4">
				<div className="space-y-1">
					<p className="font-semibold text-[var(--text-primary)]">{kit.name}</p>
					<p className="text-xs text-[var(--text-secondary)]">
						{getKitSummary(kit.tools.length, kit.equipment.length)}
					</p>
				</div>
			</td>
			<td className="p-4 text-[var(--text-secondary)]">
				{formatMaintenanceKitActivityLabel(kit.activityType)}
			</td>
			<td className="p-4 text-[var(--text-secondary)]">{kit.tools.length}</td>
			<td className="p-4 text-[var(--text-secondary)]">{kit.equipment.length}</td>
			<td className="p-4">
				<span
					className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
						kit.isActive
							? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
							: "bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
					}`}
				>
					{kit.isActive ? "Activo" : "Inactivo"}
				</span>
			</td>
			<td className="p-4 text-[var(--text-secondary)]">{updatedAt}</td>
			<td className="p-4">
				<div className="flex flex-wrap items-center gap-2">
					<Link
						href={`/maintenance/${kit._id}`}
						className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
					>
						Ver
						<ArrowRight className="size-3.5" />
					</Link>

					{permissions.edit ? (
						<Link
							href={`/maintenance/${kit._id}/edit`}
							className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
						>
							<PencilLine className="size-3.5" />
							Editar
						</Link>
					) : null}

					{permissions.delete && kit.isActive ? (
						<button
							type="button"
							onClick={() => onDelete(kit._id, kit.name)}
							disabled={isDeleting}
							className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-danger-bg)] px-3 text-xs font-semibold text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]/60 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isDeleting ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Trash2 className="size-3.5" />
							)}
							Desactivar
						</button>
					) : null}
				</div>
			</td>
		</tr>
	);
}

function MaintenancePagination({
	kitPage,
	page,
	onPageChange,
}: {
	kitPage?: { page: number; totalPages: number };
	page: number;
	onPageChange: (updater: (current: number) => number) => void;
}) {
	if (!kitPage || kitPage.totalPages <= 1) {
		return null;
	}

	return (
		<div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
			<p>
				Página {kitPage.page} de {kitPage.totalPages}
			</p>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={() => onPageChange((current) => Math.max(1, current - 1))}
					disabled={page <= 1}
					className="rounded-full border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
				>
					Anterior
				</button>
				<button
					type="button"
					onClick={() => onPageChange((current) => Math.min(kitPage.totalPages, current + 1))}
					disabled={page >= kitPage.totalPages}
					className="rounded-full border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
				>
					Siguiente
				</button>
			</div>
		</div>
	);
}
