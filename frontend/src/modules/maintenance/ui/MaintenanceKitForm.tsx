"use client";

import { CreateMaintenanceKitSchema, type MaintenanceKit } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox, FormField, Select, TextField } from "@/core/ui/FormField";
import {
	DEFAULT_EQUIPMENT_ROW,
	DEFAULT_MAINTENANCE_KIT_ACTIVITY,
	DEFAULT_TOOL_ROW,
	MAINTENANCE_KIT_ACTIVITY_OPTIONS,
} from "../constants";
import type { MaintenanceKitMutationInput } from "../queries";

type MaintenanceKitFormValues = z.input<typeof CreateMaintenanceKitSchema> & {
	isActive?: boolean;
};

interface MaintenanceKitFormProps {
	mode: "create" | "edit";
	initialKit?: MaintenanceKit;
	submitLabel: string;
	cancelHref: string;
	onSubmit: (payload: MaintenanceKitMutationInput) => Promise<void>;
	errorMessage?: string | null;
}

function buildDefaultValues(initialKit?: MaintenanceKit): MaintenanceKitFormValues {
	return {
		name: initialKit?.name ?? "",
		activityType: initialKit?.activityType ?? DEFAULT_MAINTENANCE_KIT_ACTIVITY,
		tools: initialKit?.tools.length
			? initialKit.tools.map((tool) => ({
					name: tool.name,
					quantity: tool.quantity,
					specifications: tool.specifications ?? "",
				}))
			: [{ ...DEFAULT_TOOL_ROW }],
		equipment: initialKit?.equipment.length
			? initialKit.equipment.map((item) => ({
					name: item.name,
					quantity: item.quantity,
					certificateRequired: item.certificateRequired,
				}))
			: [],
		isActive: initialKit?.isActive ?? true,
	};
}

function normalizePayload(
	values: MaintenanceKitFormValues,
	mode: "create" | "edit",
): MaintenanceKitMutationInput {
	return {
		name: values.name.trim(),
		activityType: values.activityType,
		tools: values.tools.map((tool) => ({
			name: tool.name.trim(),
			quantity: tool.quantity,
			...(tool.specifications?.trim() ? { specifications: tool.specifications.trim() } : {}),
		})),
		equipment: (values.equipment ?? []).map((item) => ({
			name: item.name.trim(),
			quantity: item.quantity,
			certificateRequired: item.certificateRequired ?? false,
		})),
		...(mode === "edit" ? { isActive: values.isActive ?? true } : {}),
	};
}

export function MaintenanceKitForm({
	mode,
	initialKit,
	submitLabel,
	cancelHref,
	onSubmit,
	errorMessage,
}: MaintenanceKitFormProps) {
	const maintenanceKitFormSchema = CreateMaintenanceKitSchema.extend({
		isActive: z.boolean().optional(),
	});
	const {
		register,
		control,
		reset,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<MaintenanceKitFormValues>({
		resolver: zodResolver(maintenanceKitFormSchema),
		defaultValues: buildDefaultValues(initialKit),
	});

	const toolFields = useFieldArray({
		control,
		name: "tools",
	});

	const equipmentFields = useFieldArray({
		control,
		name: "equipment",
	});

	useEffect(() => {
		reset(buildDefaultValues(initialKit));
	}, [initialKit, reset]);

	const submitHandler: SubmitHandler<MaintenanceKitFormValues> = async (values) => {
		await onSubmit(normalizePayload(values, mode));
	};

	return (
		<form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-8">
			{errorMessage ? (
				<p
					role="alert"
					className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
				>
					{errorMessage}
				</p>
			) : null}

			<section className="grid gap-5 rounded-[28px] border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 lg:grid-cols-2">
				<FormField label="Nombre del kit" required error={errors.name?.message}>
					<TextField
						id="maintenance-kit-name"
						autoComplete="off"
						placeholder="Kit para intervención eléctrica en campo"
						error={Boolean(errors.name)}
						{...register("name")}
					/>
				</FormField>

				<FormField label="Tipo de actividad" required error={errors.activityType?.message}>
					<Select
						id="maintenance-kit-activity-type"
						error={Boolean(errors.activityType)}
						{...register("activityType")}
					>
						{MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</Select>
				</FormField>

				{mode === "edit" ? (
					<div className="lg:col-span-2">
						<Checkbox label="Kit activo" {...register("isActive")} />
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
							Los kits desactivados permanecen en el historial pero no deberían asignarse a nuevas
							órdenes.
						</p>
					</div>
				) : (
					<p className="text-sm text-zinc-500 dark:text-zinc-400 lg:col-span-2">
						El kit se creará activo por defecto.
					</p>
				)}
			</section>

			<section className="space-y-4 rounded-[28px] border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Herramientas</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Agrega al menos una herramienta con su cantidad y especificación.
						</p>
					</div>

					<button
						type="button"
						onClick={() => toolFields.append({ ...DEFAULT_TOOL_ROW })}
						className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-blue-900 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-zinc-700 dark:text-blue-100 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
					>
						<Plus className="size-4" />
						Añadir herramienta
					</button>
				</div>

				<div className="space-y-4">
					{toolFields.fields.map((field, index) => {
						const toolError = errors.tools?.[index];

						return (
							<article
								key={field.id}
								className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
							>
								<div className="grid gap-4 lg:grid-cols-[1.4fr_0.5fr_1.1fr_auto] lg:items-start">
									<FormField label="Nombre" required error={toolError?.name?.message}>
										<TextField
											id={`tool-name-${field.id}`}
											placeholder="Herramienta"
											error={Boolean(toolError?.name)}
											{...register(`tools.${index}.name` as const)}
										/>
									</FormField>

									<FormField label="Cantidad" required error={toolError?.quantity?.message}>
										<TextField
											id={`tool-quantity-${field.id}`}
											type="number"
											min={1}
											step={1}
											error={Boolean(toolError?.quantity)}
											{...register(`tools.${index}.quantity` as const, {
												valueAsNumber: true,
											})}
										/>
									</FormField>

									<FormField label="Especificaciones" error={toolError?.specifications?.message}>
										<TextField
											id={`tool-specifications-${field.id}`}
											placeholder="Ej. acero inoxidable, aislamiento 1000V"
											error={Boolean(toolError?.specifications)}
											{...register(`tools.${index}.specifications` as const)}
										/>
									</FormField>

									<div className="flex lg:justify-end">
										<button
											type="button"
											onClick={() => toolFields.remove(index)}
											disabled={toolFields.fields.length === 1}
											className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-red-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700 dark:text-red-200 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
										>
											<Trash2 className="size-4" />
											Quitar
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>

				{errors.tools ? (
					<p role="alert" className="text-sm text-red-600 dark:text-red-300">
						{errors.tools.message || "Verifica las herramientas del kit."}
					</p>
				) : null}
			</section>

			<section className="space-y-4 rounded-[28px] border border-zinc-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Equipos</h2>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							Opcionalmente agrega equipos y señala si exigen certificación.
						</p>
					</div>

					<button
						type="button"
						onClick={() => equipmentFields.append({ ...DEFAULT_EQUIPMENT_ROW })}
						className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-blue-900 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:border-zinc-700 dark:text-blue-100 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
					>
						<Plus className="size-4" />
						Añadir equipo
					</button>
				</div>

				{equipmentFields.fields.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-zinc-200 px-4 py-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
						No hay equipos agregados todavía. Puedes dejar esta sección vacía.
					</div>
				) : null}

				<div className="space-y-4">
					{equipmentFields.fields.map((field, index) => {
						const equipmentError = errors.equipment?.[index];

						return (
							<article
								key={field.id}
								className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40"
							>
								<div className="grid gap-4 lg:grid-cols-[1.4fr_0.5fr_0.8fr_auto] lg:items-start">
									<FormField label="Nombre" required error={equipmentError?.name?.message}>
										<TextField
											id={`equipment-name-${field.id}`}
											placeholder="Equipo"
											error={Boolean(equipmentError?.name)}
											{...register(`equipment.${index}.name` as const)}
										/>
									</FormField>

									<FormField label="Cantidad" required error={equipmentError?.quantity?.message}>
										<TextField
											id={`equipment-quantity-${field.id}`}
											type="number"
											min={1}
											step={1}
											error={Boolean(equipmentError?.quantity)}
											{...register(`equipment.${index}.quantity` as const, {
												valueAsNumber: true,
											})}
										/>
									</FormField>

									<div className="pt-7 lg:pt-9">
										<Checkbox
											label="Requiere certificación"
											error={Boolean(equipmentError?.certificateRequired)}
											{...register(`equipment.${index}.certificateRequired` as const)}
										/>
									</div>

									<div className="flex lg:justify-end">
										<button
											type="button"
											onClick={() => equipmentFields.remove(index)}
											className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-medium text-red-800 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-zinc-700 dark:text-red-200 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
										>
											<Trash2 className="size-4" />
											Quitar
										</button>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			</section>

			<footer className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Link
					href={cancelHref}
					className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
				>
					Cancelar
				</Link>

				<button
					type="submit"
					disabled={isSubmitting}
					className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(15,23,42,0.24)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
				>
					{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
					{submitLabel}
				</button>
			</footer>
		</form>
	);
}
