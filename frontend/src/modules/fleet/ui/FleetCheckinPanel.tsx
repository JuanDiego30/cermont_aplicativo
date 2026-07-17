"use client";

/**
 * FleetCheckinPanel — Entrada de vehículo (checkin)
 *
 * Formulario para registrar la devolución de un vehículo asignado:
 * kilometraje final, nivel de combustible, fotos, daños y notas.
 */

import type { CheckinVehicleAssignmentInput } from "@cermont/shared-types";
import { Camera, Loader2 } from "lucide-react";
import { type ChangeEvent, type FormEvent, useReducer } from "react";
import { uploadVehiclePhoto } from "../api/fleet-api";
import { useCheckinVehicle } from "../queries";

interface FleetCheckinPanelProps {
	assignmentId: string;
	vehicleId: string;
	vehiclePlate: string;
	checkoutMileage: number;
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

interface CheckinUiState {
	mileage: number;
	fuelLevel: number;
	notes: string;
	photos: File[];
	damages: string;
	submissionError: string;
}

type CheckinAction =
	| { type: "SET_MILEAGE"; value: number }
	| { type: "SET_FUEL_LEVEL"; value: number }
	| { type: "SET_NOTES"; value: string }
	| { type: "SET_PHOTOS"; value: File[] }
	| { type: "SET_DAMAGES"; value: string }
	| { type: "SET_ERROR"; value: string };

function checkinReducer(state: CheckinUiState, action: CheckinAction): CheckinUiState {
	switch (action.type) {
		case "SET_MILEAGE":
			return { ...state, mileage: action.value };
		case "SET_FUEL_LEVEL":
			return { ...state, fuelLevel: action.value };
		case "SET_NOTES":
			return { ...state, notes: action.value };
		case "SET_PHOTOS":
			return { ...state, photos: action.value };
		case "SET_DAMAGES":
			return { ...state, damages: action.value };
		case "SET_ERROR":
			return { ...state, submissionError: action.value };
	}
}

export function FleetCheckinPanel({
	assignmentId,
	vehicleId,
	vehiclePlate,
	checkoutMileage,
	onSuccess,
}: FleetCheckinPanelProps) {
	const [ui, dispatch] = useReducer(checkinReducer, {
		mileage: checkoutMileage,
		fuelLevel: 50,
		notes: "",
		photos: [],
		damages: "",
		submissionError: "",
	});
	const checkinMutation = useCheckinVehicle();

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
				ui.photos.map((photo) => uploadVehiclePhoto(vehicleId, photo, `Entrada ${vehiclePlate}`)),
			);
			const trimmedNotes = ui.notes.trim();
			const trimmedDamages = ui.damages.trim();
			const payload: CheckinVehicleAssignmentInput = {
				checkin: {
					mileage: ui.mileage,
					fuelLevel: ui.fuelLevel,
					photos: uploadedPhotos.map((photo) => photo.id),
					...(trimmedNotes ? { notes: trimmedNotes } : {}),
					...(trimmedDamages ? { damages: trimmedDamages } : {}),
				},
			};
			await checkinMutation.mutateAsync({ assignmentId, input: payload });
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			dispatch({
				type: "SET_ERROR",
				value: error instanceof Error ? error.message : "No se pudo registrar la entrada del vehículo.",
			});
		}
	};

	const isPending = checkinMutation.isPending;
	const canSubmit = ui.mileage >= checkoutMileage;

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			<div>
				<h3 className="text-sm font-semibold text-[var(--text-primary)]">Entrada de vehículo</h3>
				<p className="text-xs text-[var(--text-secondary)]">
					Vehículo: <span className="font-medium text-[var(--text-primary)]">{vehiclePlate}</span>
				</p>
			</div>

			{/* Kilometraje */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">
					Kilometraje final <span className="text-[var(--color-danger)]">*</span>
				</span>
				<input
					type="number"
					min={checkoutMileage}
					value={ui.mileage}
					onChange={(e) => dispatch({ type: "SET_MILEAGE", value: Number(e.target.value) })}
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--color-brand-blue)] focus:outline-none"
					required
				/>
				{!canSubmit && (
					<span className="text-[10px] text-[var(--color-danger)]">
						Debe ser mayor o igual al kilometraje de salida ({checkoutMileage})
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

			{/* Daños */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">Daños</span>
				<textarea
					value={ui.damages}
					onChange={(e) => dispatch({ type: "SET_DAMAGES", value: e.target.value })}
					rows={2}
					maxLength={500}
					placeholder="Describa daños o novedades…"
					className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--color-brand-blue)] focus:outline-none resize-none"
				/>
			</label>

			{/* Notas */}
			<label className="flex flex-col gap-1.5">
				<span className="text-xs font-medium text-[var(--text-secondary)]">Notas</span>
				<textarea
					value={ui.notes}
					onChange={(e) => dispatch({ type: "SET_NOTES", value: e.target.value })}
					rows={2}
					maxLength={500}
					placeholder="Observaciones adicionales…"
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

			<button
				type="submit"
				disabled={!canSubmit || isPending}
				className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-brand-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
				{isPending ? "Registrando entrada…" : "Registrar entrada"}
			</button>
		</form>
	);
}
