"use client";

/**
 * /fleet — Fleet list page redesigned with professional card layout.
 * Inspired by: Limble CMMS, FieldAware, ServiceMax fleet modules.
 *
 * Before: plain text list, inline form, no photos, no visual document status
 * After: grid of VehicleCard with primary photo, readiness score, document
 *        expiry chips, slide-in drawer for creation, filter bar
 */

import type { Vehicle, VehicleDocumentAlert } from "@cermont/shared-types";
import "@/modules/fleet/hooks/useFleetDocuments";
import {
	AlertTriangle,
	CalendarClock,
	Filter,
	Loader2,
	Plus,
	RefreshCw,
	Truck,
} from "lucide-react";
import { useState } from "react";
import { useExpiringVehicleDocuments, useVehicles } from "@/modules/fleet/queries";
import { NewVehicleDrawer } from "@/modules/fleet/ui/NewVehicleDrawer";
import { VehicleCard } from "@/modules/fleet/ui/VehicleCard";
import { localeDate } from "@/lib/utils/format-date";

// ─── Document Alerts Banner ───────────────────────────────────────────────────

const DOCUMENT_LABELS: Record<string, string> = {
	soat: "SOAT",
	tecnomecanica: "Tecnomecánica",
	poliza: "Póliza",
};

function DocumentAlertsBanner({ alerts }: { alerts: VehicleDocumentAlert[] }) {
	const expired = alerts.filter((a) => a.expired);
	const expiring = alerts.filter((a) => !a.expired);

	return (
		<div className="rounded-[var(--radius-xl)] border border-[var(--color-warning-bg)] bg-gradient-to-r from-[var(--color-warning-bg)]/40 to-transparent p-4">
			<div className="flex items-start gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-bg)]">
					<CalendarClock className="size-4 text-[var(--color-warning)]" aria-hidden="true" />
				</div>
				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-semibold text-[var(--color-warning)]">
						{expired.length > 0 ? (
							<>
								<span className="text-[var(--color-danger)]">
									{expired.length} vencido{expired.length > 1 ? "s" : ""}
								</span>
								{expiring.length > 0 && (
									<span className="text-[var(--color-warning)]">
										{" "}
										· {expiring.length} próximo{expiring.length > 1 ? "s" : ""} a vencer
									</span>
								)}
							</>
						) : (
							<>
								{alerts.length} documento{alerts.length > 1 ? "s" : ""} por vencer pronto
							</>
						)}
					</h2>
					<ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
						{alerts.slice(0, 5).map((alert) => (
							<li
								key={`${alert.vehicleId}-${alert.documentType}`}
								className={`flex items-center gap-1 text-xs ${alert.expired ? "text-[var(--color-danger)]" : "text-[var(--text-secondary)]"}`}
							>
								{alert.expired && <AlertTriangle className="size-3" aria-hidden="true" />}
								<span className="font-medium">{alert.plate}</span>
								<span>— {DOCUMENT_LABELS[alert.documentType]}</span>
								{alert.expired ? (
									<span className="font-semibold uppercase text-[var(--color-danger)]">
										vencido
									</span>
								) : (
									<span>(vence {localeDate(alert.expiresAt)})</span>
								)}
							</li>
						))}
						{alerts.length > 5 && (
							<li className="text-xs text-[var(--text-tertiary)]">+{alerts.length - 5} más…</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
}

// ─── Filter Bar ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
	{ value: "", label: "Todos los estados" },
	{ value: "active", label: "Activos" },
	{ value: "maintenance", label: "En mantenimiento" },
	{ value: "out_of_service", label: "Fuera de servicio" },
] as const;

const TYPE_OPTIONS = [
	{ value: "", label: "Todos los tipos" },
	{ value: "camioneta", label: "Camioneta" },
	{ value: "camion", label: "Camión" },
	{ value: "moto", label: "Moto" },
	{ value: "van", label: "Van" },
	{ value: "otro", label: "Otro" },
] as const;

const selectCls =
	"rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)]";

interface FiltersState {
	status: string;
	type: string;
}

function FilterBar({
	filters,
	onChange,
}: {
	filters: FiltersState;
	onChange: (key: keyof FiltersState, value: string) => void;
}) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Filter className="size-4 shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
			<select
				value={filters.status}
				onChange={(e) => onChange("status", e.target.value)}
				className={selectCls}
				aria-label="Filtrar por estado"
			>
				{STATUS_OPTIONS.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			<select
				value={filters.type}
				onChange={(e) => onChange("type", e.target.value)}
				className={selectCls}
				aria-label="Filtrar por tipo"
			>
				{TYPE_OPTIONS.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
		</div>
	);
}

// ─── FleetPage ────────────────────────────────────────────────────────────────

export default function FleetPage() {
	const [page, setPage] = useState(1);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [filters, setFilters] = useState<FiltersState>({ status: "", type: "" });

	const { data, isLoading, error, refetch } = useVehicles({
		page,
		limit: 20,
		...(filters.status ? { status: filters.status } : {}),
		...(filters.type ? { type: filters.type } : {}),
	});

	const { data: alerts } = useExpiringVehicleDocuments();

	const vehicles = data?.data ?? [];
	const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };
	const alertList = alerts ?? [];

	function handleFilterChange(key: keyof FiltersState, value: string) {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	}

	return (
		<section className="space-y-6" aria-labelledby="fleet-title">
			{/* ── Header ── */}
			<header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 id="fleet-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Parque automotor
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{isLoading ? (
							"Cargando…"
						) : (
							<>
								{pagination.total} vehículo{pagination.total !== 1 ? "s" : ""} registrado
								{pagination.total !== 1 ? "s" : ""}
								{alertList.length > 0 && (
									<span className="ml-2 inline-flex items-center gap-1 text-[var(--color-warning)]">
										<AlertTriangle className="size-3" aria-hidden="true" />
										{alertList.filter((a) => a.expired).length > 0
											? `${alertList.filter((a) => a.expired).length} doc. vencido${alertList.filter((a) => a.expired).length > 1 ? "s" : ""}`
											: `${alertList.length} doc. por vencer`}
									</span>
								)}
							</>
						)}
					</p>
				</div>
				<button
					type="button"
					id="fleet-new-vehicle-btn"
					onClick={() => setDrawerOpen(true)}
					className="flex items-center gap-1.5 self-start rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-1)] hover:opacity-90 active:scale-95 transition-all"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nuevo vehículo
				</button>
			</header>

			{/* ── Document Alerts Banner ── */}
			{alertList.length > 0 && <DocumentAlertsBanner alerts={alertList} />}

			{/* ── Filters ── */}
			<FilterBar filters={filters} onChange={handleFilterChange} />

			{/* ── Loading ── */}
			{isLoading && (
				<div className="flex items-center justify-center gap-3 py-16 text-sm text-[var(--text-secondary)]">
					<Loader2
						className="size-5 animate-spin text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					Cargando vehículos…
				</div>
			)}

			{/* ── Error ── */}
			{error && !isLoading && (
				<div className="rounded-[var(--radius-xl)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-center">
					<p className="text-sm text-[var(--color-danger)]">Error al cargar el parque automotor.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						<RefreshCw className="size-3.5" aria-hidden="true" />
						Reintentar
					</button>
				</div>
			)}

			{/* ── Empty state ── */}
			{!isLoading && !error && vehicles.length === 0 && (
				<div className="flex flex-col items-center gap-4 rounded-[var(--radius-xl)] border border-dashed border-[var(--border-subtle)] py-20 text-center">
					<div className="flex size-16 items-center justify-center rounded-full bg-[var(--surface-secondary)]">
						<Truck className="size-8 text-[var(--text-tertiary)]" aria-hidden="true" />
					</div>
					<div>
						<p className="text-base font-medium text-[var(--text-primary)]">
							{filters.status || filters.type ? "Sin resultados" : "Aún no hay vehículos"}
						</p>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{filters.status || filters.type
								? "Prueba con otros filtros."
								: "Registra el primer vehículo para comenzar."}
						</p>
					</div>
					{!filters.status && !filters.type && (
						<button
							type="button"
							onClick={() => setDrawerOpen(true)}
							className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
						>
							<Plus className="size-4" aria-hidden="true" />
							Registrar primer vehículo
						</button>
					)}
				</div>
			)}

			{/* ── Vehicle Grid ── */}
			{vehicles.length > 0 && (
				<ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
					{vehicles.map((vehicle: Vehicle) => (
						<li key={vehicle._id}>
							<VehicleCard vehicle={vehicle} />
						</li>
					))}
				</ul>
			)}

			{/* ── Pagination ── */}
			{pagination.totalPages > 1 && (
				<nav
					aria-label="Paginación del parque automotor"
					className="flex items-center justify-center gap-2"
				>
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-40"
					>
						Anterior
					</button>
					<span className="text-xs text-[var(--text-tertiary)]">
						Página {page} de {pagination.totalPages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] disabled:opacity-40"
					>
						Siguiente
					</button>
				</nav>
			)}

			{/* ── New Vehicle Drawer ── */}
			<NewVehicleDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
		</section>
	);
}
