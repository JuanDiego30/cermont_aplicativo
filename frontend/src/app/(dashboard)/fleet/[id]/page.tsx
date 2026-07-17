"use client";

/**
 * /fleet/[id] — Vehicle detail page with tabs.
 *
 * Tabs:
 *   - Información general (km, conductor, tipo)
 *   - Documentos          (SOAT / Tecnomecánica / Póliza con semáforo)
 *   - Fotos               (galería existente FleetPhotoGallery)
 *
 * Before: flat card list of InfoCards, no document status colors
 * After:  tabbed layout with professional document status cards
 */

import { evaluateFleetReadiness, hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	CalendarClock,
	Camera,
	FileText,
	Gauge,
	Info,
	Loader2,
	Milestone,
	User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useSyncExternalStore } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { FleetPhotoGallery } from "@/modules/fleet/ui/FleetPhotoGallery";
import { FleetReadinessBadge } from "@/modules/fleet/ui/FleetReadinessBadge";
import { VehicleAssignmentPanel } from "@/modules/fleet/ui/VehicleAssignmentPanel";
import { VehicleDocumentsTab } from "@/modules/fleet/ui/VehicleDocumentsTab";

// ─── Types ────────────────────────────────────────────────────────────────────

export type VehicleDetail = {
	_id: string;
	plate: string;
	brand: string;
	model: string;
	year: number;
	type: string;
	status: string;
	kilometers: number;
	capacity?: string;
	notes?: string;
	driverName?: string;
	driverId?: string;
	soatExpiry?: string;
	technoMechanicalExpiry?: string;
	insuranceExpiry?: string;
	documents?: Array<{
		documentType: string;
		documentNumber: string;
		issueDate: string;
		expiryDate: string;
		status: string;
		fileUrl?: string;
		verifiedAt?: string;
	}>;
	lastMaintenanceAt?: string;
	nextMaintenanceKm?: number;
	createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
	active: "Activo",
	maintenance: "En mantenimiento",
	out_of_service: "Fuera de servicio",
};

const STATUS_PILL: Record<string, string> = {
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	maintenance: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	out_of_service: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

const VEHICLE_TYPE_LABELS: Record<string, string> = {
	camioneta: "Camioneta",
	camion: "Camión",
	moto: "Moto",
	van: "Van",
	otro: "Otro",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useMounted(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "info" | "documents" | "photos" | "assignment";

const TABS: { id: TabId; label: string; icon: typeof Info }[] = [
	{ id: "info", label: "Información", icon: Info },
	{ id: "documents", label: "Documentos", icon: FileText },
	{ id: "photos", label: "Fotos", icon: Camera },
	{ id: "assignment", label: "Asignación", icon: User },
];

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof Info;
	label: string;
	value: string;
}) {
	return (
		<div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-secondary)]">
				<Icon className="size-4 text-[var(--text-tertiary)]" aria-hidden="true" />
			</div>
			<div>
				<p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
				<p className="mt-0.5 text-sm font-medium text-[var(--text-primary)]">{value}</p>
			</div>
		</div>
	);
}

// ─── FleetDetailPage ──────────────────────────────────────────────────────────

export default function FleetDetailPage() {
	return (
		<Suspense
			fallback={
				<section className="space-y-4" aria-label="Cargando vehículo">
					<div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
						<Loader2
							className="size-4 animate-spin text-[var(--color-brand-blue)]"
							aria-hidden="true"
						/>
						<span>Cargando…</span>
					</div>
				</section>
			}
		>
			<FleetDetailPageInner />
		</Suspense>
	);
}

function FleetDetailPageInner() {
	const { id } = useParams<{ id: string }>();
	const searchParams = useSearchParams();
	const rawTab = searchParams.get("tab") as TabId | null;
	const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "info";

	const mounted = useMounted();
	const { user } = useAuth();
	const canManage = hasRole(user?.role ?? "", MANAGEMENT_ROLES);

	const { data, isLoading, error } = useQuery<VehicleDetail>({
		queryKey: ["vehicle", id],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: VehicleDetail }>(`/fleet/${id}`);
			return json.data;
		},
	});

	const readiness = useMemo(() => {
		if (!data) {
			return null;
		}
		return evaluateFleetReadiness({
			soatExpiry: data.soatExpiry,
			technoMechanicalExpiry: data.technoMechanicalExpiry,
			insuranceExpiry: data.insuranceExpiry,
			lastMaintenanceAt: data.lastMaintenanceAt,
			status: data.status,
		});
	}, [data]);

	// ── Loading ──
	if (isLoading) {
		return (
			<section className="space-y-4" aria-label="Cargando vehículo">
				<div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
					<Loader2
						className="size-4 animate-spin text-[var(--color-brand-blue)]"
						aria-hidden="true"
					/>
					Cargando…
				</div>
				<div className="h-28 animate-pulse rounded-[var(--radius-xl)] bg-[var(--surface-secondary)]" />
				<div className="grid gap-3 sm:grid-cols-3">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-24 animate-pulse rounded-[var(--radius-xl)] bg-[var(--surface-secondary)]"
						/>
					))}
				</div>
			</section>
		);
	}

	// ── Error / not found ──
	if (error || !data) {
		return (
			<section>
				<Link
					href="/fleet"
					className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
				>
					<ArrowLeft className="size-4" aria-hidden="true" />
					Volver al parque automotor
				</Link>
				<EmptyState
					icon="fleet"
					title="Vehículo no encontrado"
					description="No se pudo cargar la información del vehículo."
				/>
			</section>
		);
	}

	// ── Soat expired warning ──
	const isSoatExpired = mounted && data.soatExpiry ? new Date(data.soatExpiry) < new Date() : false;

	return (
		<section className="space-y-6" aria-labelledby="vehicle-title">
			{/* ── Back ── */}
			<Link
				href="/fleet"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver al parque automotor
			</Link>

			{/* ── Vehicle Header Card ── */}
			<div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-6 shadow-[var(--shadow-1)]">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h1
								id="vehicle-title"
								className="text-2xl font-bold tracking-wide text-[var(--text-primary)]"
							>
								{data.plate}
							</h1>
							<span
								className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_PILL[data.status] ?? ""}`}
							>
								{STATUS_LABELS[data.status] ?? data.status}
							</span>
						</div>
						<p className="mt-1 text-sm text-[var(--text-secondary)]">
							{data.brand} {data.model} {data.year}
							{data.capacity && ` · Capacidad: ${data.capacity}`}
						</p>
					</div>

					<FleetReadinessBadge
						score={readiness?.score ?? 0}
						ready={readiness?.ready ?? false}
						blockerCount={readiness?.blockers.length ?? 0}
					/>
				</div>

				{/* Quick stats row */}
				<div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border-subtle)] pt-4">
					<div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
						<Gauge className="size-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
						<span className="font-medium tabular-nums">
							{data.kilometers.toLocaleString("es-CO")} km
						</span>
						{data.nextMaintenanceKm && (
							<span className="text-[var(--text-tertiary)]">
								/ próx. mantenimiento: {data.nextMaintenanceKm.toLocaleString("es-CO")} km
							</span>
						)}
					</div>
					{data.driverName && (
						<div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
							<User className="size-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
							<span>{data.driverName}</span>
						</div>
					)}
					<div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
						<Milestone className="size-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
						<span>{VEHICLE_TYPE_LABELS[data.type] ?? data.type}</span>
					</div>
				</div>

				{/* SOAT expired warning */}
				{isSoatExpired && (
					<div className="mt-4 flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/40 p-3 text-sm text-[var(--color-danger)]">
						<CalendarClock className="size-4 shrink-0" aria-hidden="true" />
						<span>SOAT vencido — no se puede asignar conductor a este vehículo.</span>
					</div>
				)}
			</div>

			{/* ── Tabs ── */}
			<div>
				{/* Tab nav */}
				<nav
					aria-label="Secciones del vehículo"
					className="flex gap-0.5 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] p-1"
				>
					{TABS.map(({ id: tabId, label, icon: TabIcon }) => {
						const isActive = activeTab === tabId;
						return (
							<Link
								key={tabId}
								href={`/fleet/${id}?tab=${tabId}`}
								role="tab"
								aria-selected={isActive}
								className={`flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-lg)] px-3 py-2 text-xs font-medium transition-all ${
									isActive
										? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-[var(--shadow-1)]"
										: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
								}`}
							>
								<TabIcon className="size-3.5" aria-hidden="true" />
								{label}
							</Link>
						);
					})}
				</nav>

				{/* Tab panels */}
				<div className="mt-4">
					{/* ── Info tab ── */}
					{activeTab === "info" && (
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							<InfoRow
								icon={Gauge}
								label="Kilometraje"
								value={`${data.kilometers.toLocaleString("es-CO")} km`}
							/>
							<InfoRow
								icon={User}
								label="Conductor asignado"
								value={data.driverName ?? "Sin asignar"}
							/>
							<InfoRow
								icon={Milestone}
								label="Tipo de vehículo"
								value={VEHICLE_TYPE_LABELS[data.type] ?? data.type}
							/>
							{data.capacity && <InfoRow icon={Info} label="Capacidad" value={data.capacity} />}
							{data.lastMaintenanceAt && (
								<InfoRow
									icon={CalendarClock}
									label="Último mantenimiento"
									value={new Date(data.lastMaintenanceAt).toLocaleDateString("es-CO")}
								/>
							)}
							{data.nextMaintenanceKm && (
								<InfoRow
									icon={Gauge}
									label="Próximo mantenimiento"
									value={`${data.nextMaintenanceKm.toLocaleString("es-CO")} km`}
								/>
							)}
							{data.notes && (
								<div className="sm:col-span-2 lg:col-span-3">
									<InfoRow icon={FileText} label="Observaciones" value={data.notes} />
								</div>
							)}
						</div>
					)}

					{/* ── Documents tab ── */}
					{activeTab === "documents" && (
						<VehicleDocumentsTab
							soatExpiry={data.soatExpiry}
							technoMechanicalExpiry={data.technoMechanicalExpiry}
							insuranceExpiry={data.insuranceExpiry}
							tarjetaPropiedadExpiry={data.documents?.find((d) => d.documentType === "tarjeta_propiedad")?.expiryDate}
						/>
					)}

					{/* ── Photos tab ── */}
					{activeTab === "photos" && (
						<FleetPhotoGallery vehicleId={data._id} canManage={canManage} />
					)}

					{/* ── Assignment tab ── */}
					{activeTab === "assignment" && <VehicleAssignmentPanel vehicleId={data._id} />}
				</div>
			</div>
		</section>
	);
}

