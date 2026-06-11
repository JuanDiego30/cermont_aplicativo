"use client";

import { hasRole } from "@cermont/domain";
import type { KitTemplate } from "@cermont/shared-types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
	Archive,
	Copy,
	FileText,
	HardHat,
	Loader2,
	Package2,
	Plus,
	Search,
	Wrench,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	formatKitActivityLabel,
	formatKitRiskLabel,
	formatKitStatusLabel,
	getKitItemCount,
	KIT_ACTIVITY_OPTIONS,
	KIT_CREATE_ROLES,
	KIT_MANAGE_ROLES,
	KIT_RISK_OPTIONS,
	KIT_STATUS_OPTIONS,
} from "@/modules/kits/constants";
import {
	useActivateKit,
	useArchiveKit,
	useDeleteKit,
	useDuplicateKit,
	useKitList,
	useRestoreKit,
} from "@/modules/kits/hooks/useKits";

const PAGE_SIZE = 20;

export default function MaintenancePage() {
	const { user: session } = useAuth();
	const role = session?.role ?? "";
	const canCreate = hasRole(role, KIT_CREATE_ROLES);
	const canManage = hasRole(role, KIT_MANAGE_ROLES);

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [activityFilter, setActivityFilter] = useState<string>("all");
	const [riskFilter, setRiskFilter] = useState<string>("all");
	const [page, setPage] = useState(1);

	const deferredSearch = useDeferredValue(search.trim());

	const kitQuery = useKitList({
		page,
		limit: PAGE_SIZE,
		search: deferredSearch || undefined,
		status: statusFilter === "all" ? undefined : statusFilter,
		activityType: activityFilter === "all" ? undefined : activityFilter,
		riskLevel: riskFilter === "all" ? undefined : riskFilter,
	});

	const deleteMutation = useDeleteKit();
	const archiveMutation = useArchiveKit();
	const restoreMutation = useRestoreKit();
	const activateMutation = useActivateKit();
	const duplicateMutation = useDuplicateKit();

	const handleFilterReset = () => {
		setSearch("");
		setStatusFilter("all");
		setActivityFilter("all");
		setRiskFilter("all");
		setPage(1);
	};

	const handleDelete = async (id: string, name: string) => {
		const confirmed = window.confirm(`¿Eliminar el kit "${name}"?`);
		if (!confirmed) {
			return;
		}
		try {
			const result = await deleteMutation.mutateAsync(id);
			const data = result.data;
			if (data.deleted) {
				toast.success("Kit eliminado correctamente.");
			} else {
				toast.info(data.message);
			}
		} catch {
			toast.error("No se pudo eliminar el kit.");
		}
	};

	const handleArchive = async (id: string, name: string) => {
		const reason = window.prompt(`Motivo para archivar "${name}":`);
		if (!reason?.trim()) {
			return;
		}
		try {
			await archiveMutation.mutateAsync({ id, reason: reason.trim() });
			toast.success("Kit archivado correctamente.");
		} catch {
			toast.error("No se pudo archivar el kit.");
		}
	};

	const handleRestore = async (id: string) => {
		try {
			await restoreMutation.mutateAsync(id);
			toast.success("Kit restaurado correctamente.");
		} catch {
			toast.error("No se pudo restaurar el kit.");
		}
	};

	const handleActivate = async (id: string) => {
		try {
			await activateMutation.mutateAsync(id);
			toast.success("Kit activado correctamente.");
		} catch {
			toast.error("No se pudo activar el kit.");
		}
	};

	const handleDuplicate = async (id: string) => {
		try {
			const kit = await duplicateMutation.mutateAsync(id);
			toast.success(`Kit duplicado como "${kit.name}".`);
		} catch {
			toast.error("No se pudo duplicar el kit.");
		}
	};

	const envelope = kitQuery.data;
	const kits = envelope?.data ?? [];
	const totalKits = envelope?.pagination?.total ?? 0;
	const totalPages = envelope?.pagination?.totalPages ?? 1;
	const loading = kitQuery.isLoading && !envelope;
	const error = kitQuery.error;

	if (loading) {
		return (
			<section className="flex h-64 items-center justify-center">
				<div className="flex items-center gap-2 text-[var(--text-secondary)]">
					<Loader2 className="size-5 animate-spin" />
					Cargando catálogo…
				</div>
			</section>
		);
	}

	if (error) {
		return (
			<section className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] px-6 py-5 text-sm text-[var(--color-danger)]">
				No se pudo cargar el catálogo: {(error as Error).message}
			</section>
		);
	}

	return (
		<section className="space-y-6" aria-labelledby="maintenance-page-title">
			{/* Hero Header */}
			<header className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--color-cermont-blue-deep)] via-[var(--color-cermont-blue)] to-[var(--color-cermont-green-deep)] px-6 py-8 text-white">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="space-y-2">
						<h1 id="maintenance-page-title" className="text-3xl font-semibold tracking-tight">
							Catálogo de Kits
						</h1>
						<p className="text-sm text-white/80">{totalKits} kits registrados</p>
					</div>
					{canCreate ? (
						<Link
							href="/maintenance/new"
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-cermont-blue-deep)] transition hover:bg-white/90"
						>
							<Plus className="size-4" />
							Nuevo Kit
						</Link>
					) : null}
				</div>
			</header>

			{/* Filters */}
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<h2 className="text-lg font-semibold text-[var(--text-primary)]">Filtros</h2>
					<button
						type="button"
						onClick={handleFilterReset}
						className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
					>
						Restablecer
					</button>
				</div>

				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<FormField label="Buscar" htmlFor="kit-search">
						<div className="relative">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
							<TextField
								id="kit-search"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setPage(1);
								}}
								placeholder="Buscar por nombre o código"
								className="pl-9"
							/>
						</div>
					</FormField>

					<FormField label="Estado" htmlFor="kit-status">
						<Select
							id="kit-status"
							value={statusFilter}
							onChange={(e) => {
								setStatusFilter(e.target.value);
								setPage(1);
							}}
						>
							<option value="all">Todos los estados</option>
							{KIT_STATUS_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Select>
					</FormField>

					<FormField label="Actividad" htmlFor="kit-activity">
						<Select
							id="kit-activity"
							value={activityFilter}
							onChange={(e) => {
								setActivityFilter(e.target.value);
								setPage(1);
							}}
						>
							<option value="all">Todas</option>
							{KIT_ACTIVITY_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Select>
					</FormField>

					<FormField label="Riesgo" htmlFor="kit-risk">
						<Select
							id="kit-risk"
							value={riskFilter}
							onChange={(e) => {
								setRiskFilter(e.target.value);
								setPage(1);
							}}
						>
							<option value="all">Todos</option>
							{KIT_RISK_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Select>
					</FormField>
				</div>
			</section>

			{/* Kit Grid / Empty */}
			{kits.length === 0 ? (
				<section className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-medium)] bg-[var(--surface-primary)] px-6 py-10 text-center">
					<div className="rounded-[var(--radius-full)] bg-[var(--surface-secondary)] p-4 text-[var(--text-tertiary)]">
						<Package2 className="size-8" />
					</div>
					<div className="max-w-md space-y-2">
						<h3 className="text-lg font-semibold text-[var(--text-primary)]">
							No hay kits en esta vista
						</h3>
						<p className="text-sm text-[var(--text-secondary)]">
							Los kits reutilizables te permiten precargar herramientas, materiales, EPP y
							documentos para una planeación más rápida y sin olvidos.
						</p>
					</div>
					{canCreate ? (
						<Link
							href="/maintenance/new"
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-hover)]"
						>
							<Plus className="size-4" />
							Crear primer kit
						</Link>
					) : null}
				</section>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{kits.map((kit) => (
						<KitCard
							key={kit._id}
							kit={kit}
							canManage={canManage}
							onDelete={handleDelete}
							onArchive={handleArchive}
							onRestore={handleRestore}
							onActivate={handleActivate}
							onDuplicate={handleDuplicate}
						/>
					))}
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 ? (
				<div className="flex flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
					<p>
						Página {page} de {totalPages}
					</p>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							disabled={page <= 1}
							className="rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Anterior
						</button>
						<button
							type="button"
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages}
							className="rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 font-medium text-[var(--text-primary)] transition hover:bg-[var(--surface-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
						>
							Siguiente
						</button>
					</div>
				</div>
			) : null}
		</section>
	);
}

// ─── Kit Card ──────────────────────────────────────────────────────────────

interface KitCardProps {
	kit: KitTemplate;
	canManage: boolean;
	onDelete: (id: string, name: string) => void;
	onArchive: (id: string, name: string) => void;
	onRestore: (id: string) => void;
	onActivate: (id: string) => void;
	onDuplicate: (id: string) => void;
}

function KitCard({
	kit,
	canManage,
	onDelete,
	onArchive,
	onRestore,
	onActivate,
	onDuplicate,
}: KitCardProps) {
	const updatedAt = kit.updatedAt
		? format(new Date(kit.updatedAt), "dd MMM yyyy", { locale: es })
		: "";

	const totalItems = getKitItemCount(kit);

	const statusColorMap: Record<string, string> = {
		draft: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
		active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
		archived: "bg-[var(--surface-secondary)] text-[var(--text-tertiary)]",
		voided: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
	};

	return (
		<article className="group rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-2)] hover:border-[var(--color-brand)]/30">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1 space-y-1">
					<div className="flex items-center gap-2">
						<h3 className="truncate text-base font-semibold text-[var(--text-primary)]">
							{kit.name}
						</h3>
						{kit.isDefault ? (
							<span className="shrink-0 rounded-[var(--radius-full)] bg-[var(--color-cermont-blue-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)]">
								Default
							</span>
						) : null}
					</div>
					<p className="text-xs text-[var(--text-secondary)]">
						{formatKitActivityLabel(kit.activityType)}
						{kit.riskLevel ? ` · ${formatKitRiskLabel(kit.riskLevel)}` : ""}
						{kit.version ? ` · v${kit.version}` : ""}
					</p>
				</div>
				<span
					className={`shrink-0 rounded-[var(--radius-full)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
						statusColorMap[kit.status] ??
						"bg-[var(--surface-secondary)] text-[var(--text-secondary)]"
					}`}
				>
					{formatKitStatusLabel(kit.status)}
				</span>
			</div>

			{kit.description ? (
				<p className="mt-3 line-clamp-2 text-sm text-[var(--text-secondary)]">{kit.description}</p>
			) : null}

			{totalItems > 0 ? (
				<div className="mt-4 flex flex-wrap gap-1.5">
					{[
						{ count: kit.tools?.length, icon: Wrench, label: "herramientas" },
						{ count: kit.electricalTools?.length, icon: Wrench, label: "eléctricas" },
						{ count: kit.epp?.length, icon: HardHat, label: "EPP" },
						{ count: kit.materials?.length, icon: Package2, label: "mat." },
						{ count: kit.attachments?.length, icon: FileText, label: "docs" },
					]
						.filter((c) => (c.count ?? 0) > 0)
						.map((c) => {
							const Icon = c.icon;
							return (
								<span
									key={c.label}
									className="inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--surface-secondary)] px-2 py-1 text-[10px] font-medium text-[var(--text-tertiary)]"
								>
									<Icon className="size-3" />
									{c.count} {c.label}
								</span>
							);
						})}
				</div>
			) : null}

			<div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-tertiary)]">
				<span>
					{kit.usageCount && kit.usageCount > 0
						? `Usado ${kit.usageCount} vez${kit.usageCount !== 1 ? "es" : ""}`
						: "Sin uso"}
					{updatedAt ? ` · ${updatedAt}` : ""}
				</span>
				<div className="flex gap-1">
					<Link
						href={`/maintenance/${kit._id}`}
						className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-cermont-blue-bg)]"
					>
						Ver
					</Link>
					{canManage && kit.status === "draft" ? (
						<button
							type="button"
							onClick={() => onActivate(kit._id)}
							className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--color-success)] transition hover:bg-[var(--color-success-bg)]"
						>
							Activar
						</button>
					) : null}
					{canManage ? (
						<button
							type="button"
							onClick={() => onDuplicate(kit._id)}
							className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
							title="Duplicar kit"
						>
							<Copy className="size-3.5" />
						</button>
					) : null}
					{canManage && kit.status === "archived" ? (
						<button
							type="button"
							onClick={() => onRestore(kit._id)}
							className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)] transition hover:bg-[var(--color-warning-bg)]"
						>
							Restaurar
						</button>
					) : null}
					{canManage && (kit.status === "active" || kit.status === "draft") ? (
						<button
							type="button"
							onClick={() => onArchive(kit._id, kit.name)}
							className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--text-tertiary)] transition hover:bg-[var(--surface-secondary)]"
							title="Archivar"
						>
							<Archive className="size-3.5" />
						</button>
					) : null}
					{canManage && (kit.status === "draft" || kit.status === "active") ? (
						<button
							type="button"
							onClick={() => onDelete(kit._id, kit.name)}
							className="rounded-[var(--radius-full)] px-3 py-1.5 text-xs font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]"
						>
							Eliminar
						</button>
					) : null}
				</div>
			</div>
		</article>
	);
}
