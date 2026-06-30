"use client";

/**
 * NewVehicleDrawer — Slide-in drawer for creating a new vehicle.
 * Replaces the inline form embedded in fleet/page.tsx.
 * Uses react-hook-form with a local form type (dates as strings from <input type="date">).
 * Transforms dates to ISO before submitting.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type Resolver, type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateVehicle } from "../queries";

// Local form schema: dates are plain strings from <input type="date">
const DrawerFormSchema = z.object({
	plate: z.string().min(5, "Mínimo 5 caracteres").max(10),
	brand: z.string().min(1, "Requerido").max(60),
	model: z.string().min(1, "Requerido").max(60),
	year: z.number().int().min(1980).max(2100),
	type: z.enum(["camioneta", "camion", "moto", "van", "otro"]),
	kilometers: z.number().int().nonnegative().default(0),
	driverName: z.string().max(200).optional(),
	soatExpiry: z.string().optional(),
	technoMechanicalExpiry: z.string().optional(),
	insuranceExpiry: z.string().optional(),
});

type DrawerForm = z.infer<typeof DrawerFormSchema>;

/** Convert YYYY-MM-DD from <input type="date"> to ISO datetime string or undefined */
function toIso(dateString: string | undefined): string | undefined {
	if (!dateString) {
		return undefined;
	}
	// "2026-07-15" → "2026-07-15T00:00:00.000Z"
	const d = new Date(`${dateString}T00:00:00.000Z`);
	return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const VEHICLE_TYPES = [
	{ value: "camioneta", label: "Camioneta" },
	{ value: "camion", label: "Camión" },
	{ value: "moto", label: "Moto" },
	{ value: "van", label: "Van" },
	{ value: "otro", label: "Otro" },
] as const;

const inputCls =
	"w-full rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-focus-ring)]";

const labelCls = "flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]";

const errorCls = "mt-1 text-[10px] text-[var(--color-danger)]";

interface NewVehicleDrawerProps {
	open: boolean;
	onClose: () => void;
}

export function NewVehicleDrawer({ open, onClose }: NewVehicleDrawerProps) {
	const createMutation = useCreateVehicle();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<DrawerForm & Record<string, unknown>>({
		resolver: zodResolver(DrawerFormSchema) as unknown as Resolver<
			DrawerForm & Record<string, unknown>,
			unknown
		>,
		defaultValues: {
			plate: "",
			brand: "",
			model: "",
			year: new Date().getFullYear(),
			type: "camioneta",
			kilometers: 0,
		},
	});

	const onSubmit: SubmitHandler<DrawerForm & Record<string, unknown>> = async (data) => {
		await createMutation.mutateAsync({
			...data,
			plate: data.plate.toUpperCase().trim(),
			status: "active" as const,
			...(data.soatExpiry ? { soatExpiry: toIso(data.soatExpiry) } : {}),
			...(data.technoMechanicalExpiry
				? { technoMechanicalExpiry: toIso(data.technoMechanicalExpiry) }
				: {}),
			...(data.insuranceExpiry ? { insuranceExpiry: toIso(data.insuranceExpiry) } : {}),
		});
		reset();
		onClose();
	};

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onClose();
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
				<Dialog.Content
					aria-describedby="new-vehicle-description"
					className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--surface-primary)] shadow-[var(--shadow-3)]"
				>
					{/* Header */}
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

					{/* Body */}
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-1 flex-col overflow-y-auto"
						noValidate
					>
						<div className="space-y-4 px-6 py-6">
							{/* Placa */}
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

							{/* Marca / Modelo / Año */}
							<div className="grid grid-cols-2 gap-3">
								<label className={labelCls}>
									Marca <span className="text-[var(--color-danger)]">*</span>
									<input {...register("brand")} placeholder="Toyota" className={inputCls} />
									{errors.brand && <span className={errorCls}>{errors.brand.message}</span>}
								</label>
								<label className={labelCls}>
									Modelo <span className="text-[var(--color-danger)]">*</span>
									<input {...register("model")} placeholder="Hilux" className={inputCls} />
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

							{/* Kilometraje */}
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
								{errors.kilometers && <span className={errorCls}>{errors.kilometers.message}</span>}
							</label>

							{/* Conductor */}
							<label className={labelCls}>
								Conductor (nombre)
								<input {...register("driverName")} placeholder="Juan Pérez" className={inputCls} />
							</label>

							<hr className="border-[var(--border-subtle)]" />
							<p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
								Documentos obligatorios
							</p>

							{/* SOAT */}
							<label className={labelCls}>
								Vencimiento SOAT
								<input {...register("soatExpiry")} type="date" className={inputCls} />
								{errors.soatExpiry && <span className={errorCls}>{errors.soatExpiry.message}</span>}
							</label>

							{/* Tecnomecánica */}
							<label className={labelCls}>
								Vencimiento Tecnomecánica
								<input {...register("technoMechanicalExpiry")} type="date" className={inputCls} />
							</label>

							{/* Póliza */}
							<label className={labelCls}>
								Vencimiento Póliza
								<input {...register("insuranceExpiry")} type="date" className={inputCls} />
							</label>

							{/* Global error */}
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

						{/* Footer actions */}
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
								className="rounded-[var(--radius-lg)] bg-[var(--color-brand-blue)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isSubmitting || createMutation.isPending ? "Guardando…" : "Registrar vehículo"}
							</button>
						</div>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
