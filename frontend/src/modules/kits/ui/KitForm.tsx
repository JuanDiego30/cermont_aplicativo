"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import { KIT_ACTIVITY_OPTIONS } from "@/modules/kits/constants";
import { useCreateKit } from "../hooks/useKits";

interface KitFormItem {
	type: string;
	name: string;
	quantity: number;
	unit: string;
	isCritical: boolean;
	isOptional: boolean;
	description?: string;
}

interface KitFormValues {
	name: string;
	description?: string;
	activityType: string;
	tools: KitFormItem[];
	materials: KitFormItem[];
	epp: KitFormItem[];
}

interface KitFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const DEFAULT_ITEM: KitFormItem = {
	type: "tool",
	name: "",
	quantity: 1,
	unit: "unidad",
	isCritical: false,
	isOptional: false,
};

const kitFormSchema = z.object({
	name: z.string().min(1, "El nombre es requerido").max(200),
	description: z.string().max(2000).optional(),
	activityType: z.string().min(1, "La actividad es requerida"),
	tools: z
		.array(
			z.object({
				type: z.string(),
				name: z.string().min(1, "El nombre es requerido"),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1),
				isCritical: z.boolean().default(false),
				isOptional: z.boolean().default(false),
				description: z.string().optional(),
			}),
		)
		.default([DEFAULT_ITEM]),
	materials: z
		.array(
			z.object({
				type: z.string(),
				name: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1),
				isCritical: z.boolean().default(false),
				isOptional: z.boolean().default(false),
				description: z.string().optional(),
			}),
		)
		.default([]),
	epp: z
		.array(
			z.object({
				type: z.string(),
				name: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1),
				isCritical: z.boolean().default(false),
				isOptional: z.boolean().default(false),
				description: z.string().optional(),
			}),
		)
		.default([]),
});

export function KitForm({ open, onOpenChange, onSuccess }: KitFormProps) {
	const formInstance = useForm<KitFormValues>({
		resolver: zodResolver(kitFormSchema) as never,
		defaultValues: {
			name: "",
			description: "",
			activityType: "electrico",
			tools: [DEFAULT_ITEM],
			materials: [],
			epp: [],
		},
	});

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = formInstance;
	const toolFields = useFieldArray({ control, name: "tools" as const });
	const materialFields = useFieldArray({ control, name: "materials" as const });
	const eppFields = useFieldArray({ control, name: "epp" as const });

	const createMutation = useCreateKit();

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (nextOpen) {
				reset({
					name: "",
					description: "",
					activityType: "electrico",
					tools: [DEFAULT_ITEM],
					materials: [],
					epp: [],
				});
			}
			onOpenChange(nextOpen);
		},
		[reset, onOpenChange],
	);

	const onSubmit = useCallback(
		async (raw: KitFormValues) => {
			try {
				await createMutation.mutateAsync(
					raw as unknown as Parameters<typeof createMutation.mutateAsync>[0],
				);
				onSuccess?.();
				onOpenChange(false);
			} catch {
				// Error handled by TanStack Query
			}
		},
		[createMutation, onSuccess, onOpenChange],
	);

	const isPending = createMutation.isPending;
	const titleId = "kit-form-title";

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
				<Dialog.Content
					className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 outline-none sm:items-center"
					aria-labelledby={titleId}
				>
					<div className="w-full max-w-2xl rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-6 shadow-xl sm:p-8">
						<Dialog.Title id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
							Nuevo kit
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-[var(--text-secondary)]">
							Completa los campos para crear un nuevo kit típico reutilizable.
						</Dialog.Description>

						<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
							<fieldset className="space-y-4">
								<legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									Información básica
								</legend>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<FormField name="name" label="Nombre" required error={errors.name?.message}>
										<TextField
											{...register("name")}
											placeholder="Ej: Kit eléctrico básico"
											error={Boolean(errors.name)}
										/>
									</FormField>

									<FormField
										name="activityType"
										label="Actividad"
										required
										error={errors.activityType?.message}
									>
										<Select {...register("activityType")} error={Boolean(errors.activityType)}>
											{KIT_ACTIVITY_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</Select>
									</FormField>
								</div>

								<FormField
									name="description"
									label="Descripción"
									error={errors.description?.message}
								>
									<TextArea
										{...register("description")}
										placeholder="Descripción opcional del kit…"
										error={Boolean(errors.description)}
										rows={3}
									/>
								</FormField>
							</fieldset>

							{/* Tools */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>Herramientas</span>
									<button
										type="button"
										onClick={() => toolFields.append({ ...DEFAULT_ITEM, type: "tool" })}
										className="flex items-center gap-1 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
										aria-label="Agregar herramienta"
									>
										<Plus aria-hidden="true" className="size-3.5" />
										Agregar
									</button>
								</legend>

								{toolFields.fields.length === 0 ? (
									<p className="text-sm text-[var(--text-tertiary)] italic">
										No hay herramientas. Agrega al menos una.
									</p>
								) : (
									<ul className="space-y-3">
										{toolFields.fields.map((field, index) => (
											<li
												key={field.id}
												className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-4"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
														<FormField name={`tools.${index}.name`} label="Nombre" required>
															<TextField
																{...register(`tools.${index}.name`)}
																placeholder="Ej: Taladro"
															/>
														</FormField>
														<FormField name={`tools.${index}.quantity`} label="Cant." required>
															<TextField
																type="number"
																min={1}
																{...register(`tools.${index}.quantity`, { valueAsNumber: true })}
															/>
														</FormField>
														<FormField name={`tools.${index}.unit`} label="Unidad" required>
															<TextField
																{...register(`tools.${index}.unit`)}
																placeholder="unidad, metro, litro"
															/>
														</FormField>
														<FormField name={`tools.${index}.description`} label="Descripción">
															<TextField
																{...register(`tools.${index}.description`)}
																placeholder="Opcional"
															/>
														</FormField>
													</div>
													<button
														type="button"
														onClick={() => toolFields.remove(index)}
														className="mt-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
														aria-label={`Eliminar ${index + 1}`}
													>
														<Trash2 aria-hidden="true" className="size-4" />
													</button>
												</div>
											</li>
										))}
									</ul>
								)}
							</fieldset>

							{/* Materials */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>Materiales (opcional)</span>
									<button
										type="button"
										onClick={() => materialFields.append({ ...DEFAULT_ITEM, type: "material" })}
										className="flex items-center gap-1 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
									>
										<Plus aria-hidden="true" className="size-3.5" />
										Agregar
									</button>
								</legend>

								{materialFields.fields.length === 0 ? (
									<p className="text-sm text-[var(--text-tertiary)] italic">
										Sin materiales. Puedes dejarlo vacío.
									</p>
								) : (
									<ul className="space-y-3">
										{materialFields.fields.map((field, index) => (
											<li
												key={field.id}
												className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-4"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
														<FormField name={`materials.${index}.name`} label="Nombre" required>
															<TextField
																{...register(`materials.${index}.name`)}
																placeholder="Ej: Cable THHN"
															/>
														</FormField>
														<FormField name={`materials.${index}.quantity`} label="Cant." required>
															<TextField
																type="number"
																min={1}
																{...register(`materials.${index}.quantity`, {
																	valueAsNumber: true,
																})}
															/>
														</FormField>
														<FormField name={`materials.${index}.unit`} label="Unidad" required>
															<TextField
																{...register(`materials.${index}.unit`)}
																placeholder="metro, kg"
															/>
														</FormField>
													</div>
													<button
														type="button"
														onClick={() => materialFields.remove(index)}
														className="mt-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--color-danger)]"
													>
														<Trash2 className="size-4" />
													</button>
												</div>
											</li>
										))}
									</ul>
								)}
							</fieldset>

							{/* EPP */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>EPP (opcional)</span>
									<button
										type="button"
										onClick={() => eppFields.append({ ...DEFAULT_ITEM, type: "epp" })}
										className="flex items-center gap-1 text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors"
									>
										<Plus aria-hidden="true" className="size-3.5" />
										Agregar
									</button>
								</legend>

								{eppFields.fields.length === 0 ? (
									<p className="text-sm text-[var(--text-tertiary)] italic">
										Sin EPP. Puedes dejarlo vacío.
									</p>
								) : (
									<ul className="space-y-3">
										{eppFields.fields.map((field, index) => (
											<li
												key={field.id}
												className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-4"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
														<FormField name={`epp.${index}.name`} label="Nombre" required>
															<TextField
																{...register(`epp.${index}.name`)}
																placeholder="Ej: Casco"
															/>
														</FormField>
														<FormField name={`epp.${index}.quantity`} label="Cant." required>
															<TextField
																type="number"
																min={1}
																{...register(`epp.${index}.quantity`, { valueAsNumber: true })}
															/>
														</FormField>
														<FormField name={`epp.${index}.unit`} label="Unidad" required>
															<TextField {...register(`epp.${index}.unit`)} placeholder="unidad" />
														</FormField>
													</div>
													<button
														type="button"
														onClick={() => eppFields.remove(index)}
														className="mt-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--color-danger)]"
													>
														<Trash2 className="size-4" />
													</button>
												</div>
											</li>
										))}
									</ul>
								)}
							</fieldset>

							<div className="flex items-center justify-end gap-3 border-t border-[var(--border-medium)] pt-5">
								<Dialog.Close asChild>
									<Button type="button" variant="outline" disabled={isPending}>
										Cancelar
									</Button>
								</Dialog.Close>
								<Button type="submit" variant="primary" disabled={isPending} loading={isPending}>
									{isPending ? "Creando…" : "Crear kit"}
								</Button>
							</div>
						</form>

						<Dialog.Close asChild>
							<button
								type="button"
								className="absolute right-5 top-5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
								aria-label="Cerrar"
							>
								<X className="size-5" aria-hidden="true" />
							</button>
						</Dialog.Close>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
