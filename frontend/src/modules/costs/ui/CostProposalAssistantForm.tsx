"use client";

import type { CostProposalActivityType, CostProposalInput } from "@cermont/shared-types";
import { CostProposalInputSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calculator, Loader2, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { Checkbox } from "@/core/ui/FormField";
import { FormField, Select, TextArea, TextField } from "@/modules/core";
import { CostProposalSpecialConditions } from "./CostProposalSpecialConditions";

type CostProposalFormValues = z.input<typeof CostProposalInputSchema>;

const ACTIVITY_TYPE_LABELS: Record<CostProposalActivityType, string> = {
	lifeline_horizontal: "Línea de vida horizontal",
	lifeline_vertical: "Línea de vida vertical",
	cctv_installation: "Instalación CCTV",
	cctv_maintenance: "Mantenimiento CCTV",
	anchor_installation: "Instalación de anclajes",
	anchor_inspection: "Inspección de anclajes",
	structural_inspection: "Inspección estructural",
	safety_inspection: "Inspección de seguridad",
	electrical: "Trabajo eléctrico",
	refrigeration: "Refrigeración",
	civil_works: "Obra civil",
	general_maintenance: "Mantenimiento general",
	other: "Otro",
};

const ACTIVITY_TYPE_OPTIONS = Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => ({
	value,
	label,
}));

const LOCATION_TYPE_OPTIONS = [
	{ value: "urban", label: "Urbano" },
	{ value: "rural", label: "Rural" },
	{ value: "remote", label: "Remoto" },
];

interface CostProposalAssistantFormProps {
	onSubmit: (data: CostProposalInput) => void;
	isSubmitting: boolean;
	initialData?: Partial<CostProposalInput>;
}

export function CostProposalAssistantForm({
	onSubmit,
	isSubmitting,
	initialData,
}: CostProposalAssistantFormProps) {
	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<CostProposalFormValues>({
		resolver: zodResolver(CostProposalInputSchema),
		defaultValues: {
			activityType: "general_maintenance",
			location: "",
			locationType: "urban",
			technicians: 1,
			supervisor: false,
			engineer: false,
			estimatedDuration: { days: 1, hoursPerDay: 8 },
			scopeDescription: "",
			measurements: [],
			materials: [],
			requiresFinalCertification: false,
			nightWork: false,
			adverseWeather: false,
			requiresHeightWork: false,
			requiresHotWork: false,
			requiresLockoutTagout: false,
			...initialData,
		},
	});

	const measurementsField = useFieldArray({ control, name: "measurements" });
	const materialsField = useFieldArray({ control, name: "materials" });

	const submitHandler = (data: CostProposalFormValues) => {
		onSubmit(data as unknown as CostProposalInput);
	};

	return (
		<form onSubmit={handleSubmit(submitHandler)} className="space-y-6" noValidate>
			{/* Activity Info */}
			<section className="space-y-4">
				<header>
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Actividad
					</h3>
				</header>

				<Controller
					name="activityType"
					control={control}
					render={({ field }) => (
						<FormField label="Tipo de actividad" error={errors.activityType?.message}>
							<Select value={field.value} onChange={field.onChange} name={field.name}>
								{ACTIVITY_TYPE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</Select>
						</FormField>
					)}
				/>

				<FormField label="Ubicación" error={errors.location?.message}>
					<TextField
						placeholder="Ej: Caño Limón, Bogotá, Barrancabermeja"
						{...register("location")}
					/>
				</FormField>

				<Controller
					name="locationType"
					control={control}
					render={({ field }) => (
						<FormField label="Tipo de ubicación" error={errors.locationType?.message}>
							<Select value={field.value} onChange={field.onChange} name={field.name}>
								{LOCATION_TYPE_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</Select>
						</FormField>
					)}
				/>

				<FormField label="Nombre del cliente (opcional)" error={errors.clientName?.message}>
					<TextField placeholder="Empresa o persona" {...register("clientName")} />
				</FormField>
			</section>

			{/* Personnel */}
			<section className="space-y-4">
				<header>
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Personal
					</h3>
				</header>

				<div className="grid grid-cols-2 gap-4">
					<FormField label="Técnicos" error={errors.technicians?.message}>
						<TextField
							type="number"
							min={1}
							max={50}
							{...register("technicians", { valueAsNumber: true })}
						/>
					</FormField>
					<FormField label="Días estimados" error={errors.estimatedDuration?.days?.message}>
						<TextField
							type="number"
							min={1}
							max={365}
							{...register("estimatedDuration.days", { valueAsNumber: true })}
						/>
					</FormField>
				</div>

				<FormField label="Horas por día" error={errors.estimatedDuration?.hoursPerDay?.message}>
					<TextField
						type="number"
						min={1}
						max={24}
						{...register("estimatedDuration.hoursPerDay", { valueAsNumber: true })}
					/>
				</FormField>

				<div className="flex flex-wrap gap-4">
					<Controller
						name="supervisor"
						control={control}
						render={({ field }) => (
							<Checkbox
								label="Incluye supervisor"
								checked={field.value}
								onChange={field.onChange}
								name={field.name}
							/>
						)}
					/>
					<Controller
						name="engineer"
						control={control}
						render={({ field }) => (
							<Checkbox
								label="Incluye ingeniero"
								checked={field.value}
								onChange={field.onChange}
								name={field.name}
							/>
						)}
					/>
				</div>
			</section>

			{/* Scope */}
			<section className="space-y-4">
				<header>
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-tertiary)]">
						Alcance
					</h3>
				</header>

				<FormField label="Descripción del alcance" error={errors.scopeDescription?.message}>
					<TextArea
						placeholder="Describa el trabajo a realizar..."
						rows={3}
						{...register("scopeDescription")}
					/>
				</FormField>

				{/* Measurements */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-[var(--text-secondary)]">Mediciones</span>
						<button
							type="button"
							onClick={() => measurementsField.append({ description: "", value: 0, unit: "m" })}
							className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
						>
							<Plus className="size-3" />
							Agregar
						</button>
					</div>

					{measurementsField.fields.map((field, index) => (
						<div key={field.id} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 items-start">
							<FormField error={errors.measurements?.[index]?.description?.message}>
								<TextField
									placeholder="Descripción (ej: Longitud cable)"
									{...register(`measurements.${index}.description`)}
								/>
							</FormField>
							<FormField error={errors.measurements?.[index]?.value?.message}>
								<TextField
									type="number"
									placeholder="Valor"
									min={0}
									{...register(`measurements.${index}.value`, {
										valueAsNumber: true,
									})}
								/>
							</FormField>
							<FormField error={errors.measurements?.[index]?.unit?.message}>
								<TextField placeholder="Unidad" {...register(`measurements.${index}.unit`)} />
							</FormField>
							<button
								type="button"
								onClick={() => measurementsField.remove(index)}
								className="mt-1 flex size-8 items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
								aria-label="Eliminar medición"
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))}
				</div>

				{/* Materials */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-[var(--text-secondary)]">
							Materiales conocidos (opcional)
						</span>
						<button
							type="button"
							onClick={() => materialsField.append({ name: "", quantity: 1, unit: "un" })}
							className="flex items-center gap-1 text-xs font-medium text-[var(--color-brand)] hover:underline"
						>
							<Plus className="size-3" />
							Agregar
						</button>
					</div>

					{materialsField.fields.map((field, index) => (
						<div
							key={field.id}
							className="grid grid-cols-[1fr_80px_80px_100px_32px] gap-2 items-start"
						>
							<FormField error={errors.materials?.[index]?.name?.message}>
								<TextField
									placeholder="Nombre del material"
									{...register(`materials.${index}.name`)}
								/>
							</FormField>
							<FormField error={errors.materials?.[index]?.quantity?.message}>
								<TextField
									type="number"
									placeholder="Cant."
									min={0}
									{...register(`materials.${index}.quantity`, {
										valueAsNumber: true,
									})}
								/>
							</FormField>
							<FormField error={errors.materials?.[index]?.unit?.message}>
								<TextField placeholder="Unidad" {...register(`materials.${index}.unit`)} />
							</FormField>
							<FormField>
								<TextField
									type="number"
									placeholder="Precio (opc.)"
									min={0}
									{...register(`materials.${index}.estimatedPrice`, {
										valueAsNumber: true,
									})}
								/>
							</FormField>
							<button
								type="button"
								onClick={() => materialsField.remove(index)}
								className="mt-1 flex size-8 items-center justify-center rounded text-[var(--text-tertiary)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
								aria-label="Eliminar material"
							>
								<Trash2 className="size-3.5" />
							</button>
						</div>
					))}
				</div>
			</section>

			{/* Special Conditions */}
			<CostProposalSpecialConditions control={control} register={register} />

			{/* Submit */}
			<button
				type="submit"
				disabled={isSubmitting}
				className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-brand)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin" />
						Calculando costos…
					</>
				) : (
					<>
						<Calculator className="size-4" />
						Calcular costos
					</>
				)}
			</button>
		</form>
	);
}
