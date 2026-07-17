"use client";

import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent } from "react";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import {
	type CreateVehicleFormValues,
	toDateInputValue,
	toNumberInputValue,
	type VehicleDateField,
} from "../model/vehicle-form";

const VEHICLE_TYPES = [
	{ value: "camioneta", label: "Camioneta" },
	{ value: "camion", label: "Camión" },
	{ value: "moto", label: "Moto" },
	{ value: "van", label: "Van" },
	{ value: "otro", label: "Otro" },
] as const;

const inputClassName =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)]";
const labelClassName = "flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]";
const errorClassName = "mt-1 text-[10px] text-[var(--color-danger)]";
const fieldsetClassName =
	"space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/20 p-4";
const sectionTitleClassName =
	"text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]";

interface VehicleFormProps {
	form: UseFormReturn<CreateVehicleFormValues>;
	isPending: boolean;
	onCancel: () => void;
	onDateChange: (field: VehicleDateField, event: ChangeEvent<HTMLInputElement>) => void;
	onNumberChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onPhotoAdd: (event: ChangeEvent<HTMLInputElement>) => void;
	onPhotoRemove: (index: number) => void;
	onSubmit: SubmitHandler<CreateVehicleFormValues>;
	pendingPhotos: File[];
	photoPreviews: string[];
	submitError: string;
}

function RequiredLabel({ children }: { children: string }) {
	return (
		<>
			{children} <span className="text-[var(--color-danger)]">*</span>
		</>
	);
}

export function VehicleForm({
	form,
	isPending,
	onCancel,
	onDateChange,
	onNumberChange,
	onPhotoAdd,
	onPhotoRemove,
	onSubmit,
	pendingPhotos,
	photoPreviews,
	submitError,
}: VehicleFormProps) {
	const {
		formState: { errors, isSubmitting },
		register,
		watch,
	} = form;

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-1 flex-col overflow-y-auto"
			noValidate
		>
			<div className="space-y-5 px-6 py-6">
				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Identificación del vehículo</legend>
					<label className={labelClassName}>
						<RequiredLabel>Placa</RequiredLabel>
						<input
							{...register("plate", { setValueAs: (value: string) => value.toUpperCase().trim() })}
							placeholder="ABC-123"
							className={inputClassName}
							autoComplete="off"
						/>
						{errors.plate && <span className={errorClassName}>Mínimo 5 caracteres</span>}
					</label>
					<div className="grid grid-cols-2 gap-3">
						<label className={labelClassName}>
							<RequiredLabel>Marca</RequiredLabel>
							<input {...register("brand")} placeholder="Toyota" className={inputClassName} />
							{errors.brand && <span className={errorClassName}>Requerido</span>}
						</label>
						<label className={labelClassName}>
							<RequiredLabel>Modelo</RequiredLabel>
							<input {...register("model")} placeholder="Hilux" className={inputClassName} />
							{errors.model && <span className={errorClassName}>Requerido</span>}
						</label>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<label className={labelClassName}>
							<RequiredLabel>Año</RequiredLabel>
							<input
								{...register("year", { valueAsNumber: true })}
								type="number"
								inputMode="numeric"
								min={1980}
								max={2100}
								className={inputClassName}
							/>
							{errors.year && <span className={errorClassName}>{errors.year.message}</span>}
						</label>
						<label className={labelClassName}>
							<RequiredLabel>Tipo</RequiredLabel>
							<select {...register("type")} className={inputClassName}>
								{VEHICLE_TYPES.map((vehicleType) => (
									<option key={vehicleType.value} value={vehicleType.value}>
										{vehicleType.label}
									</option>
								))}
							</select>
							{errors.type && <span className={errorClassName}>{errors.type.message}</span>}
						</label>
					</div>
					<label className={labelClassName}>
						Kilometraje actual
						<input
							{...register("kilometers", { valueAsNumber: true })}
							type="number"
							inputMode="numeric"
							min={0}
							placeholder="0"
							className={inputClassName}
						/>
						{errors.kilometers && (
							<span className={errorClassName}>{errors.kilometers.message}</span>
						)}
					</label>
				</fieldset>

				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Documentos obligatorios</legend>
					<p className="text-[11px] text-[var(--text-tertiary)]">
						Las fechas se pueden completar después de registrar el vehículo.
					</p>
					{(
						[
							["soatExpiry", "Vencimiento SOAT"],
							["technoMechanicalExpiry", "Vencimiento Tecnomecánica"],
							["insuranceExpiry", "Vencimiento Póliza de seguros"],
						] as const
					).map(([field, label]) => (
						<label key={field} className={labelClassName}>
							{label}
							<input
								type="date"
								value={toDateInputValue(watch(field))}
								onChange={(event) => onDateChange(field, event)}
								className={inputClassName}
							/>
							{errors[field] && <span className={errorClassName}>{errors[field]?.message}</span>}
						</label>
					))}
				</fieldset>

				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Asignación / Conductor</legend>
					<p className="text-[11px] text-[var(--text-tertiary)]">
						La asignación formal se realiza desde el detalle del vehículo.
					</p>
					<label className={labelClassName}>
						Nombre del conductor (opcional)
						<input
							{...register("driverName")}
							placeholder="Juan Pérez"
							className={inputClassName}
						/>
						{errors.driverName && (
							<span className={errorClassName}>{errors.driverName.message}</span>
						)}
					</label>
				</fieldset>

				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Mantenimiento inicial</legend>
					<label className={labelClassName}>
						Último mantenimiento
						<input
							type="date"
							value={toDateInputValue(watch("lastMaintenanceAt"))}
							onChange={(event) => onDateChange("lastMaintenanceAt", event)}
							className={inputClassName}
						/>
						{errors.lastMaintenanceAt && (
							<span className={errorClassName}>{errors.lastMaintenanceAt.message}</span>
						)}
					</label>
					<label className={labelClassName}>
						Próximo mantenimiento (km)
						<input
							type="number"
							inputMode="numeric"
							min={0}
							placeholder="Ej: 10000"
							value={toNumberInputValue(watch("nextMaintenanceKm"))}
							onChange={onNumberChange}
							className={inputClassName}
						/>
						{errors.nextMaintenanceKm && (
							<span className={errorClassName}>{errors.nextMaintenanceKm.message}</span>
						)}
					</label>
				</fieldset>

				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Fotos iniciales</legend>
					<p className="text-[11px] text-[var(--text-tertiary)]">
						Selecciona fotos para agregar después de crear el vehículo.
					</p>
					<div className="flex items-center gap-3">
						<label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-primary)] px-4 py-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]">
							<Camera className="size-4" aria-hidden="true" />
							Agregar fotos
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								multiple
								onChange={onPhotoAdd}
								className="sr-only"
							/>
						</label>
						{pendingPhotos.length > 0 && (
							<span className="text-xs text-[var(--text-tertiary)]">
								{pendingPhotos.length} foto{pendingPhotos.length > 1 ? "s" : ""} pendiente
								{pendingPhotos.length > 1 ? "s" : ""}
							</span>
						)}
					</div>
					{photoPreviews.length > 0 && (
						<div className="grid grid-cols-3 gap-2">
							{photoPreviews.map((preview, index) => (
								<div
									key={preview}
									className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
								>
									<Image
										src={preview}
										alt={`Foto ${index + 1}`}
										fill
										className="object-cover"
										sizes="(max-width: 768px) 33vw, 100px"
										unoptimized
									/>
									<button
										type="button"
										onClick={() => onPhotoRemove(index)}
										className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
										aria-label={`Eliminar foto ${index + 1}`}
									>
										<X className="size-3" aria-hidden="true" />
									</button>
								</div>
							))}
						</div>
					)}
				</fieldset>

				<fieldset className={fieldsetClassName}>
					<legend className={sectionTitleClassName}>Notas</legend>
					<label className={labelClassName}>
						Observaciones
						<textarea
							{...register("notes")}
							rows={3}
							placeholder="Estado del vehículo, novedades, etc."
							className={inputClassName}
						/>
						{errors.notes && <span className={errorClassName}>{errors.notes.message}</span>}
					</label>
				</fieldset>

				{submitError && (
					<div
						className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]"
						role="alert"
					>
						{submitError}
					</div>
				)}
			</div>

			<div className="mt-auto flex justify-end gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</button>
				<button
					type="submit"
					disabled={isSubmitting || isPending}
					className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{(isSubmitting || isPending) && (
						<Loader2 className="size-4 animate-spin" aria-hidden="true" />
					)}
					{isSubmitting || isPending ? "Guardando…" : "Registrar vehículo"}
				</button>
			</div>
		</form>
	);
}
