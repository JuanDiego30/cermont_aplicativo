"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import type { CreateKitInput, KitItem } from "@cermont/shared-types";
import { KitActivityTypeEnum } from "@cermont/shared-types";
import { X } from "lucide-react";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/core/ui/Button";
import { FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import { KIT_ACTIVITY_OPTIONS } from "@/modules/kits/constants";
import { KitItemSection } from "@/modules/kits/ui/KitItemSection";
import { useCreateKit } from "../hooks/useKits";

/** Form-specific item interface (UI layer uses strings/dates, not schema objects). */
interface KitFormItem {
	type: string;
	name: string;
	quantity: number;
	unit: string;
	isCritical: boolean;
	isOptional: boolean;
	description?: string;
}

/** Form values — output type (defaults applied, all fields required). */
type KitFormValues = z.output<typeof kitFormSchema>;

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

/** UI-level schema — uses shared enums for consistency, not a replacement for CreateKitSchema. */
const kitFormSchema = z.object({
	name: z.string().min(1, "El nombre es requerido").max(200),
	description: z.string().max(2000).optional(),
	activityType: KitActivityTypeEnum,
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

type KitFormSchemaOutput = z.output<typeof kitFormSchema>;

/** Adapter: form values (UI strings/dates) → CreateKitInput (shared contract). */
function toCreateKitInput(values: KitFormSchemaOutput): CreateKitInput {
	function toKitItem(
		item: KitFormItem,
		category: KitItem["category"],
	): KitItem {
		return {
			category,
			name: item.name,
			quantity: item.quantity,
			unit: item.unit,
			isCritical: item.isCritical,
			isOptional: item.isOptional,
			description: item.description || undefined,
			requiresCertification: false,
			calibrationRequired: false,
		};
	}
	return {
		name: values.name,
		description: values.description || undefined,
		activityType: values.activityType,
		status: "draft",
		isDefault: false,
		tags: [],
		riskLevel: "low",
		tools: values.tools.map((t) => toKitItem(t, "tool")),
		electricalTools: [],
		constructionEquipment: [],
		heightSafetyKit: [],
		materials: values.materials.map((m) => toKitItem(m, "material")),
		epp: values.epp.map((e) => toKitItem(e, "epp")),
		instruments: [],
		vehicles: [],
		documents: [],
		attachments: [],
		checklists: [],
		readinessRules: [],
		requiredCertifications: [],
		requiredPermits: [],
		requiredAst: false,
		requiredEvidenceTypes: [],
	};
}

export function KitForm({ open, onOpenChange, onSuccess }: KitFormProps) {
	const formInstance = useForm({
		resolver: zodResolver(kitFormSchema),
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
	const toolFields = useFieldArray({ control, name: "tools" });
	const materialFields = useFieldArray({ control, name: "materials" });
	const eppFields = useFieldArray({ control, name: "epp" });

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
				const input = toCreateKitInput(raw as KitFormSchemaOutput);
				await createMutation.mutateAsync(input);
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
								</legend>
								<KitItemSection
									name="tools"
									label=""
									description=""
									emptyMessage="No hay herramientas. Agrega al menos una."
									addButtonLabel="Agregar"
									fields={toolFields.fields}
									register={register}
									errors={errors}
									onAppend={() => toolFields.append({ ...DEFAULT_ITEM, type: "tool" })}
									onRemove={(i) => toolFields.remove(i)}
									showDescription
								/>
							</fieldset>

							{/* Materials */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>Materiales (opcional)</span>
								</legend>
								<KitItemSection
									name="materials"
									label=""
									description=""
									emptyMessage="Sin materiales. Puedes dejarlo vacío."
									addButtonLabel="Agregar"
									fields={materialFields.fields}
									register={register}
									errors={errors}
									onAppend={() => materialFields.append({ ...DEFAULT_ITEM, type: "material" })}
									onRemove={(i) => materialFields.remove(i)}
								/>
							</fieldset>

							{/* EPP */}
							<fieldset className="space-y-4">
								<legend className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
									<span>EPP (opcional)</span>
								</legend>
								<KitItemSection
									name="epp"
									label=""
									description=""
									emptyMessage="Sin EPP. Puedes dejarlo vacío."
									addButtonLabel="Agregar"
									fields={eppFields.fields}
									register={register}
									errors={errors}
									onAppend={() => eppFields.append({ ...DEFAULT_ITEM, type: "epp" })}
									onRemove={(i) => eppFields.remove(i)}
								/>
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
