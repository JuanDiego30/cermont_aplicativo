"use client";

/**
 * VehicleAssignmentPanel — check-in / check-out lifecycle for a vehicle.
 *
 * Flow: assign (pending) → checkout with mileage+fuel (active) → checkin (completed).
 * Backed by /fleet assignment endpoints via the fleet query hooks.
 */

import type { VehicleAssignment } from "@cermont/shared-types";
import { CarFront, History, LogOut } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import {
	useActiveVehicleAssignment,
	useAssignVehicle,
	useCheckinVehicle,
	useCheckoutVehicle,
	useVehicleHistory,
} from "../queries";

const DATE_FORMATTER = new Intl.DateTimeFormat("es-CO", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "America/Bogota",
});

function formatDate(value?: string): string {
	return value ? DATE_FORMATTER.format(new Date(value)) : "—";
}

const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
	pending: "Pendiente de salida",
	active: "En uso",
	completed: "Devuelto",
};

function MileageFuelForm({
	title,
	submitLabel,
	isPending,
	onSubmit,
}: {
	title: string;
	submitLabel: string;
	isPending: boolean;
	onSubmit: (values: { mileage: number; fuelLevel: number; notes?: string }) => void;
}) {
	const [mileage, setMileage] = useState("");
	const [fuelLevel, setFuelLevel] = useState("");
	const [notes, setNotes] = useState("");

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const mileageValue = Number(mileage);
		const fuelValue = Number(fuelLevel);
		if (!Number.isFinite(mileageValue) || mileageValue < 0) {
			return;
		}
		if (!Number.isFinite(fuelValue) || fuelValue < 0 || fuelValue > 100) {
			return;
		}
		onSubmit({
			mileage: Math.round(mileageValue),
			fuelLevel: Math.round(fuelValue),
			notes: notes.trim() ? notes.trim() : undefined,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
			<div className="grid gap-3 sm:grid-cols-2">
				<label className="block text-xs font-medium text-[var(--text-secondary)]">
					Kilometraje
					<input
						type="number"
						min={0}
						required
						value={mileage}
						onChange={(event) => setMileage(event.target.value)}
						className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					/>
				</label>
				<label className="block text-xs font-medium text-[var(--text-secondary)]">
					Nivel de combustible (%)
					<input
						type="number"
						min={0}
						max={100}
						required
						value={fuelLevel}
						onChange={(event) => setFuelLevel(event.target.value)}
						className="mt-1 h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)]"
					/>
				</label>
			</div>
			<label className="block text-xs font-medium text-[var(--text-secondary)]">
				Observaciones
				<textarea
					rows={2}
					value={notes}
					onChange={(event) => setNotes(event.target.value)}
					className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)]"
					placeholder="Estado del vehículo, novedades…"
				/>
			</label>
			<button
				type="submit"
				disabled={isPending}
				className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
			>
				{submitLabel}
			</button>
		</form>
	);
}

function AssignmentHistory({ history }: { history: VehicleAssignment[] }) {
	if (history.length === 0) {
		return (
			<p className="text-sm text-[var(--text-secondary)]">Sin asignaciones registradas.</p>
		);
	}

	return (
		<ul className="space-y-2">
			{history.map((assignment) => (
				<li
					key={assignment._id ?? assignment.assignedAt}
					className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-4 py-3 text-sm"
				>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="font-medium text-[var(--text-primary)]">
							{assignment.driverName ?? "Conductor asignado"}
						</span>
						<span className="rounded-full bg-[var(--surface-primary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
							{ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}
						</span>
					</div>
					<p className="mt-1 text-xs text-[var(--text-tertiary)]">
						Asignado: {formatDate(assignment.assignedAt)}
						{assignment.checkout ? ` · Salida km ${assignment.checkout.mileage}` : ""}
						{assignment.checkin ? ` · Regreso km ${assignment.checkin.mileage}` : ""}
					</p>
				</li>
			))}
		</ul>
	);
}

export function VehicleAssignmentPanel({ vehicleId }: { vehicleId: string }) {
	const { user } = useAuth();
	const activeQuery = useActiveVehicleAssignment(vehicleId);
	const historyQuery = useVehicleHistory(vehicleId);
	const assignMutation = useAssignVehicle();
	const checkoutMutation = useCheckoutVehicle();
	const checkinMutation = useCheckinVehicle();

	const active = activeQuery.data;
	const mutationError =
		assignMutation.error ?? checkoutMutation.error ?? checkinMutation.error;

	return (
		<div className="space-y-6">
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<div className="flex items-center gap-2">
					<CarFront className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						Asignación del vehículo
					</h3>
				</div>

				{mutationError ? (
					<p role="alert" className="mt-3 text-xs text-[var(--color-danger)]">
						{mutationError instanceof Error
							? mutationError.message
							: "No se pudo completar la operación"}
					</p>
				) : null}

				<div className="mt-4">
					{activeQuery.isLoading ? (
						<p className="text-sm text-[var(--text-secondary)]">Cargando asignación…</p>
					) : !active ? (
						<div className="space-y-3">
							<p className="text-sm text-[var(--text-secondary)]">
								El vehículo está disponible para asignación.
							</p>
							<button
								type="button"
								disabled={!user?.id || assignMutation.isPending}
								onClick={() =>
									user?.id &&
									assignMutation.mutate({
										vehicleId,
										input: { vehicleId, driverId: user.id },
									})
								}
								className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
							>
								<LogOut className="size-4" aria-hidden="true" />
								{assignMutation.isPending ? "Asignando…" : "Asignarme este vehículo"}
							</button>
						</div>
					) : active.status === "pending" ? (
						<MileageFuelForm
							title={`Registrar salida — ${active.driverName ?? "conductor asignado"}`}
							submitLabel={checkoutMutation.isPending ? "Registrando…" : "Registrar salida"}
							isPending={checkoutMutation.isPending}
							onSubmit={(values) =>
								active._id &&
								checkoutMutation.mutate({
									assignmentId: active._id,
									input: { checkout: { ...values, photos: [] } },
								})
							}
						/>
					) : (
						<MileageFuelForm
							title={`Registrar regreso — ${active.driverName ?? "conductor asignado"}`}
							submitLabel={checkinMutation.isPending ? "Registrando…" : "Registrar regreso"}
							isPending={checkinMutation.isPending}
							onSubmit={(values) =>
								active._id &&
								checkinMutation.mutate({
									assignmentId: active._id,
									input: { checkin: { ...values, photos: [] } },
								})
							}
						/>
					)}
				</div>
			</section>

			<section className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-5">
				<div className="mb-3 flex items-center gap-2">
					<History className="size-4 text-[var(--color-brand-blue)]" aria-hidden="true" />
					<h3 className="text-sm font-semibold text-[var(--text-primary)]">
						Historial de asignaciones
					</h3>
				</div>
				{historyQuery.isLoading ? (
					<p className="text-sm text-[var(--text-secondary)]">Cargando historial…</p>
				) : historyQuery.isError ? (
					<p className="text-sm text-[var(--color-danger)]">
						No se pudo cargar el historial de asignaciones.
					</p>
				) : (
					<AssignmentHistory history={historyQuery.data ?? []} />
				)}
			</section>
		</div>
	);
}
