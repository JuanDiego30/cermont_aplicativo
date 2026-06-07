"use client";

/**
 * KitForm — Create/Edit dialog for kit templates
 *
 * Renders a Radix UI Dialog with react-hook-form + zod validation
 * for the KitTemplate schema (name, description, category, status, items).
 *
 * @see CreateKitSchema in @cermont/shared-types
 */

import {
	type CreateKitInput,
	CreateKitSchema,
	type KitTemplate,
	type UpdateKitInput,
} from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useCallback } from "react";
import { type Resolver, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import { useCreateKit, useUpdateKit } from "../hooks/useKits";

interface KitFormItem {
	type: string;
	name: string;
	quantity: number;
	unit: string;
	required: boolean;
	critical: boolean;
	code?: string;
	description?: string;
	unitCost?: number;
}

interface KitFormValues {
	name: string;
	description?: string;
	category: string;
	status: string;
	serviceTypeIds: string[];
	items: KitFormItem[];
}

interface KitFormProps {
	kit?: KitTemplate | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
	{ value: "electrico", label: "Eléctrico" },
	{ value: "mecanico", label: "Mecánico" },
	{ value: "civil", label: "Civil" },
	{ value: "instrumentacion", label: "Instrumentación" },
	{ value: "general", label: "General" },
];

const ITEM_TYPE_OPTIONS = [
	{ value: "tool", label: "Herramienta" },
	{ value: "equipment", label: "Equipo" },
	{ value: "material", label: "Material" },
	{ value: "ppe", label: "EPP / Seguridad" },
	{ value: "document", label: "Documento" },
	{ value: "form", label: "Formulario" },
];

const DEFAULT_ITEM: KitFormItem = {
	type: "tool",
	name: "",
	quantity: 1,
	unit: "unidad",
	required: false,
	critical: false,
};

const kitFormResolver = zodResolver(CreateKitSchema) as Resolver<KitFormValues>;

export function KitForm({ kit, open, onOpenChange, onSuccess }: KitFormProps) {
	const isEdit = Boolean(kit);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<KitFormValues>({
		resolver: kitFormResolver,
		defaultValues: {
			name: kit?.name ?? "",
			description: kit?.description ?? "",
			category: kit?.category ?? "general",
			status: kit?.status ?? "draft",
			serviceTypeIds: kit?.serviceTypeIds ?? [],
			items: kit?.items?.length ? (kit.items as KitFormItem[]) : [DEFAULT_ITEM],
		},
	});

	const { fields, append, remove } = useFieldArray<KitFormValues, "items">({
		control,
		name: "items",
	});

	const createMutation = useCreateKit();
	const updateMutation = useUpdateKit();

	// Reset form when the dialog opens or resource changes
	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (nextOpen) {
				reset({
					name: kit?.name ?? "",
					description: kit?.description ?? "",
					category: kit?.category ?? "general",
					status: kit?.status ?? "draft",
					serviceTypeIds: kit?.serviceTypeIds ?? [],
					items: kit?.items?.length ? (kit.items as KitFormItem[]) : [DEFAULT_ITEM],
				});
			}
			onOpenChange(nextOpen);
		},
		[kit, reset, onOpenChange],
	);

	const getItemsError = (index: number, field: string) => {
		const itemsErrors = errors.items;
		if (!itemsErrors || !Array.isArray(itemsErrors)) {
			return undefined;
		}
		const itemError = itemsErrors[index];
		if (!itemError || typeof itemError !== "object") {
			return undefined;
		}
		return (itemError as Record<string, { message?: string }>)[field]?.message;
	};

	const hasItemsError = (index: number, field: string) => {
		return Boolean(getItemsError(index, field));
	};

	const onSubmit = useCallback(
		async (raw: KitFormValues) => {
			try {
				if (isEdit && kit) {
					await updateMutation.mutateAsync({ id: kit._id, input: raw as UpdateKitInput });
				} else {
					await createMutation.mutateAsync(raw as CreateKitInput);
				}
				onSuccess?.();
				onOpenChange(false);
			} catch {
				// Error handled by TanStack Query / toast notifications
			}
		},
		[isEdit, kit, updateMutation, createMutation, onSuccess, onOpenChange],
	);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const titleId = "kit-form-title";

	return (
		<Dialog.Root open={open} onOpenChange={handleOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 outline-none sm:items-center"
					aria-labelledby={titleId}
				>
					<div className="w-full max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-xl sm:p-8">
						<Dialog.Title id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
							{isEdit ? "Editar kit" : "Nuevo kit"}
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-[var(--text-secondary)]">
							{isEdit
								? "Actualiza los campos del kit. Los cambios se guardarán al confirmar."
								: "Completa los campos para crear un nuevo kit típico."}
						</Dialog.Description>

						<form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
							{/* Basic info */}
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
										name="category"
										label="Categoría"
										required
										error={errors.category?.message}
									>
										<Select {...register("category")} error={Boolean(errors.category)}>
											{CATEGORY_OPTIONS.map((opt) => (
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

							{/* Items */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>Ítems del kit</span>
									<button
										type="button"
										onClick={() => append(DEFAULT_ITEM)}
										className="flex items-center gap-1 text-[var(--color-cermont-blue)] hover:text-[var(--color-cermont-blue)]/80 transition-colors"
										aria-label="Agregar ítem"
									>
										<Plus aria-hidden="true" className="size-3.5" />
										Agregar
									</button>
								</legend>

								{fields.length === 0 ? (
									<p className="text-sm text-[var(--text-tertiary)] italic">
										No hay ítems. Agrega al menos un ítem al kit.
									</p>
								) : (
									<ul className="space-y-3">
										{fields.map((field, index) => (
											<li
												key={field.id}
												className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-secondary)]/40 p-4"
											>
												<div className="flex items-start justify-between gap-2">
													<div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
														<FormField
															name={`items.${index}.type`}
															label="Tipo"
															required
															error={getItemsError(index, "type")}
														>
															<Select
																{...register(`items.${index}.type`)}
																error={hasItemsError(index, "type")}
															>
																{ITEM_TYPE_OPTIONS.map((opt) => (
																	<option key={opt.value} value={opt.value}>
																		{opt.label}
																	</option>
																))}
															</Select>
														</FormField>

														<FormField
															name={`items.${index}.name`}
															label="Nombre"
															required
															error={getItemsError(index, "name")}
														>
															<TextField
																{...register(`items.${index}.name`)}
																placeholder="Ej: Taladro"
																error={hasItemsError(index, "name")}
															/>
														</FormField>

														<FormField
															name={`items.${index}.quantity`}
															label="Cant."
															required
															error={getItemsError(index, "quantity")}
														>
															<TextField
																type="number"
																min={1}
																{...register(`items.${index}.quantity`, {
																	valueAsNumber: true,
																})}
																error={hasItemsError(index, "quantity")}
															/>
														</FormField>

														<FormField
															name={`items.${index}.unit`}
															label="Unidad"
															required
															error={getItemsError(index, "unit")}
														>
															<TextField
																{...register(`items.${index}.unit`)}
																placeholder="Ej: unidad, metro, litro"
																error={hasItemsError(index, "unit")}
															/>
														</FormField>
													</div>

													<button
														type="button"
														onClick={() => remove(index)}
														className="mt-1 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--color-danger)] transition-colors"
														aria-label={`Eliminar ítem ${index + 1}`}
													>
														<Trash2 aria-hidden="true" className="size-4" />
													</button>
												</div>
											</li>
										))}
									</ul>
								)}
							</fieldset>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3 border-t border-[var(--border-default)] pt-5">
								<Dialog.Close asChild>
									<Button type="button" variant="outline" disabled={isPending}>
										Cancelar
									</Button>
								</Dialog.Close>
								<Button type="submit" variant="primary" disabled={isPending} loading={isPending}>
									{isPending ? (
										<>
											<Loader2 className="size-4 animate-spin" aria-hidden="true" />
											{isEdit ? "Guardando…" : "Creando…"}
										</>
									) : isEdit ? (
										"Guardar cambios"
									) : (
										"Crear kit"
									)}
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
