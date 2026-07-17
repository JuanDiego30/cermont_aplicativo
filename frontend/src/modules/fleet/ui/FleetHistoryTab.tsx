"use client";

import { Loader2 } from "lucide-react";
import { localeDate, localeNumber } from "@/lib/utils/format-date";
import { EmptyState } from "@/core/ui/EmptyState";

interface AssignmentRecord {
	vehicleId: string;
	assignedAt: string;
	driverName?: string;
	status: string;
	checkout?: { mileage: number; fuelLevel: number };
	checkin?: { mileage: number; fuelLevel: number };
}

interface FleetHistoryTabProps {
	vehicleHistory: AssignmentRecord[];
	isLoadingHistory: boolean;
	vehicleHistoryError: Error | null;
	refetchVehicleHistory: () => void;
}

export function FleetHistoryTab({
	vehicleHistory,
	isLoadingHistory,
	vehicleHistoryError,
	refetchVehicleHistory,
}: FleetHistoryTabProps) {
	return (
		<div className="space-y-3">
			{isLoadingHistory && (
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					Cargando historial…
				</div>
			)}
			{vehicleHistoryError && (
				<div className="space-y-3" role="alert">
					<p className="text-sm text-[var(--color-danger)]">
						No se pudo cargar el historial de asignaciones.
					</p>
					<button
						type="button"
						onClick={() => refetchVehicleHistory()}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
					>
						Reintentar
					</button>
				</div>
			)}
			{!isLoadingHistory && !vehicleHistoryError && vehicleHistory.length === 0 && (
				<EmptyState
					icon="fleet"
					title="Sin operaciones registradas"
					description="Las salidas y entradas del vehículo aparecerán aquí."
				/>
			)}
			{vehicleHistory.map((assignment) => (
				<div
					key={`${assignment.vehicleId}-${assignment.assignedAt}`}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
				>
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-sm font-semibold text-[var(--text-primary)]">
								{assignment.driverName ?? "Conductor asignado"}
							</p>
							<p className="text-xs text-[var(--text-secondary)]">
								Asignado: {localeDate(assignment.assignedAt)}
							</p>
						</div>
						<span className="rounded-full bg-[var(--surface-secondary)] px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
							{assignment.status}
						</span>
					</div>
					{assignment.checkout && (
						<p className="mt-3 text-xs text-[var(--text-secondary)]">
							Salida: {localeNumber(assignment.checkout.mileage)} km &middot; combustible{" "}
							{assignment.checkout.fuelLevel}%
						</p>
					)}
					{assignment.checkin && (
						<p className="mt-1 text-xs text-[var(--text-secondary)]">
							Entrada: {localeNumber(assignment.checkin.mileage)} km &middot; combustible{" "}
							{assignment.checkin.fuelLevel}%
						</p>
					)}
				</div>
			))}
		</div>
	);
}
