"use client";

/**
 * FleetCheckoutPanel — Salida de vehículo (checkout)
 *
 * Formulario para registrar la salida de un vehículo asignado:
 * kilometraje, nivel de combustible, fotos y notas.
 *
 * Contract-first: envía VehicleCheckoutSchema al endpoint
 * POST /api/fleet/assignments/:assignmentId/checkout.
 */

import type { CheckoutVehicleAssignmentInput } from "@cermont/shared-types";
import { Camera, Loader2 } from "lucide-react";
import { type ChangeEvent, type FormEvent, useReducer } from "react";
import { uploadVehiclePhoto } from "../api/fleet-api";
import { useCheckoutVehicle } from "../queries";

interface FleetCheckoutPanelProps {
	assignmentId: string;
	vehicleId: string;
	vehiclePlate: string;
	vehicleCurrentKm: number;
	onSuccess?: () => void;
}

const FUEL_OPTIONS = [
	{ value: 100, label: "Lleno" },
	{ value: 75, label: "3/4" },
	{ value: 50, label: "1/2" },
	{ value: 25, label: "1/4" },
	{ value: 10, label: "Reserva" },
];

// ─── useReducer ───────────────────────────────────────────────────────────────

interface CheckoutUiState {
	mileage: number;
	fuelLevel: number;
	notes: string;
	photos: File[];
	submissionError: string;
}

type CheckoutAction =
	| { type: "SET_MILEAGE"; value: number }
	| { type: "SET_FUEL_LEVEL"; value: number }
	| { type: "SET_NOTES"; value: string }
	| { type: "SET_PHOTOS"; value: File[] }
	| { type: "SET_ERROR"; value: string };

function checkoutReducer(state: CheckoutUiState, action: CheckoutAction): CheckoutUiState {
	switch (action.type) {
		case "SET_MILEAGE":
			return { ...state, mileage: action.value };
		case "SET_FUEL_LEVEL":
			return { ...state, fuelLevel: action.value };
		case "SET_NOTES":
			return { ...state, notes: action.value };
		case "SET_PHOTOS":
			return { ...state, photos: action.value };
		case "SET_ERROR":
			return { ...state, submissionError: action.value };
	}
}

export function FleetCheckoutPanel({
	assignmentId,
	vehicleId,
	vehiclePlate,
	vehicleCurrentKm,
	onSuccess,
}: FleetCheckoutPanelProps) {
	const [ui, dispatch] = useReducer(checkoutReducer, {
		mileage: vehicleCurrentKm,
		fuelLevel: 75,
		notes: "",
		photos: [],
		submissionError: "",
	});
	const checkoutMutation = useCheckoutVehicle();

	function handlePhotoSelection(event: ChangeEvent<HTMLInputElement>) {
		const files = event.currentTarget.files;
		if (files) {
			dispatch({ type: "SET_PHOTOS", value: Array.from(files) });
		}
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		dispatch({ type: "SET_ERROR", value: "" });

		try {
			const uploadedPhotos = await Promise.all(
				ui.photos.map((photo) => uploadVehiclePhoto(vehicleId, photo, `Salida ${vehiclePlate}`)),
			);
			const trimmedNotes = ui.notes.trim();
			const payload: CheckoutVehicleAssignmentInput = {
				checkout: {
					mileage: ui.mileage,
					fuelLevel: ui.fuelLevel,
					photos: uploadedPhotos.map((photo) => photo.id),
					...(trimmedNotes ? { notes: trimmedNotes } : {}),
				},
			};
			await checkoutMutation.mutateAsync({ assignmentId, input: payload });
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			dispatch({
				type: "SET_ERROR",
				value: error instanceof Error ? error.message : "No se pudo registrar la salida del vehículo.",
			});
		}
	};

	const isPending = checkoutMutation.isPending;
	const canSubmit = ui.mileage >= vehicleCurrentKm;

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			<div>
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Salida de vehículo</h3>
				<p className="text-xs text-[var(--text-secondary)]">
					Vehículo: <span className="font-medium text-[var(--text-primary)]">{vehiclePlate}</span>
				</p>
			</div>

			{/* Kilometraje */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">
					Kilometraje actual <span className="text-[var(--color-danger)]">*</span>
				</span>
				<input
					type="number"
					min={vehicleCurrentKm}
					value={ui.mileage}
					onChange={(e) => dispatch({ type: "SET_MILEAGE", value: Number(e.target.value) })}
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-brand-blue)] focus:outline-none"
					required
				/>
				{!canSubmit && (
					<span className="text-[10px] text-[var(--color-danger)]">
						Debe ser mayor o igual al kilometraje actual ({vehicleCurrentKm})
					</span>
				)}
			</label>

			{/* Nivel de combustible */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">
					Nivel de combustible <span className="text-[var(--color-danger)]">*</span>
				</span>
				<select
					value={ui.fuelLevel}
					onChange={(e) => dispatch({ type: "SET_FUEL_LEVEL", value: Number(e.target.value) })}
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-brand-blue)] focus:outline-none"
				>
					{FUEL_OPTIONS.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</label>

			{/* Notas */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">Notas</span>
				<textarea
					value={ui.notes}
					onChange={(e) => dispatch({ type: "SET_NOTES", value: e.target.value })}
					rows={2}
					maxLength={500}
					placeholder="Estado del vehículo, observaciones…"
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-brand-blue)] focus:outline-none resize-none"
				/>
			</label>

			{/* Fotos */}
			<div className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">Fotos (opcional)</span>
				<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]">
					<Camera className="size-4" aria-hidden="true" />
					Agregar fotos
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						multiple
						onChange={handlePhotoSelection}
						className="sr-only"
					/>
				</label>
				{ui.photos.length > 0 && (
					<span className="text-[10px] text-[var(--text-tertiary)]">
						{ui.photos.length} foto(s) seleccionada(s)
					</span>
				)}
			</div>

			{/* Error */}
			{(ui.submissionError || checkoutMutation.isError) && (
				<p
					className="rounded-lg bg-[var(--color-danger-bg)]/60 p-3 text-xs text-[var(--color-danger)]"
					role="alert"
				>
					{ui.submissionError ||
						(checkoutMutation.error instanceof Error
							? checkoutMutation.error.message
							: "No se pudo registrar la salida.")}
				</p>
			)}

			<button
				type="submit"
				disabled={!canSubmit || isPending}
				className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
				{isPending ? "Registrando salida…" : "Registrar salida"}
			</button>
		</form>
	);
}
