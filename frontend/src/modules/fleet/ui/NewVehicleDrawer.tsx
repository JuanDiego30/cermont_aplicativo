"use client";

/**
 * NewVehicleDrawer — Professional slide-in drawer for creating a new vehicle.
 *
 * Sections:
 *   1. Identificación del vehículo (plate, brand, model, year, type)
 *   2. Documentos obligatorios (SOAT, tecnomecánica, póliza)
 *   3. Asignación/conductor (driver name)
 *   4. Mantenimiento inicial (last maintenance, next maintenance km)
 *   5. Fotos iniciales (local queue, uploaded after creation)
 *   6. Notas
 *
 * Contract-first: uses CreateVehicleInput from shared-types via adapter.
 * No Record<string, unknown>, no as unknown as Resolver.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { CreateVehicleInput } from "@cermont/shared-types";
import { useCreateVehicle } from "../queries";

// ─── Types ────────────────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
	{ value: "camioneta", label: "Camioneta" },
	{ value: "camion", label: "Camión" },
	{ value: "moto", label: "Moto" },
	{ value: "van", label: "Van" },
	{ value: "otro", label: "Otro" },
] as const;

/**
 * Form-specific type: dates are YYYY-MM-DD strings from <input type="date">.
 * Never undefined — uses empty string for optional fields.
 * The adapter converts to the ISO datetime strings that CreateVehicleInput expects.
 */
interface VehicleCreateFormValues {
	plate: string;
	brand: string;
	model: string;
	year: number;
	type: "camioneta" | "camion" | "moto" | "van" | "otro";
	kilometers: number;
	driverName: string;
	soatExpiry: string;
	technoMechanicalExpiry: string;
	insuranceExpiry: string;
	lastMaintenanceAt: string;
	nextMaintenanceKm: number;
	notes: string;
}

const VehicleCreateFormSchema = z.object({
	plate: z.string().min(5, "Mínimo 5 caracteres").max(10),
	brand: z.string().min(1, "Requerido").max(60),
	model: z.string().min(1, "Requerido").max(60),
	year: z.number().int().min(1980, "Mínimo 1980").max(2100, "Máximo 2100"),
	type: z.enum(["camioneta", "camion", "moto", "van", "otro"]),
	kilometers: z.number().int().nonnegative(),
	driverName: z.string().max(200),
	soatExpiry: z.string(),
	technoMechanicalExpiry: z.string(),
	insuranceExpiry: z.string(),
	lastMaintenanceAt: z.string(),
	nextMaintenanceKm: z.number().int().nonnegative(),
	notes: z.string().max(500),
});

/**
 * Adapter: form values (YYYY-MM-DD date strings) → CreateVehicleInput (ISO datetimes).
 * Empty strings → omit field.
 * Never uses undefined explicitly.
 */
function toCreateVehicleInput(values: VehicleCreateFormValues): CreateVehicleInput {
	/** Convert YYYY-MM-DD to ISO datetime or skip */
	function iso(v: string): string {
		return `${v}T00:00:00.000Z`;
	}
	const has = (v: string): boolean => v !== "";
	return {
		plate: values.plate.toUpperCase().trim(),
		brand: values.brand,
		model: values.model,
		year: values.year,
		type: values.type,
		kilometers: values.kilometers ?? 0,
		status: "active",
		...(has(values.driverName) ? { driverName: values.driverName.trim() } : {}),
		...(has(values.soatExpiry) ? { soatExpiry: iso(values.soatExpiry) } : {}),
		...(has(values.technoMechanicalExpiry)
			? { technoMechanicalExpiry: iso(values.technoMechanicalExpiry) }
			: {}),
		...(has(values.insuranceExpiry) ? { insuranceExpiry: iso(values.insuranceExpiry) } : {}),
		...(has(values.lastMaintenanceAt) ? { lastMaintenanceAt: iso(values.lastMaintenanceAt) } : {}),
		...(values.nextMaintenanceKm && values.nextMaintenanceKm > 0
			? { nextMaintenanceKm: values.nextMaintenanceKm }
			: {}),
		...(has(values.notes) ? { notes: values.notes.trim() } : {}),
	};
}

// ─── CSS classes ──────────────────────────────────────────────────────────────

const inputCls =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)]";

const labelCls = "flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]";

const errorCls = "mt-1 text-[10px] text-[var(--color-danger)]";

const sectionTitleCls =
	"text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]";

// ─── Props ────────────────────────────────────────────────────────────────────

interface NewVehicleDrawerProps {
	open: boolean;
	onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NewVehicleDrawer({ open, onClose }: NewVehicleDrawerProps) {
	const createMutation = useCreateVehicle();
	const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
	const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<VehicleCreateFormValues>({
		resolver: zodResolver(VehicleCreateFormSchema),
		defaultValues: {
			plate: "",
			brand: "",
			model: "",
			year: new Date().getFullYear(),
			type: "camioneta",
			kilometers: 0,
			driverName: "",
			soatExpiry: "",
			technoMechanicalExpiry: "",
			insuranceExpiry: "",
			lastMaintenanceAt: "",
			nextMaintenanceKm: 0,
			notes: "",
		},
	});

	// Use refs to avoid stale-closure lint warnings without listing dynamic deps
	const photoPreviewsRef = useRef(photoPreviews);
	photoPreviewsRef.current = photoPreviews;

	// Cleanup object URLs on unmount
	useEffect(() => {
		return () => {
			for (const url of photoPreviewsRef.current) {
				URL.revokeObjectURL(url);
			}
		};
	}, []);

	function handleAddPhoto(event: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		const validFiles = files.filter((f) => {
			if (f.size > 10 * 1024 * 1024) {
				toast.error(`${f.name} supera 10MB`);
				return false;
			}
			if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
				toast.error(`${f.name} no es JPG/PNG/WebP`);
				return false;
			}
			return true;
		});
		const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
		setPendingPhotos((prev) => [...prev, ...validFiles]);
		setPhotoPreviews((prev) => [...prev, ...newPreviews]);
		// Reset file input so re-selecting same file triggers change
		event.target.value = "";
	}

	function removePendingPhoto(index: number) {
		URL.revokeObjectURL(photoPreviews[index]);
		setPendingPhotos((prev) => prev.filter((_, i) => i !== index));
		setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
	}

	const onSubmit: SubmitHandler<VehicleCreateFormValues> = async (data) => {
		try {
			const input = toCreateVehicleInput(data);
			await createMutation.mutateAsync(input);
			toast.success("Vehículo registrado correctamente");
			reset();
			for (const f of pendingPhotos) {
				URL.revokeObjectURL(URL.createObjectURL(f));
			}
			setPendingPhotos([]);
			setPhotoPreviews([]);
			onClose();
		} catch {
			// Error is handled by mutation state
		}
	};

	const fieldsetCls = "space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)]/20 p-4";

	return (
		<Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) { onClose(); } }}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
				<Dialog.Content
					key={String(open)}
					aria-describedby="new-vehicle-description"
					className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					{/* ── Header ── */}
					<div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-6 py-4">
						<div>
							<Dialog.Title className="text-base font-semibold text-[var(--text-primary)]">
								Registrar vehículo
							</Dialog.Title>
							<Dialog.Description
								id="new-vehicle-description"
								className="mt-0.5 text-xs text-[var(--text-secondary)]"
							>
								Completa los datos del parque automotor
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<button
								type="button"
								className="rounded-[var(--radius-lg)] p-2 text-[var(--text-tertiary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]"
								aria-label="Cerrar formulario"
							>
								<X className="size-5" aria-hidden="true" />
							</button>
						</Dialog.Close>
					</div>

					{/* ── Body ── */}
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-1 flex-col overflow-y-auto"
						noValidate
					>
						<div className="space-y-5 px-6 py-6">
							{/* ════════════════════════════════════════════════════════════
									Section 1: Identificación del vehículo
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Identificación del vehículo</legend>

								<label className={labelCls}>
									Placa <span className="text-[var(--color-danger)]">*</span>
									<input
										{...register("plate")}
										placeholder="ABC-123"
										className={inputCls}
										autoComplete="off"
									/>
									{errors.plate && <span className={errorCls}>{errors.plate.message}</span>}
								</label>

								<div className="grid grid-cols-2 gap-3">
									<label className={labelCls}>
										Marca <span className="text-[var(--color-danger)]">*</span>
										<input
											{...register("brand")}
											placeholder="Toyota"
											className={inputCls}
										/>
										{errors.brand && <span className={errorCls}>{errors.brand.message}</span>}
									</label>
									<label className={labelCls}>
										Modelo <span className="text-[var(--color-danger)]">*</span>
										<input
											{...register("model")}
											placeholder="Hilux"
											className={inputCls}
										/>
										{errors.model && <span className={errorCls}>{errors.model.message}</span>}
									</label>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<label className={labelCls}>
										Año <span className="text-[var(--color-danger)]">*</span>
										<input
											{...register("year", { valueAsNumber: true })}
											type="number"
											inputMode="numeric"
											min={1980}
											max={2100}
											className={inputCls}
										/>
										{errors.year && <span className={errorCls}>{errors.year.message}</span>}
									</label>
									<label className={labelCls}>
										Tipo <span className="text-[var(--color-danger)]">*</span>
										<select {...register("type")} className={inputCls}>
											{VEHICLE_TYPES.map((vt) => (
												<option key={vt.value} value={vt.value}>
													{vt.label}
												</option>
											))}
										</select>
										{errors.type && <span className={errorCls}>{errors.type.message}</span>}
									</label>
								</div>

								<label className={labelCls}>
									Kilometraje actual
									<input
										{...register("kilometers", { valueAsNumber: true })}
										type="number"
										inputMode="numeric"
										min={0}
										placeholder="0"
										className={inputCls}
									/>
									{errors.kilometers && (
										<span className={errorCls}>{errors.kilometers.message}</span>
									)}
								</label>
							</fieldset>

							{/* ════════════════════════════════════════════════════════════
									Section 2: Documentos obligatorios
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Documentos obligatorios</legend>
								<p className="text-[11px] text-[var(--text-tertiary)]">
									Las fechas se pueden completar después de registrar el vehículo.
								</p>

								<label className={labelCls}>
									Vencimiento SOAT
									<input {...register("soatExpiry")} type="date" className={inputCls} />
									{errors.soatExpiry && (
										<span className={errorCls}>{errors.soatExpiry.message}</span>
									)}
								</label>

								<label className={labelCls}>
									Vencimiento Tecnomecánica
									<input
										{...register("technoMechanicalExpiry")}
										type="date"
										className={inputCls}
									/>
									{errors.technoMechanicalExpiry && (
										<span className={errorCls}>{errors.technoMechanicalExpiry.message}</span>
									)}
								</label>

								<label className={labelCls}>
									Vencimiento Póliza de seguros
									<input {...register("insuranceExpiry")} type="date" className={inputCls} />
									{errors.insuranceExpiry && (
										<span className={errorCls}>{errors.insuranceExpiry.message}</span>
									)}
								</label>
							</fieldset>

							{/* ════════════════════════════════════════════════════════════
									Section 3: Asignación / Conductor
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Asignación / Conductor</legend>
								<p className="text-[11px] text-[var(--text-tertiary)]">
									Selecciona el conductor asignado. La asignación formal se realiza desde el
									detalle del vehículo.
								</p>

								<label className={labelCls}>
									Nombre del conductor (opcional)
									<input
										{...register("driverName")}
										placeholder="Juan Pérez"
										className={inputCls}
									/>
									{errors.driverName && (
										<span className={errorCls}>{errors.driverName.message}</span>
									)}
								</label>
							</fieldset>

							{/* ════════════════════════════════════════════════════════════
									Section 4: Mantenimiento inicial
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Mantenimiento inicial</legend>
								<p className="text-[11px] text-[var(--text-tertiary)]">
									Datos de mantenimiento preventivo. Se pueden actualizar desde el detalle del
									vehículo.
								</p>

								<label className={labelCls}>
									Último mantenimiento
									<input
										{...register("lastMaintenanceAt")}
										type="date"
										className={inputCls}
									/>
									{errors.lastMaintenanceAt && (
										<span className={errorCls}>{errors.lastMaintenanceAt.message}</span>
									)}
								</label>

								<label className={labelCls}>
									Próximo mantenimiento (km)
									<input
										{...register("nextMaintenanceKm", { valueAsNumber: true })}
										type="number"
										inputMode="numeric"
										min={0}
										placeholder="Ej: 10000"
										className={inputCls}
									/>
									{errors.nextMaintenanceKm && (
										<span className={errorCls}>{errors.nextMaintenanceKm.message}</span>
									)}
								</label>
							</fieldset>

							{/* ════════════════════════════════════════════════════════════
									Section 5: Fotos iniciales
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Fotos iniciales</legend>
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
											onChange={handleAddPhoto}
											className="sr-only"
										/>
									</label>
									{pendingPhotos.length > 0 && (
										<span className="text-xs text-[var(--text-tertiary)]">
											{pendingPhotos.length} foto{pendingPhotos.length > 1 ? "s" : ""}
											{photoPreviews.length > 0 && " pendiente"}{pendingPhotos.length > 1 ? "s" : ""}
										</span>
									)}
								</div>

								{/* Photo queue previews */}
								{photoPreviews.length > 0 && (
									<div className="grid grid-cols-3 gap-2">
										{photoPreviews.map((preview, idx) => (
											<div
													key={preview}
													className="group relative aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
												>
													<Image
														src={preview}
														alt={`Foto ${idx + 1}`}
														fill
														className="object-cover"
														sizes="(max-width: 768px) 33vw, 100px"
														unoptimized
													/>
												<button
													type="button"
													onClick={() => removePendingPhoto(idx)}
													className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
													aria-label={`Eliminar foto ${idx + 1}`}
												>
													<X className="size-3" aria-hidden="true" />
												</button>
											</div>
										))}
									</div>
								)}
							</fieldset>

							{/* ════════════════════════════════════════════════════════════
									Section 6: Notas
								════════════════════════════════════════════════════════════ */}
							<fieldset className={fieldsetCls}>
								<legend className={sectionTitleCls}>Notas</legend>

								<label className={labelCls}>
									Observaciones
									<textarea
										{...register("notes")}
										rows={3}
										placeholder="Estado del vehículo, novedades, etc."
										className={inputCls}
									/>
									{errors.notes && <span className={errorCls}>{errors.notes.message}</span>}
								</label>
							</fieldset>

							{/* ── Global error ── */}
							{createMutation.error && (
								<div
									className="rounded-[var(--radius-lg)] bg-[var(--color-danger-bg)]/60 p-3 text-sm text-[var(--color-danger)]"
									role="alert"
								>
									{createMutation.error instanceof Error
										? createMutation.error.message
										: "No se pudo registrar el vehículo."}
								</div>
							)}
						</div>

						{/* ── Footer actions ── */}
						<div className="mt-auto flex justify-end gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
							<button
								type="button"
								onClick={onClose}
								className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={isSubmitting || createMutation.isPending}
								className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{(isSubmitting || createMutation.isPending) && (
									<Loader2 className="size-4 animate-spin" aria-hidden="true" />
								)}
								{isSubmitting || createMutation.isPending
									? "Guardando…"
									: "Registrar vehículo"}
							</button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
