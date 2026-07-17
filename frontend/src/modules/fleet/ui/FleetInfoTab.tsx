"use client";

import { CalendarClock, FileText, Gauge, Info, Milestone, User } from "lucide-react";
import type { VehicleDetail } from "@/app/(dashboard)/fleet/[id]/page";
import { localeDate, localeNumber } from "@/lib/utils/format-date";

interface FleetInfoTabProps {
	data: VehicleDetail;
}

const VEHICLE_TYPE_LABELS: Record<string, string> = {
	camioneta: "Camioneta",
	camion: "Camión",
	moto: "Moto",
	van: "Van",
	otro: "Otro",
};

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

export function FleetInfoTab({ data }: FleetInfoTabProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			<InfoRow
				icon={Gauge}
				label="Kilometraje"
				value={`${localeNumber(data.kilometers)} km`}
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
					value={localeDate(data.lastMaintenanceAt)}
				/>
			)}
			{data.nextMaintenanceKm && (
				<InfoRow
					icon={Gauge}
					label="Próximo mantenimiento"
					value={`${localeNumber(data.nextMaintenanceKm)} km`}
				/>
			)}
			{data.notes && (
				<div className="sm:col-span-2 lg:col-span-3">
					<InfoRow icon={FileText} label="Observaciones" value={data.notes} />
				</div>
			)}
		</div>
	);
}
