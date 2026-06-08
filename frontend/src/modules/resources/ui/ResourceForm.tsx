"use client";

/**
 * ResourceForm — Create/Edit dialog for resources
 *
 * Renders a Radix UI Dialog with react-hook-form + zod validation
 * for the expanded Resource schema (type, unit, active, images, etc.).
 *
 * @see CreateResourceSchema in @cermont/shared-types
 */

import type { CreateResource, Resource, UpdateResource } from "@cermont/shared-types";
import { CreateResourceSchema } from "@cermont/shared-types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useCallback, useMemo } from "react";
import { type Resolver, useForm } from "react-hook-form";
import type { z } from "zod";
import {
	RESOURCE_TYPE_LABELS,
	RESOURCE_TYPE_ORDER,
	UNIT_LABELS,
} from "@/app/(dashboard)/resources/resource-constants";
import { Button } from "@/core/ui/Button";
import { Checkbox, FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import { useCreateResource, useUpdateResource } from "../hooks/useResources";

type ResourceFormValues = z.input<typeof CreateResourceSchema>;

interface ResourceFormProps {
	resource?: Resource | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const resourceFormResolver = zodResolver(CreateResourceSchema) as Resolver<ResourceFormValues>;

export function ResourceForm({ resource, open, onOpenChange, onSuccess }: ResourceFormProps) {
	const isEdit = Boolean(resource);
	const resourceFormValues = useMemo<ResourceFormValues>(
		() => ({
			name: resource?.name ?? "",
			type: resource?.type ?? "tool",
			description: resource?.description ?? "",
			serialNumber: resource?.serialNumber ?? "",
			brand: resource?.brand ?? "",
			model: resource?.model ?? "",
			category: resource?.category ?? "",
			purchaseDate: resource?.purchaseDate ?? "",
			unit: resource?.unit ?? "unidad",
			defaultQuantity: resource?.defaultQuantity ?? 1,
			active: resource?.active ?? true,
		}),
		[
			resource?.active,
			resource?.brand,
			resource?.category,
			resource?.defaultQuantity,
			resource?.description,
			resource?.model,
			resource?.name,
			resource?.purchaseDate,
			resource?.serialNumber,
			resource?.type,
			resource?.unit,
		],
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResourceFormValues>({
		resolver: resourceFormResolver,
		values: resourceFormValues,
	});

	const createMutation = useCreateResource();
	const updateMutation = useUpdateResource();

	const onSubmit = useCallback(
		async (raw: ResourceFormValues) => {
			try {
				if (isEdit && resource) {
					await updateMutation.mutateAsync({ id: resource._id, input: raw as UpdateResource });
				} else {
					await createMutation.mutateAsync(raw as CreateResource);
				}
				onSuccess?.();
				onOpenChange(false);
			} catch {
				// Error handled by TanStack Query / toast notifications
			}
		},
		[isEdit, resource, updateMutation, createMutation, onSuccess, onOpenChange],
	);

	const isPending = createMutation.isPending || updateMutation.isPending;

	const titleId = "resource-form-title";

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 outline-none sm:items-center"
					aria-labelledby={titleId}
				>
					<div className="w-full max-w-2xl rounded-2xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-6 shadow-xl sm:p-8">
						<Dialog.Title id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
							{isEdit ? "Editar recurso" : "Nuevo recurso"}
						</Dialog.Title>
						<Dialog.Description className="mt-1 text-sm text-[var(--text-secondary)]">
							{isEdit
								? "Actualiza los campos del recurso. Los cambios se guardarán al confirmar."
								: "Completa los campos para registrar un nuevo recurso en el catálogo."}
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
											placeholder="Ej: Taladro percutor Bosch"
											error={Boolean(errors.name)}
										/>
									</FormField>

									<FormField name="type" label="Tipo" required error={errors.type?.message}>
										<Select {...register("type")} error={Boolean(errors.type)}>
											{RESOURCE_TYPE_ORDER.map((t) => (
												<option key={t} value={t}>
													{RESOURCE_TYPE_LABELS[t] ?? t}
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
										placeholder="Descripción opcional del recurso…"
										error={Boolean(errors.description)}
										rows={3}
									/>
								</FormField>
							</fieldset>

							{/* Identifiers */}
							<fieldset className="space-y-4">
								<legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									Identificación
								</legend>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<FormField
										name="serialNumber"
										label="N° Serial"
										error={errors.serialNumber?.message}
									>
										<TextField
											{...register("serialNumber")}
											placeholder="SN-001"
											error={Boolean(errors.serialNumber)}
										/>
									</FormField>

									<FormField name="brand" label="Marca" error={errors.brand?.message}>
										<TextField
											{...register("brand")}
											placeholder="Bosch"
											error={Boolean(errors.brand)}
										/>
									</FormField>

									<FormField name="model" label="Modelo" error={errors.model?.message}>
										<TextField
											{...register("model")}
											placeholder="GBH 2-28"
											error={Boolean(errors.model)}
										/>
									</FormField>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<FormField name="category" label="Categoría" error={errors.category?.message}>
										<TextField
											{...register("category")}
											placeholder="Ej: Perforación"
											error={Boolean(errors.category)}
										/>
									</FormField>

									<FormField
										name="purchaseDate"
										label="Fecha de compra"
										error={errors.purchaseDate?.message}
									>
										<TextField
											type="date"
											{...register("purchaseDate")}
											error={Boolean(errors.purchaseDate)}
										/>
									</FormField>
								</div>
							</fieldset>

							{/* Inventory */}
							<fieldset className="space-y-4">
								<legend className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									Inventario
								</legend>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<FormField name="unit" label="Unidad" error={errors.unit?.message}>
										<Select {...register("unit")} error={Boolean(errors.unit)}>
											{Object.entries(UNIT_LABELS).map(([value, label]) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</Select>
									</FormField>

									<FormField
										name="defaultQuantity"
										label="Cantidad por defecto"
										error={errors.defaultQuantity?.message}
									>
										<TextField
											type="number"
											min={1}
											{...register("defaultQuantity", { valueAsNumber: true })}
											error={Boolean(errors.defaultQuantity)}
										/>
									</FormField>

									<div className="flex items-end pb-2">
										<Checkbox
											{...register("active")}
											label="Activo"
											error={Boolean(errors.active)}
										/>
									</div>
								</div>
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
										"Crear recurso"
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
