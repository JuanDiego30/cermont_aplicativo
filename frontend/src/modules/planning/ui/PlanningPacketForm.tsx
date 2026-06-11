"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/core/ui/Button";
import { CustomizableSelect } from "@/core/ui/CustomizableSelect";
import { FormField, TextArea, TextField } from "@/core/ui/FormField";
import { KIT_ACTIVITY_OPTIONS } from "@/modules/kits/constants";
import { useSuggestKit } from "../queries";
import { PlanningKitSuggestionBanner } from "./PlanningKitSuggestionBanner";

// ─── Schema ───────────────────────────────────────────────────────────────

const planningResourceSchema = z.object({
	name: z.string().min(1, "Nombre requerido"),
	quantity: z.coerce.number().int().min(1, "Cantidad mínima 1"),
	unit: z.string().min(1, "Unidad requerida"),
	estimatedCost: z.coerce.number().min(0).optional(),
});

const planningPersonnelSchema = z.object({
	name: z.string().min(1, "Nombre requerido"),
	role: z.string().min(1, "Rol requerido"),
	dailyRate: z.coerce.number().min(0).optional(),
	daysEstimated: z.coerce.number().int().min(1).optional(),
});

const planningFormSchema = z.object({
	orderId: z.string().min(1, "Orden requerida"),
	scheduledStartDate: z.string().min(1, "Fecha inicio requerida"),
	scheduledEndDate: z.string().min(1, "Fecha fin requerida"),
	location: z.string().min(3, "Ubicación requerida (mín. 3 caracteres)"),
	activityType: z.string().optional(),
	tools: z.array(planningResourceSchema).default([]),
	equipment: z.array(planningResourceSchema).default([]),
	epp: z.array(planningResourceSchema).default([]),
	personnel: z.array(planningPersonnelSchema).default([]),
	notes: z.string().optional(),
	estimatedTotalCost: z.coerce.number().min(0).optional(),
});

type PlanningFormValues = z.infer<typeof planningFormSchema>;

// ─── Defaults ─────────────────────────────────────────────────────────────

const DEFAULT_RESOURCE = { name: "", quantity: 1, unit: "unidad" };
const DEFAULT_PERSONNEL = { name: "", role: "", dailyRate: 0, daysEstimated: 1 };

// ─── Props ────────────────────────────────────────────────────────────────

interface PlanningPacketFormProps {
	initialData?: Partial<PlanningFormValues>;
	orderId?: string;
	onSubmit: (payload: Record<string, unknown>) => Promise<void>;
	onSubmitAndSend?: (payload: Record<string, unknown>) => Promise<void>;
	isSubmitting?: boolean;
	errorMessage?: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────

export function PlanningPacketForm({
	initialData,
	orderId,
	onSubmit,
	onSubmitAndSend,
	isSubmitting: externalSubmitting,
	errorMessage,
}: PlanningPacketFormProps) {
	const [kitSuggestionDismissed, setKitSuggestionDismissed] = useState(false);
	const [kitApplied, setKitApplied] = useState(false);

	const {
		register,
		control,
		handleSubmit,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<PlanningFormValues>({
		resolver: zodResolver(planningFormSchema) as never,
		defaultValues: {
			orderId: orderId ?? initialData?.orderId ?? "",
			scheduledStartDate: initialData?.scheduledStartDate ?? "",
			scheduledEndDate: initialData?.scheduledEndDate ?? "",
			location: initialData?.location ?? "",
			activityType: initialData?.activityType ?? "",
			tools: initialData?.tools ?? [],
			equipment: initialData?.equipment ?? [],
			epp: initialData?.epp ?? [],
			personnel: initialData?.personnel ?? [],
			notes: initialData?.notes ?? "",
		},
	});

	const activityType = watch("activityType");
	const personnel = watch("personnel");

	const toolFields = useFieldArray({ control, name: "tools" });
	const equipmentFields = useFieldArray({ control, name: "equipment" });
	const eppFields = useFieldArray({ control, name: "epp" });
	const personnelFields = useFieldArray({ control, name: "personnel" });

	const { data: kitSuggestion, isLoading: kitLoading } = useSuggestKit(
		activityType && !kitSuggestionDismissed && !kitApplied ? activityType : undefined,
	);

	const totalLaborCost = useMemo(() => {
		return (personnel ?? []).reduce((sum, p) => {
			const rate = p.dailyRate ?? 0;
			const days = p.daysEstimated ?? 0;
			return sum + rate * days;
		}, 0);
	}, [personnel]);

	const handleApplyKit = () => {
		const suggestion = kitSuggestion?.suggestion;
		if (!suggestion) {
			return;
		}

		if (suggestion.tools.length > 0) {
			for (const t of suggestion.tools) {
				const exists = toolFields.fields?.some(
					(f) => (f as { name?: string }).name?.toLowerCase() === t.name.toLowerCase(),
				);
				if (!exists) {
					toolFields.append({ name: t.name, quantity: t.quantity, unit: "unidad" });
				}
			}
		}

		if (suggestion.equipment.length > 0) {
			for (const e of suggestion.equipment) {
				const exists = equipmentFields.fields?.some(
					(f) => (f as { name?: string }).name?.toLowerCase() === e.name.toLowerCase(),
				);
				if (!exists) {
					equipmentFields.append({
						name: e.name,
						quantity: e.quantity,
						unit: "unidad",
					});
				}
			}
		}

		setKitApplied(true);
		toast.success(`Kit "${suggestion.kitName}" aplicado. Puedes ajustar las cantidades.`);
	};

	const submitHandler: SubmitHandler<PlanningFormValues> = async (values) => {
		const payload = {
			...values,
			estimatedTotalCost: totalLaborCost > 0 ? totalLaborCost : undefined,
		};
		await onSubmit(payload as unknown as Record<string, unknown>);
	};

	const submitting = externalSubmitting ?? isSubmitting;

	return (
		<form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-6">
			{errorMessage ? (
				<p
					role="alert"
					className="rounded-[var(--radius-md)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
				>
					{errorMessage}
				</p>
			) : null}

			{/* ── Info section ────────────────────────────── */}
			<section className="grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm lg:grid-cols-2">
				<h3 className="col-span-full text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
					Información general
				</h3>

				<FormField label="Orden de trabajo" required error={errors.orderId?.message}>
					<TextField
						{...register("orderId")}
						placeholder="ID de la orden"
						disabled={!!orderId}
						error={Boolean(errors.orderId)}
					/>
				</FormField>

				<FormField label="Tipo de actividad" error={errors.activityType?.message}>
					<Controller
						name="activityType"
						control={control}
						render={({ field }) => (
							<CustomizableSelect
								options={KIT_ACTIVITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
								value={field.value ?? ""}
								onChange={(val) => field.onChange(val)}
								allowCustom={false}
								placeholder="Seleccionar actividad…"
							/>
						)}
					/>
				</FormField>

				<FormField label="Fecha inicio" required error={errors.scheduledStartDate?.message}>
					<TextField
						type="date"
						{...register("scheduledStartDate")}
						error={Boolean(errors.scheduledStartDate)}
					/>
				</FormField>

				<FormField label="Fecha fin" required error={errors.scheduledEndDate?.message}>
					<TextField
						type="date"
						{...register("scheduledEndDate")}
						error={Boolean(errors.scheduledEndDate)}
					/>
				</FormField>

				<div className="lg:col-span-2">
					<FormField label="Ubicación / Dirección" required error={errors.location?.message}>
						<TextField
							{...register("location")}
							placeholder="Ej: Planta industrial Zona Franca, bodega 7"
							error={Boolean(errors.location)}
						/>
					</FormField>
				</div>
			</section>

			{/* ── Kit suggestion banner ───────────────────── */}
			<PlanningKitSuggestionBanner
				activityType={activityType && !kitApplied ? activityType : undefined}
				isLoading={kitLoading}
				hasSuggestion={!!kitSuggestion?.suggestion}
				kitName={kitSuggestion?.suggestion?.kitName}
				onApply={handleApplyKit}
				onDismiss={() => setKitSuggestionDismissed(true)}
			/>

			{/* ── Tools ────────────────────────────────────── */}
			<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
							Herramientas
						</h3>
						<p className="text-xs text-[var(--text-secondary)]">
							Herramientas necesarias para la ejecución
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => toolFields.append({ ...DEFAULT_RESOURCE })}
					>
						<Plus className="size-3.5" />
						Añadir
					</Button>
				</div>

				{toolFields.fields.length === 0 ? (
					<p className="text-sm italic text-[var(--text-tertiary)]">
						No hay herramientas. Usa la sugerencia de kit o agrega manualmente.
					</p>
				) : (
					<div className="space-y-3">
						{toolFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-3"
							>
								<FormField
									label="Nombre"
									className="min-w-[160px] flex-1"
									error={
										(errors.tools as { [key: number]: { name?: string } } | undefined)?.[index]
											?.name
									}
								>
									<TextField {...register(`tools.${index}.name`)} placeholder="Ej: Taladro" />
								</FormField>
								<FormField label="Cant." className="w-20">
									<TextField
										type="number"
										min={1}
										{...register(`tools.${index}.quantity`, { valueAsNumber: true })}
									/>
								</FormField>
								<FormField label="Unidad" className="w-24">
									<TextField {...register(`tools.${index}.unit`)} placeholder="unidad" />
								</FormField>
								<button
									type="button"
									onClick={() => toolFields.remove(index)}
									className="mb-1 flex size-9 items-center justify-center rounded-md border border-[var(--border-medium)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
									aria-label="Eliminar herramienta"
								>
									<Trash2 className="size-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</section>

			{/* ── Equipment ──────────────────────────────────── */}
			<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
							Equipos
						</h3>
						<p className="text-xs text-[var(--text-secondary)]">Equipos requeridos (opcional)</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => equipmentFields.append({ ...DEFAULT_RESOURCE })}
					>
						<Plus className="size-3.5" />
						Añadir
					</Button>
				</div>

				{equipmentFields.fields.length === 0 ? (
					<p className="text-sm italic text-[var(--text-tertiary)]">
						Sin equipos. Puedes dejarlo vacío.
					</p>
				) : (
					<div className="space-y-3">
						{equipmentFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-3"
							>
								<FormField label="Nombre" className="min-w-[160px] flex-1">
									<TextField {...register(`equipment.${index}.name`)} placeholder="Ej: Generador" />
								</FormField>
								<FormField label="Cant." className="w-20">
									<TextField
										type="number"
										min={1}
										{...register(`equipment.${index}.quantity`, { valueAsNumber: true })}
									/>
								</FormField>
								<FormField label="Unidad" className="w-24">
									<TextField {...register(`equipment.${index}.unit`)} placeholder="unidad" />
								</FormField>
								<button
									type="button"
									onClick={() => equipmentFields.remove(index)}
									className="mb-1 flex size-9 items-center justify-center rounded-md border border-[var(--border-medium)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
									aria-label="Eliminar equipo"
								>
									<Trash2 className="size-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</section>

			{/* ── EPP ─────────────────────────────────────────── */}
			<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="flex items-center gap-2">
						<ShieldCheck className="size-4 text-[var(--color-brand)]" />
						<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
							EPP Requerido
						</h3>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => eppFields.append({ ...DEFAULT_RESOURCE })}
					>
						<Plus className="size-3.5" />
						Añadir
					</Button>
				</div>

				{eppFields.fields.length === 0 ? (
					<p className="text-sm italic text-[var(--text-tertiary)]">Sin EPP configurado.</p>
				) : (
					<div className="space-y-3">
						{eppFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-3"
							>
								<FormField label="Nombre" className="min-w-[160px] flex-1">
									<TextField
										{...register(`epp.${index}.name`)}
										placeholder="Ej: Casco de seguridad"
									/>
								</FormField>
								<FormField label="Cant." className="w-20">
									<TextField
										type="number"
										min={1}
										{...register(`epp.${index}.quantity`, { valueAsNumber: true })}
									/>
								</FormField>
								<FormField label="Unidad" className="w-24">
									<TextField {...register(`epp.${index}.unit`)} placeholder="unidad" />
								</FormField>
								<button
									type="button"
									onClick={() => eppFields.remove(index)}
									className="mb-1 flex size-9 items-center justify-center rounded-md border border-[var(--border-medium)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
									aria-label="Eliminar EPP"
								>
									<Trash2 className="size-4" />
								</button>
							</div>
						))}
					</div>
				)}
			</section>

			{/* ── Personnel ──────────────────────────────────── */}
			<section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
							Personal asignado
						</h3>
						<p className="text-xs text-[var(--text-secondary)]">
							Técnicos y profesionales para la ejecución
						</p>
					</div>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => personnelFields.append({ ...DEFAULT_PERSONNEL })}
					>
						<Plus className="size-3.5" />
						Añadir
					</Button>
				</div>

				{personnelFields.fields.length === 0 ? (
					<p className="text-sm italic text-[var(--text-tertiary)]">
						Sin personal asignado. Agrega al menos un responsable.
					</p>
				) : (
					<div className="space-y-3">
						{personnelFields.fields.map((field, index) => (
							<div
								key={field.id}
								className="flex flex-wrap items-end gap-3 rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)]/40 p-3"
							>
								<FormField label="Nombre" className="min-w-[140px] flex-1">
									<TextField
										{...register(`personnel.${index}.name`)}
										placeholder="Nombre del técnico"
									/>
								</FormField>
								<FormField label="Rol" className="min-w-[120px] flex-1">
									<TextField
										{...register(`personnel.${index}.role`)}
										placeholder="Ej: Electricista"
									/>
								</FormField>
								<FormField label="$/día" className="w-24">
									<TextField
										type="number"
										min={0}
										{...register(`personnel.${index}.dailyRate`, { valueAsNumber: true })}
										placeholder="0"
									/>
								</FormField>
								<FormField label="Días" className="w-20">
									<TextField
										type="number"
										min={1}
										{...register(`personnel.${index}.daysEstimated`, { valueAsNumber: true })}
									/>
								</FormField>
								<button
									type="button"
									onClick={() => personnelFields.remove(index)}
									className="mb-1 flex size-9 items-center justify-center rounded-md border border-[var(--border-medium)] text-[var(--text-tertiary)] transition-colors hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
									aria-label="Eliminar personal"
								>
									<Trash2 className="size-4" />
								</button>
							</div>
						))}
					</div>
				)}

				{totalLaborCost > 0 && (
					<div className="rounded-[var(--radius-md)] bg-[var(--color-brand)]/5 px-4 py-2 text-right text-sm font-medium text-[var(--text-primary)]">
						Total estimado mano de obra:{" "}
						<span className="text-[var(--color-brand)]">
							${totalLaborCost.toLocaleString("es-CO")}
						</span>
					</div>
				)}
			</section>

			{/* ── Notes ─────────────────────────────────────────── */}
			<section className="rounded-[var(--radius-lg)] border border-[var(--border-medium)] bg-[var(--surface-primary)] p-5 shadow-sm">
				<FormField label="Observaciones" error={errors.notes?.message}>
					<TextArea
						{...register("notes")}
						placeholder="Notas adicionales para la planeación…"
						rows={3}
					/>
				</FormField>
			</section>

			{/* ── Footer ─────────────────────────────────────────── */}
			<footer className="flex flex-col-reverse gap-3 border-t border-[var(--border-medium)] pt-5 sm:flex-row sm:justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={() => window.history.back()}
					disabled={submitting}
				>
					Cancelar
				</Button>
				<div className="flex gap-3">
					<Button type="submit" variant="default" disabled={submitting} loading={submitting}>
						{submitting ? "Guardando\u2026" : "Guardar borrador"}
					</Button>
					{onSubmitAndSend ? (
						<Button type="button" variant="primary" disabled={submitting} loading={submitting}>
							Enviar para aprobaci\u00f3n
						</Button>
					) : null}
				</div>
			</footer>
		</form>
	);
}
