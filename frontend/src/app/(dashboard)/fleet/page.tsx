"use client";

/**
 * /fleet — Parque automotor con documentos y alertas de vencimiento.
 */

import type { Vehicle, VehicleDocumentAlert } from "@cermont/shared-types";
import { CalendarClock, Plus, Truck } from "lucide-react";
import { useReducer, useState } from "react";
import { Skeleton } from "@/core/ui/Skeleton";
import {
	useCreateVehicle,
	useExpiringVehicleDocuments,
	useVehicles,
} from "@/modules/fleet/queries";

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

const DOCUMENT_LABELS: Record<string, string> = {
	soat: "SOAT",
	tecnomecanica: "Tecnomecánica",
	poliza: "Póliza",
};

const VEHICLE_TYPES = [
	{ value: "camioneta", label: "Camioneta" },
	{ value: "camion", label: "Camión" },
	{ value: "moto", label: "Moto" },
	{ value: "van", label: "Van" },
	{ value: "otro", label: "Otro" },
] as const;

const inputClasses =
	"rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]";

export default function FleetPage() {
	const [page, setPage] = useState(1);
	const [showNewForm, setShowNewForm] = useState(false);
	const { data, isLoading, error, refetch } = useVehicles({ page, limit: 20 });
	const { data: alerts } = useExpiringVehicleDocuments();

	const vehicles = data?.data ?? [];
	const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0, limit: 20 };

	return (
		<section className="space-y-6" aria-labelledby="fleet-title">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 id="fleet-title" className="text-xl font-semibold text-[var(--text-primary)]">
						Parque automotor
					</h1>
					<p className="mt-0.5 text-sm text-[var(--text-secondary)]">
						{pagination.total} vehículos registrados
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowNewForm((v) => !v)}
					className="flex items-center gap-1.5 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
				>
					<Plus className="size-4" aria-hidden="true" />
					Nuevo vehículo
				</button>
			</header>

			{(alerts ?? []).length > 0 && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-bg)] bg-[var(--color-warning-bg)]/40 p-4">
					<h2 className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--color-warning)]">
						<CalendarClock className="size-4" aria-hidden="true" />
						Documentos por vencer (30 días)
					</h2>
					<ul className="space-y-1">
						{(alerts ?? []).map((alert: VehicleDocumentAlert) => (
							<li
								key={`${alert.vehicleId}-${alert.documentType}`}
								className="text-xs text-[var(--text-primary)]"
							>
								<span className="font-medium">{alert.plate}</span> —{" "}
								{DOCUMENT_LABELS[alert.documentType]} (vence{" "}
								{new Date(alert.expiresAt).toLocaleDateString("es-CO")})
								{alert.expired && (
									<span className="ml-1 font-medium text-[var(--color-danger)]">VENCIDO</span>
								)}
							</li>
						))}
					</ul>
				</div>
			)}

			{showNewForm && <NewVehicleForm onClose={() => setShowNewForm(false)} />}

			{isLoading && (
				<div className="space-y-2">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} variant="chart" height={64} />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)]/60 p-6 text-sm">
					<p className="text-[var(--color-danger)]">Error al cargar el parque automotor.</p>
					<button
						type="button"
						onClick={() => refetch()}
						className="mt-2 text-sm font-medium text-[var(--color-brand-blue)] hover:underline"
					>
						Reintentar
					</button>
				</div>
			)}

			{!isLoading && !error && vehicles.length === 0 && (
				<div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] p-16 text-center">
					<Truck className="mx-auto mb-3 size-10 text-[var(--text-tertiary)]" aria-hidden="true" />
					<p className="text-[var(--text-secondary)]">Aún no hay vehículos registrados.</p>
				</div>
			)}

			{vehicles.length > 0 && (
				<ul className="space-y-2">
					{vehicles.map((vehicle: Vehicle) => (
						<li
							key={vehicle._id}
							className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4"
						>
							<div className="min-w-0">
								<div className="flex items-center gap-2">
									<p className="text-sm font-medium text-[var(--text-primary)]">{vehicle.plate}</p>
									<span
										className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[vehicle.status] ?? ""}`}
									>
										{STATUS_LABELS[vehicle.status] ?? vehicle.status}
									</span>
								</div>
								<p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
									{vehicle.brand} {vehicle.model} {vehicle.year} —{" "}
									{vehicle.kilometers.toLocaleString("es-CO")} km
									{vehicle.driverName ? ` — Conductor: ${vehicle.driverName}` : ""}
								</p>
							</div>
							<div className="flex shrink-0 flex-col items-end gap-0.5 text-[10px] text-[var(--text-tertiary)]">
								{vehicle.soatExpiry && (
									<span>SOAT: {new Date(vehicle.soatExpiry).toLocaleDateString("es-CO")}</span>
								)}
								{vehicle.technoMechanicalExpiry && (
									<span>
										Tecnomecánica:{" "}
										{new Date(vehicle.technoMechanicalExpiry).toLocaleDateString("es-CO")}
									</span>
								)}
							</div>
						</li>
					))}
				</ul>
			)}

			{pagination.totalPages > 1 && (
				<nav aria-label="Paginación" className="flex items-center justify-center gap-2">
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Anterior
					</button>
					<span className="text-xs text-[var(--text-tertiary)]">
						{page} / {pagination.totalPages}
					</span>
					<button
						type="button"
						disabled={page >= pagination.totalPages}
						onClick={() => setPage((p) => p + 1)}
						className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] disabled:opacity-40"
					>
						Siguiente
					</button>
				</nav>
			)}
		</section>
	);
}

interface VehicleFormState {
	plate: string;
	brand: string;
	model: string;
	year: number;
	vehicleType: string;
	kilometers: number;
	soatExpiry: string;
	technoExpiry: string;
	formError: string;
}

type VehicleFormAction =
	| { type: "SET_FIELD"; field: keyof Omit<VehicleFormState, "formError">; value: string | number }
	| { type: "SET_ERROR"; message: string }
	| { type: "RESET" };

function vehicleReducer(state: VehicleFormState, action: VehicleFormAction): VehicleFormState {
	switch (action.type) {
		case "SET_FIELD":
			return { ...state, [action.field]: action.value };
		case "SET_ERROR":
			return { ...state, formError: action.message };
		case "RESET":
			return createInitialVehicleState();
	}
}

function createInitialVehicleState(): VehicleFormState {
	return {
		plate: "",
		brand: "",
		model: "",
		year: new Date().getFullYear(),
		vehicleType: "camioneta",
		kilometers: 0,
		soatExpiry: "",
		technoExpiry: "",
		formError: "",
	};
}

function NewVehicleForm({ onClose }: { onClose: () => void }) {
	const createMutation = useCreateVehicle();
	const [form, dispatch] = useReducer(vehicleReducer, undefined, createInitialVehicleState);

	function setField(field: keyof Omit<VehicleFormState, "formError">, value: string | number) {
		dispatch({ type: "SET_FIELD", field, value } as VehicleFormAction);
	}

	async function handleSubmit() {
		dispatch({ type: "SET_ERROR", message: "" });
		if (!form.plate.trim() || !form.brand.trim() || !form.model.trim()) {
			dispatch({ type: "SET_ERROR", message: "Placa, marca y modelo son obligatorios." });
			return;
		}
		try {
			await createMutation.mutateAsync({
				plate: form.plate.trim().toUpperCase(),
				brand: form.brand.trim(),
				model: form.model.trim(),
				year: form.year,
				type: form.vehicleType as "camioneta",
				kilometers: form.kilometers,
				status: "active",
				...(form.soatExpiry ? { soatExpiry: new Date(form.soatExpiry).toISOString() } : {}),
				...(form.technoExpiry
					? { technoMechanicalExpiry: new Date(form.technoExpiry).toISOString() }
					: {}),
			});
			onClose();
		} catch (error) {
			dispatch({
				type: "SET_ERROR",
				message: error instanceof Error ? error.message : "No se pudo registrar el vehículo.",
			});
		}
	}

	return (
		<fieldset className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-1)] sm:grid-cols-2 lg:grid-cols-4 border-0 p-0">
			<legend className="sr-only">Nuevo vehículo</legend>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Placa
				<input
					value={form.plate}
					onChange={(e) => setField("plate", e.target.value)}
					placeholder="ABC-123"
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Marca
				<input
					value={form.brand}
					onChange={(e) => setField("brand", e.target.value)}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Modelo
				<input
					value={form.model}
					onChange={(e) => setField("model", e.target.value)}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Año
				<input
					type="number"
					inputMode="numeric"
					min={1980}
					max={2100}
					value={form.year}
					onChange={(e) => setField("year", Number(e.target.value))}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Tipo
				<select
					value={form.vehicleType}
					onChange={(e) => setField("vehicleType", e.target.value)}
					className={inputClasses}
				>
					{VEHICLE_TYPES.map((vt) => (
						<option key={vt.value} value={vt.value}>
							{vt.label}
						</option>
					))}
				</select>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Kilometraje
				<input
					type="number"
					inputMode="numeric"
					min={0}
					value={form.kilometers}
					onChange={(e) => setField("kilometers", Math.max(0, Number(e.target.value)))}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Vence SOAT
				<input
					type="date"
					value={form.soatExpiry}
					onChange={(e) => setField("soatExpiry", e.target.value)}
					className={inputClasses}
				/>
			</label>
			<label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
				Vence tecnomecánica
				<input
					type="date"
					value={form.technoExpiry}
					onChange={(e) => setField("technoExpiry", e.target.value)}
					className={inputClasses}
				/>
			</label>
			{form.formError && (
				<p className="text-sm text-[var(--color-danger)] sm:col-span-2 lg:col-span-4" role="alert">
					{form.formError}
				</p>
			)}
			<div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-4">
				<button
					type="button"
					onClick={onClose}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="button"
					disabled={createMutation.isPending}
					onClick={handleSubmit}
					className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
				>
					{createMutation.isPending ? "Guardando..." : "Registrar vehículo"}
				</button>
			</div>
		</fieldset>
	);
}
