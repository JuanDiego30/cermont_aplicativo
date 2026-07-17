"use client";

import { CalendarClock, Gauge, Milestone, User } from "lucide-react";
import { FleetReadinessBadge } from "@/modules/fleet/ui/FleetReadinessBadge";
import type { VehicleDetail } from "@/app/(dashboard)/fleet/[id]/page";
import { localeNumber } from "@/lib/utils/format-date";

interface FleetHeaderCardProps {
	data: VehicleDetail;
	readiness: { score: number; ready: boolean; blockers: unknown[] } | null;
	isSoatExpired: boolean;
}

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

export function FleetHeaderCard({ data, readiness, isSoatExpired }: FleetHeaderCardProps) {
	return (
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

			<div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--border-subtle)] pt-4">
				<div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
					<Gauge className="size-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
					<span className="font-medium tabular-nums">
						{localeNumber(data.kilometers)} km
					</span>
					{data.nextMaintenanceKm && (
						<span className="text-[var(--text-tertiary)]">
							/ pr&oacute;x. mantenimiento: {localeNumber(data.nextMaintenanceKm)} km
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

			{isSoatExpired && (
				<div className="mt-4 flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/40 p-3 text-sm text-[var(--color-danger)]">
					<CalendarClock className="size-4 shrink-0" aria-hidden="true" />
					<span>SOAT vencido — no se puede asignar conductor a este vehículo.</span>
				</div>
			)}
		</div>
	);
}
