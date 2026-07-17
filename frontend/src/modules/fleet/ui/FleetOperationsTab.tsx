"use client";

import { Loader2 } from "lucide-react";
import { EmptyState } from "@/core/ui/EmptyState";
import { FleetCheckinPanel } from "@/modules/fleet/ui/FleetCheckinPanel";
import { FleetCheckoutPanel } from "@/modules/fleet/ui/FleetCheckoutPanel";
import type { VehicleDetail } from "@/app/(dashboard)/fleet/[id]/page";

interface MinimalAssignment {
	_id?: string;
	checkout?: { mileage: number; fuelLevel: number };
	checkin?: { mileage: number; fuelLevel: number };
}

interface FleetOperationsTabProps {
	data: VehicleDetail;
	activeAssignment: MinimalAssignment | null;
	isLoadingActiveAssignment: boolean;
	activeAssignmentError: Error | null;
	refetchActiveAssignment: () => void;
	refreshVehicleOperations: () => void;
}

export function FleetOperationsTab({
	data,
	activeAssignment,
	isLoadingActiveAssignment,
	activeAssignmentError,
	refetchActiveAssignment,
	refreshVehicleOperations,
}: FleetOperationsTabProps) {
	const assignment = activeAssignment;

	return (
		<div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
			{isLoadingActiveAssignment && (
				<div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
					<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					Cargando asignación activa…
				</div>
			)}
			{activeAssignmentError && (
				<div className="space-y-3" role="alert">
					<p className="text-sm text-[var(--color-danger)]">
						No se pudo cargar la operación activa.
					</p>
					<button
						type="button"
						onClick={() => refetchActiveAssignment()}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)]"
					>
						Reintentar
					</button>
				</div>
			)}
			{!isLoadingActiveAssignment && !activeAssignmentError && !activeAssignment && (
				<EmptyState
					icon="fleet"
					title="Sin asignación activa"
					description="Asigna el vehículo a un conductor antes de registrar su salida o entrada."
				/>
			)}
			{assignment?._id && !assignment?.checkout && (
				<FleetCheckoutPanel
					assignmentId={assignment._id}
					vehicleId={data._id}
					vehiclePlate={data.plate}
					vehicleCurrentKm={data.kilometers}
					onSuccess={refreshVehicleOperations}
				/>
			)}
			{assignment?._id && assignment?.checkout && !assignment?.checkin && (
				<FleetCheckinPanel
					assignmentId={assignment._id}
					vehicleId={data._id}
					vehiclePlate={data.plate}
					checkoutMileage={assignment.checkout.mileage}
					onSuccess={refreshVehicleOperations}
				/>
			)}
		</div>
	);
}
