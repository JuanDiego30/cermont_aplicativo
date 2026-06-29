"use client";

/**
 * /fleet/[id] — Vehicle detail page with document alerts
 */

import { evaluateFleetReadiness, hasRole, MANAGEMENT_ROLES } from "@cermont/domain";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useSyncExternalStore } from "react";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";
import { apiClient } from "@/lib/http/api-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { FleetPhotoGallery } from "@/modules/fleet/ui/FleetPhotoGallery";
import { FleetReadinessBadge } from "@/modules/fleet/ui/FleetReadinessBadge";

type VehicleDetail = {
	_id: string;
	plate: string;
	brand: string;
	model: string;
	year: number;
	type: string;
	status: string;
	kilometers: number;
	driverName?: string;
	driverId?: string;
	soatExpiry?: string;
	technoMechanicalExpiry?: string;
	insuranceExpiry?: string;
	lastMaintenanceAt?: string;
	createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
	active: "Activo",
	maintenance: "En mantenimiento",
	out_of_service: "Fuera de servicio",
};

const STATUS_STYLES: Record<string, string> = {
	active: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
	maintenance: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
	out_of_service: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
};

function useIsClient(): boolean {
	return useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);
}

export default function FleetDetailPage() {
	const { id } = useParams<{ id: string }>();
	const isClient = useIsClient();
	const { user } = useAuth();
	const canManage = hasRole(user?.role ?? "", MANAGEMENT_ROLES);

	const { data, isLoading, error } = useQuery<VehicleDetail>({
		queryKey: ["vehicle", id],
		queryFn: async () => {
			const json = await apiClient.get<{ success: boolean; data: VehicleDetail }>(`/fleet/${id}`);
			return json.data;
		},
	});

	const isSoatExpired = useMemo(
		() => isClient && data?.soatExpiry && new Date(data.soatExpiry) < new Date(),
		[isClient, data?.soatExpiry],
	);

	if (isLoading) {
		return (
			<section className="space-y-4" aria-label="Cargando vehículo">
				<Skeleton variant="text" />
				<Skeleton variant="chart" height={120} />
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton variant="text" />
					<Skeleton variant="text" />
				</div>
			</section>
		);
	}

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

	const readiness = evaluateFleetReadiness({
		soatExpiry: data.soatExpiry,
		technoMechanicalExpiry: data.technoMechanicalExpiry,
		insuranceExpiry: data.insuranceExpiry,
		lastMaintenanceAt: data.lastMaintenanceAt,
		status: data.status,
	});

	return (
		<section className="space-y-6" aria-labelledby="vehicle-title">
			<Link
				href="/fleet"
				className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-blue)] hover:underline"
			>
				<ArrowLeft className="size-4" aria-hidden="true" />
				Volver al parque automotor
			</Link>

			<header className="flex items-start justify-between gap-4">
				<div>
					<h1 id="vehicle-title" className="text-xl font-semibold text-[var(--text-primary)]">
						{data.plate}
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{data.brand} {data.model} {data.year} — {data.type}
					</p>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-2">
					<span
						className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[data.status] ?? ""}`}
					>
						{STATUS_LABELS[data.status] ?? data.status}
					</span>
					<FleetReadinessBadge
						score={readiness.score}
						ready={readiness.ready}
						blockerCount={readiness.blockers.length}
					/>
				</div>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<InfoCard label="Kilometraje" value={`${data.kilometers.toLocaleString("es-CO")} km`} />
				<InfoCard label="Conductor" value={data.driverName ?? "Sin asignar"} />
				<InfoCard
					label="SOAT"
					value={
						data.soatExpiry
							? new Date(data.soatExpiry).toLocaleDateString("es-CO")
							: "No registrado"
					}
				/>
				<InfoCard
					label="Tecnomecánica"
					value={
						data.technoMechanicalExpiry
							? new Date(data.technoMechanicalExpiry).toLocaleDateString("es-CO")
							: "No registrado"
					}
				/>
				<InfoCard
					label="Póliza"
					value={
						data.insuranceExpiry
							? new Date(data.insuranceExpiry).toLocaleDateString("es-CO")
							: "No registrado"
					}
				/>
				<InfoCard
					label="Último mantenimiento"
					value={
						data.lastMaintenanceAt
							? new Date(data.lastMaintenanceAt).toLocaleDateString("es-CO")
							: "Sin registro"
					}
				/>
			</div>

			{isSoatExpired && (
				<div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/40 p-3 text-sm text-[var(--color-danger)]">
					<CalendarClock className="size-4 shrink-0" aria-hidden="true" />
					<span>SOAT vencido. No se puede asignar conductor.</span>
				</div>
			)}

			<FleetPhotoGallery vehicleId={data._id} canManage={canManage} />
		</section>
	);
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4">
			<p className="text-xs text-[var(--text-tertiary)]">{label}</p>
			<p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{value}</p>
		</div>
	);
}
