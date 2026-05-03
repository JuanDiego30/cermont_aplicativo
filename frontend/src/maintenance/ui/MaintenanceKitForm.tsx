"use client";

import {
	type ActivityType,
	CreateMaintenanceKitSchema,
	type MaintenanceKit,
} from "@cermont/shared-types";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo } from "react";
import { type SubmitHandler, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Checkbox, FormField, Select, TextArea, TextField } from "@/core/ui/FormField";
import {
	CHECKLIST_TIMING_OPTIONS,
	DEFAULT_EQUIPMENT_ROW,
	DEFAULT_LINKED_CHECKLIST_ROW,
	DEFAULT_MAINTENANCE_KIT_ACTIVITY,
	DEFAULT_MATERIAL_ROW,
	DEFAULT_PROCEDURE_STEP_ROW,
	DEFAULT_TOOL_ROW,
	JOB_STEP_TYPE_OPTIONS,
	KIT_PERMIT_OPTIONS,
	KIT_PPE_OPTIONS,
	KIT_RISK_OPTIONS,
	KIT_SPECIFIC_RISK_OPTIONS,
	MAINTENANCE_CLASSIFICATION_OPTIONS,
	MAINTENANCE_KIT_ACTIVITY_OPTIONS,
	MATERIAL_UNIT_OPTIONS,
	REQUIRED_SPECIALTY_OPTIONS,
} from "../constants";
import type { MaintenanceKitMutationInput } from "../queries";

type MaintenanceKitFormValues = z.input<typeof CreateMaintenanceKitSchema> & {
	isActive?: boolean;
	changeReason?: string;
};

interface MaintenanceKitFormProps {
	mode: "create" | "edit";
	initialKit?: MaintenanceKit;
	submitLabel: string;
	cancelHref: string;
	onSubmit: (payload: MaintenanceKitMutationInput) => Promise<void>;
	errorMessage?: string | null;
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="space-y-4 rounded-[var(--radius-lg)] border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
			<div>
				<h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
				{description ? (
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function normalizeOptional(value: string | undefined) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

function buildDefaultValues(initialKit?: MaintenanceKit): MaintenanceKitFormValues {
	return {
		name: initialKit?.name ?? "",
		activityType: initialKit?.activityType ?? DEFAULT_MAINTENANCE_KIT_ACTIVITY,
		subtype: initialKit?.subtype ?? "",
		description: initialKit?.description ?? "",
		estimatedHours: initialKit?.estimatedHours ?? 1,
		maintenanceClassification: initialKit?.maintenanceClassification ?? "preventive",
		assetScopes: initialKit?.assetScopes?.length ? initialKit.assetScopes : [],
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
		procedureSteps: initialKit?.procedureSteps.length
			? initialKit.procedureSteps.map((step, index) => ({
					order: step.order ?? index + 1,
					description: step.description,
					type: step.type,
					expectedValue: step.expectedValue ?? "",
					estimatedMinutes: step.estimatedMinutes ?? 15,
					required: step.required,
					referenceDocumentId: step.referenceDocumentId ?? "",
				}))
			: [{ ...DEFAULT_PROCEDURE_STEP_ROW }],
		materials: initialKit?.materials.length
			? initialKit.materials.map((material) => ({
					name: material.name,
					sku: material.sku ?? "",
					estimatedQuantity: material.estimatedQuantity,
					unit: material.unit,
					estimatedUnitCost: material.estimatedUnitCost ?? 0,
					critical: material.critical,
				}))
			: [],
		safety: initialKit?.safety ?? {
			minimumPpe: [],
			requiredPermits: [],
			riskClassification: "medium",
			specificRisks: [],
			safetyObservations: "",
			requiresLoto: false,
		},
		linkedChecklists: initialKit?.linkedChecklists.length ? initialKit.linkedChecklists : [],
		assignmentRules: initialKit?.assignmentRules ?? {
			requiredCertifications: [],
			minimumPeople: 1,
			requiresOnSiteSupervisor: false,
		},
		validatedBy: initialKit?.validatedBy ?? "",
		lastReviewedAt: initialKit?.lastReviewedAt ?? undefined,
		nextReviewAt: initialKit?.nextReviewAt ?? undefined,
		internalNotes: initialKit?.internalNotes ?? "",
		isActive: initialKit?.isActive ?? true,
		changeReason: "",
	};
}

function normalizePayload(
	values: MaintenanceKitFormValues,
	mode: "create" | "edit",
): MaintenanceKitMutationInput {
	const assignmentRules = values.assignmentRules ?? {
		requiredCertifications: [],
		minimumPeople: 1,
		requiresOnSiteSupervisor: false,
	};

	return {
		name: values.name.trim(),
		activityType: values.activityType as ActivityType,
		...(normalizeOptional(values.subtype) ? { subtype: normalizeOptional(values.subtype) } : {}),
		description: values.description.trim(),
		estimatedHours: values.estimatedHours,
		maintenanceClassification: values.maintenanceClassification,
		assetScopes: values.assetScopes ?? [],
		tools: values.tools.map((tool) => ({
			name: tool.name.trim(),
			quantity: tool.quantity,
			...(normalizeOptional(tool.specifications)
				? { specifications: normalizeOptional(tool.specifications) }
				: {}),
		})),
		equipment: (values.equipment ?? []).map((item) => ({
			name: item.name.trim(),
			quantity: item.quantity,
			certificateRequired: item.certificateRequired ?? false,
		})),
		procedureSteps: values.procedureSteps.map((step, index) => ({
			order: index + 1,
			description: step.description.trim(),
			type: step.type,
			...(normalizeOptional(step.expectedValue)
				? { expectedValue: normalizeOptional(step.expectedValue) }
				: {}),
			estimatedMinutes: step.estimatedMinutes,
			required: step.required ?? true,
			...(normalizeOptional(step.referenceDocumentId)
				? { referenceDocumentId: normalizeOptional(step.referenceDocumentId) }
				: {}),
		})),
		materials: (values.materials ?? []).map((material) => ({
			name: material.name.trim(),
			...(normalizeOptional(material.sku) ? { sku: normalizeOptional(material.sku) } : {}),
			estimatedQuantity: material.estimatedQuantity,
			unit: material.unit,
			estimatedUnitCost: material.estimatedUnitCost ?? 0,
			critical: material.critical ?? false,
		})),
		safety: {
			minimumPpe: values.safety.minimumPpe ?? [],
			requiredPermits: values.safety.requiredPermits ?? [],
			riskClassification: values.safety.riskClassification,
			specificRisks: values.safety.specificRisks ?? [],
			...(normalizeOptional(values.safety.safetyObservations)
				? { safetyObservations: normalizeOptional(values.safety.safetyObservations) }
				: {}),
			requiresLoto: values.safety.requiresLoto ?? false,
		},
		linkedChecklists: (values.linkedChecklists ?? [])
			.filter((checklist) => checklist.templateId.trim())
			.map((checklist) => ({
				templateId: checklist.templateId.trim(),
				timing: checklist.timing,
				blocking: checklist.blocking ?? false,
			})),
		assignmentRules: {
			...(assignmentRules.requiredSpecialty
				? { requiredSpecialty: assignmentRules.requiredSpecialty }
				: {}),
			requiredCertifications: assignmentRules.requiredCertifications ?? [],
			minimumPeople: assignmentRules.minimumPeople ?? 1,
			requiresOnSiteSupervisor: assignmentRules.requiresOnSiteSupervisor ?? false,
		},
		...(normalizeOptional(values.validatedBy)
			? { validatedBy: normalizeOptional(values.validatedBy) }
			: {}),
		...(values.lastReviewedAt ? { lastReviewedAt: values.lastReviewedAt } : {}),
		...(values.nextReviewAt ? { nextReviewAt: values.nextReviewAt } : {}),
		...(normalizeOptional(values.internalNotes)
			? { internalNotes: normalizeOptional(values.internalNotes) }
			: {}),
		isActive: values.isActive ?? true,
		...(mode === "edit" ? { changeReason: values.changeReason?.trim() } : {}),
	};
}

function ProcedureStepCard({
	id,
	index,
	children,
}: {
	id: string;
	index: number;
	move?: (from: number, to: number) => void;
	children: ReactNode;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.6 : 1,
	};

	return (
		<article
			ref={setNodeRef}
			style={style}
			className="rounded-[var(--radius-lg)] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
		>
			<div
				className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-slate-500"
				{...attributes}
				{...listeners}
			>
				<GripVertical className="h-4 w-4" />
				Paso {index + 1}
			</div>
			{children}
		</article>
	);
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
		changeReason: z.string().optional(),
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

	const activityType = useWatch({ control, name: "activityType" });
	const materials = useWatch({ control, name: "materials" }) ?? [];
	const procedureSteps = useWatch({ control, name: "procedureSteps" }) ?? [];
	const baseMaterialCost = useMemo(
		() =>
			materials.reduce(
				(total, material) =>
					total +
					(Number(material.estimatedQuantity) || 0) * (Number(material.estimatedUnitCost) || 0),
				0,
			),
		[materials],
	);

	const toolFields = useFieldArray({ control, name: "tools" });
	const equipmentFields = useFieldArray({ control, name: "equipment" });
	const procedureFields = useFieldArray({ control, name: "procedureSteps" });
	const materialFields = useFieldArray({ control, name: "materials" });
	const checklistFields = useFieldArray({ control, name: "linkedChecklists" });

	useEffect(() => {
		reset(buildDefaultValues(initialKit));
	}, [initialKit, reset]);

	const submitHandler: SubmitHandler<MaintenanceKitFormValues> = async (values) => {
		await onSubmit(normalizePayload(values, mode));
	};

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) {
			return;
		}
		const oldIndex = procedureFields.fields.findIndex((f) => f.id === active.id);
		const newIndex = procedureFields.fields.findIndex((f) => f.id === over.id);
		if (oldIndex !== -1 && newIndex !== -1) {
			procedureFields.move(oldIndex, newIndex);
		}
	};

	const procedureStepIds = procedureFields.fields.map((f) => f.id);

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
			<form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-8">
				{errorMessage ? (
					<p
						role="alert"
						className="rounded-[var(--radius-lg)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
					>
						{errorMessage}
					</p>
				) : null}

				<Section title="Datos generales">
					<div className="grid gap-5 lg:grid-cols-2">
						<FormField label="Nombre del kit" required error={errors.name?.message}>
							<TextField
								id="maintenance-kit-name"
								error={Boolean(errors.name)}
								{...register("name")}
							/>
						</FormField>
						<FormField label="Tipo de actividad" required error={errors.activityType?.message}>
							<Select id="maintenance-kit-activity-type" {...register("activityType")}>
								{MAINTENANCE_KIT_ACTIVITY_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
						</FormField>
						{activityType === "electrical" ? (
							<FormField label="Subtipo eléctrico" error={errors.subtype?.message}>
								<Select id="maintenance-kit-subtype" {...register("subtype")}>
									<option value="">Sin subtipo</option>
									<option value="alta_tension">Alta tensión</option>
									<option value="baja_tension">Baja tensión</option>
									<option value="instrumentation">Instrumentación</option>
								</Select>
							</FormField>
						) : (
							<FormField label="Subtipo" error={errors.subtype?.message}>
								<TextField id="maintenance-kit-subtype" {...register("subtype")} />
							</FormField>
						)}
						<FormField
							label="Clasificación"
							required
							error={errors.maintenanceClassification?.message}
						>
							<Select
								id="maintenance-kit-classification"
								{...register("maintenanceClassification")}
							>
								{MAINTENANCE_CLASSIFICATION_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
						</FormField>
						<FormField
							label="Duración estimada total (h)"
							required
							error={errors.estimatedHours?.message}
						>
							<TextField
								id="maintenance-kit-estimated-hours"
								type="number"
								min={0.25}
								step={0.25}
								{...register("estimatedHours", { valueAsNumber: true })}
							/>
						</FormField>
						<div className="lg:col-span-2">
							<FormField
								label="Descripción del trabajo"
								required
								error={errors.description?.message}
							>
								<TextArea id="maintenance-kit-description" rows={4} {...register("description")} />
							</FormField>
						</div>
						{mode === "edit" ? <Checkbox label="Kit activo" {...register("isActive")} /> : null}
					</div>
				</Section>

				<Section title="Seguridad y HES">
					<div className="grid gap-5 lg:grid-cols-2">
						<FormField
							label="Clasificación de riesgo"
							required
							error={errors.safety?.riskClassification?.message}
						>
							<Select id="maintenance-kit-risk" {...register("safety.riskClassification")}>
								{KIT_RISK_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</Select>
						</FormField>
						<div className="pt-8">
							<Checkbox label="Requiere aislamiento LOTO" {...register("safety.requiresLoto")} />
						</div>
						<div>
							<p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
								EPP mínimo
							</p>
							<div className="grid gap-2 sm:grid-cols-2">
								{KIT_PPE_OPTIONS.map((option) => (
									<Checkbox
										key={option.value}
										label={option.label}
										value={option.value}
										{...register("safety.minimumPpe")}
									/>
								))}
							</div>
						</div>
						<div>
							<p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
								Permisos especiales
							</p>
							<div className="grid gap-2 sm:grid-cols-2">
								{KIT_PERMIT_OPTIONS.map((option) => (
									<Checkbox
										key={option.value}
										label={option.label}
										value={option.value}
										{...register("safety.requiredPermits")}
									/>
								))}
							</div>
						</div>
						<div>
							<p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
								Riesgos específicos
							</p>
							<div className="grid gap-2 sm:grid-cols-2">
								{KIT_SPECIFIC_RISK_OPTIONS.map((option) => (
									<Checkbox
										key={option.value}
										label={option.label}
										value={option.value}
										{...register("safety.specificRisks")}
									/>
								))}
							</div>
						</div>
						<FormField
							label="Observaciones de seguridad"
							error={errors.safety?.safetyObservations?.message}
						>
							<TextArea
								id="maintenance-kit-safety-notes"
								rows={5}
								{...register("safety.safetyObservations")}
							/>
						</FormField>
					</div>
				</Section>

				<Section title="Procedimiento / pasos">
					<SortableContext items={procedureStepIds} strategy={verticalListSortingStrategy}>
						<div className="space-y-4">
							{procedureFields.fields.map((field, index) => {
								const stepType = procedureSteps[index]?.type;
								return (
									<ProcedureStepCard key={field.id} id={field.id} index={index}>
										<div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr_auto]">
											<FormField
												label="Descripción"
												required
												error={errors.procedureSteps?.[index]?.description?.message}
											>
												<TextField {...register(`procedureSteps.${index}.description` as const)} />
											</FormField>
											<FormField
												label="Tipo"
												required
												error={errors.procedureSteps?.[index]?.type?.message}
											>
												<Select {...register(`procedureSteps.${index}.type` as const)}>
													{JOB_STEP_TYPE_OPTIONS.map((option) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													))}
												</Select>
											</FormField>
											<FormField
												label="Minutos"
												error={errors.procedureSteps?.[index]?.estimatedMinutes?.message}
											>
												<TextField
													type="number"
													min={0}
													step={1}
													{...register(`procedureSteps.${index}.estimatedMinutes` as const, {
														valueAsNumber: true,
													})}
												/>
											</FormField>
											<button
												type="button"
												onClick={() => procedureFields.remove(index)}
												disabled={procedureFields.fields.length === 1}
												className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-slate-200 px-3 text-sm text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
											>
												<Trash2 className="h-4 w-4" />
												Quitar
											</button>
											{stepType === "measurement" ? (
												<FormField
													label="Valor esperado / rango"
													required
													error={errors.procedureSteps?.[index]?.expectedValue?.message}
												>
													<TextField
														{...register(`procedureSteps.${index}.expectedValue` as const)}
													/>
												</FormField>
											) : null}
											<div className="pt-8">
												<Checkbox
													label="Paso obligatorio"
													{...register(`procedureSteps.${index}.required` as const)}
												/>
											</div>
										</div>
									</ProcedureStepCard>
								);
							})}
						</div>
					</SortableContext>
					<button
						type="button"
						onClick={() =>
							procedureFields.append({
								...DEFAULT_PROCEDURE_STEP_ROW,
								order: procedureFields.fields.length + 1,
							})
						}
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
					>
						<Plus className="h-4 w-4" />
						Añadir paso
					</button>
				</Section>

				<Section title="Herramientas y equipos">
					<div className="space-y-6">
						<div className="space-y-3">
							<div className="flex justify-between gap-3">
								<h3 className="font-semibold text-slate-800 dark:text-slate-100">Herramientas</h3>
								<button
									type="button"
									onClick={() => toolFields.append({ ...DEFAULT_TOOL_ROW })}
									className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300"
								>
									<Plus className="h-4 w-4" />
									Añadir
								</button>
							</div>
							{toolFields.fields.map((field, index) => (
								<div
									key={field.id}
									className="grid gap-3 rounded-[var(--radius-lg)] border border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[1fr_120px_1fr_auto]"
								>
									<FormField label="Nombre" required error={errors.tools?.[index]?.name?.message}>
										<TextField {...register(`tools.${index}.name` as const)} />
									</FormField>
									<FormField
										label="Cantidad"
										required
										error={errors.tools?.[index]?.quantity?.message}
									>
										<TextField
											type="number"
											min={1}
											step={1}
											{...register(`tools.${index}.quantity` as const, { valueAsNumber: true })}
										/>
									</FormField>
									<FormField
										label="Especificaciones"
										error={errors.tools?.[index]?.specifications?.message}
									>
										<TextField {...register(`tools.${index}.specifications` as const)} />
									</FormField>
									<button
										type="button"
										onClick={() => toolFields.remove(index)}
										disabled={toolFields.fields.length === 1}
										className="mt-7 inline-flex h-11 items-center rounded-[var(--radius-lg)] border border-slate-200 px-3 text-sm disabled:opacity-40 dark:border-slate-700"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>

						<div className="space-y-3">
							<div className="flex justify-between gap-3">
								<h3 className="font-semibold text-slate-800 dark:text-slate-100">Equipos</h3>
								<button
									type="button"
									onClick={() => equipmentFields.append({ ...DEFAULT_EQUIPMENT_ROW })}
									className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300"
								>
									<Plus className="h-4 w-4" />
									Añadir
								</button>
							</div>
							{equipmentFields.fields.map((field, index) => (
								<div
									key={field.id}
									className="grid gap-3 rounded-[var(--radius-lg)] border border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[1fr_120px_1fr_auto]"
								>
									<FormField
										label="Nombre"
										required
										error={errors.equipment?.[index]?.name?.message}
									>
										<TextField {...register(`equipment.${index}.name` as const)} />
									</FormField>
									<FormField
										label="Cantidad"
										required
										error={errors.equipment?.[index]?.quantity?.message}
									>
										<TextField
											type="number"
											min={1}
											step={1}
											{...register(`equipment.${index}.quantity` as const, { valueAsNumber: true })}
										/>
									</FormField>
									<div className="pt-8">
										<Checkbox
											label="Requiere certificación"
											{...register(`equipment.${index}.certificateRequired` as const)}
										/>
									</div>
									<button
										type="button"
										onClick={() => equipmentFields.remove(index)}
										className="mt-7 inline-flex h-11 items-center rounded-[var(--radius-lg)] border border-slate-200 px-3 text-sm dark:border-slate-700"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							))}
						</div>
					</div>
				</Section>

				<Section title="Materiales y consumibles">
					<div className="space-y-4">
						{materialFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="grid gap-3 rounded-[var(--radius-lg)] border border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[1fr_0.7fr_120px_140px_150px_auto]"
							>
								<FormField
									label="Material"
									required
									error={errors.materials?.[index]?.name?.message}
								>
									<TextField {...register(`materials.${index}.name` as const)} />
								</FormField>
								<FormField label="SKU" error={errors.materials?.[index]?.sku?.message}>
									<TextField {...register(`materials.${index}.sku` as const)} />
								</FormField>
								<FormField
									label="Cantidad"
									required
									error={errors.materials?.[index]?.estimatedQuantity?.message}
								>
									<TextField
										type="number"
										min={0.01}
										step={0.01}
										{...register(`materials.${index}.estimatedQuantity` as const, {
											valueAsNumber: true,
										})}
									/>
								</FormField>
								<FormField label="Unidad" required error={errors.materials?.[index]?.unit?.message}>
									<Select {...register(`materials.${index}.unit` as const)}>
										{MATERIAL_UNIT_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</Select>
								</FormField>
								<FormField
									label="Costo unit. COP"
									error={errors.materials?.[index]?.estimatedUnitCost?.message}
								>
									<TextField
										type="number"
										min={0}
										step={100}
										{...register(`materials.${index}.estimatedUnitCost` as const, {
											valueAsNumber: true,
										})}
									/>
								</FormField>
								<button
									type="button"
									onClick={() => materialFields.remove(index)}
									className="mt-7 inline-flex h-11 items-center rounded-[var(--radius-lg)] border border-slate-200 px-3 text-sm dark:border-slate-700"
								>
									<Trash2 className="h-4 w-4" />
								</button>
								<div className="lg:col-span-6">
									<Checkbox
										label="Repuesto crítico"
										{...register(`materials.${index}.critical` as const)}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<button
							type="button"
							onClick={() => materialFields.append({ ...DEFAULT_MATERIAL_ROW })}
							className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
						>
							<Plus className="h-4 w-4" />
							Añadir material
						</button>
						<p className="rounded-[var(--radius-lg)] bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
							Costo base estimado:{" "}
							{baseMaterialCost.toLocaleString("es-CO", {
								style: "currency",
								currency: "COP",
								maximumFractionDigits: 0,
							})}
						</p>
					</div>
				</Section>

				<Section title="Checklists y competencias">
					<div className="space-y-5">
						{checklistFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="grid gap-3 rounded-[var(--radius-lg)] border border-slate-200 p-4 dark:border-slate-800 lg:grid-cols-[1fr_220px_160px_auto]"
							>
								<FormField
									label="Template ID"
									error={errors.linkedChecklists?.[index]?.templateId?.message}
								>
									<TextField {...register(`linkedChecklists.${index}.templateId` as const)} />
								</FormField>
								<FormField
									label="Momento"
									error={errors.linkedChecklists?.[index]?.timing?.message}
								>
									<Select {...register(`linkedChecklists.${index}.timing` as const)}>
										{CHECKLIST_TIMING_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</Select>
								</FormField>
								<div className="pt-8">
									<Checkbox
										label="Bloqueante"
										{...register(`linkedChecklists.${index}.blocking` as const)}
									/>
								</div>
								<button
									type="button"
									onClick={() => checklistFields.remove(index)}
									className="mt-7 inline-flex h-11 items-center rounded-[var(--radius-lg)] border border-slate-200 px-3 text-sm dark:border-slate-700"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
						<button
							type="button"
							onClick={() => checklistFields.append({ ...DEFAULT_LINKED_CHECKLIST_ROW })}
							className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
						>
							<Plus className="h-4 w-4" />
							Vincular checklist
						</button>

						<div className="grid gap-4 lg:grid-cols-3">
							<FormField
								label="Especialidad requerida"
								error={errors.assignmentRules?.requiredSpecialty?.message}
							>
								<Select {...register("assignmentRules.requiredSpecialty")}>
									{REQUIRED_SPECIALTY_OPTIONS.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
							</FormField>
							<FormField
								label="Certificaciones obligatorias"
								error={errors.assignmentRules?.requiredCertifications?.message}
							>
								<TextField
									placeholder="Alturas, RETIE, PESV"
									{...register("assignmentRules.requiredCertifications.0")}
								/>
							</FormField>
							<FormField
								label="Mínimo de personas"
								error={errors.assignmentRules?.minimumPeople?.message}
							>
								<TextField
									type="number"
									min={1}
									step={1}
									{...register("assignmentRules.minimumPeople", { valueAsNumber: true })}
								/>
							</FormField>
							<Checkbox
								label="Requiere supervisor en sitio"
								{...register("assignmentRules.requiresOnSiteSupervisor")}
							/>
						</div>
					</div>
				</Section>

				<Section title="Auditoría">
					<div className="grid gap-5 lg:grid-cols-2">
						<FormField label="Próxima revisión programada" error={errors.nextReviewAt?.message}>
							<TextField type="datetime-local" {...register("nextReviewAt")} />
						</FormField>
						<FormField label="Notas internas" error={errors.internalNotes?.message}>
							<TextArea rows={3} {...register("internalNotes")} />
						</FormField>
						{mode === "edit" ? (
							<div className="lg:col-span-2">
								<FormField label="Razón del cambio" required error={errors.changeReason?.message}>
									<TextArea rows={3} {...register("changeReason")} />
								</FormField>
							</div>
						) : null}
					</div>
				</Section>

				<footer className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
					<Link
						href={cancelHref}
						className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						Cancelar
					</Link>
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(15,23,42,0.24)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
					>
						{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
						{submitLabel}
					</button>
				</footer>
			</form>
		</DndContext>
	);
}
