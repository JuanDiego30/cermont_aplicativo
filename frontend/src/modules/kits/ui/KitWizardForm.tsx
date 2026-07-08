"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateKitInput, KitItem } from "@cermont/shared-types";
import { KitActivityTypeEnum, KitRiskLevelEnum } from "@cermont/shared-types";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, Select, TextField } from "@/core/ui/FormField";
import { KitItemSection } from "@/modules/kits/ui/KitItemSection";

const kitWizardSchema = z.object({
	name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200),
	description: z.string().max(2000).optional(),
	activityType: KitActivityTypeEnum,
	riskLevel: KitRiskLevelEnum.optional(),
	estimatedDurationHours: z.coerce.number().min(0).optional(),

	tools: z
		.array(
			z.object({
				name: z.string().min(1, "Nombre requerido"),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1, "Unidad requerida"),
				isCritical: z.boolean().default(false),
				description: z.string().optional(),
			}),
		)
		.min(1, "Agrega al menos una herramienta"),

	materials: z
		.array(
			z.object({
				name: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1),
				isCritical: z.boolean().default(false),
			}),
		)
		.default([]),

	epp: z
		.array(
			z.object({
				name: z.string().min(1),
				quantity: z.coerce.number().int().min(1),
				unit: z.string().min(1),
				isCritical: z.boolean().default(true),
			}),
		)
		.default([]),
});

type KitWizardValues = z.output<typeof kitWizardSchema>;

const DEFAULT_TOOL = { name: "", quantity: 1, unit: "unidad", isCritical: false, description: "" };
const DEFAULT_MATERIAL = { name: "", quantity: 1, unit: "unidad", isCritical: false };
const DEFAULT_EPP = { name: "", quantity: 1, unit: "unidad", isCritical: true };

interface KitWizardFormProps {
	onSubmit: (payload: CreateKitInput) => Promise<void>;
	errorMessage?: string | null;
	activityOptions: ReadonlyArray<{ value: string; label: string }>;
}

const RISH_OPTIONS = [
	{ value: "low", label: "Bajo" },
	{ value: "medium", label: "Medio" },
	{ value: "high", label: "Alto" },
	{ value: "critical", label: "Crítico" },
];

const KIT_WIZARD_SECTIONS = [
	{ id: "general", label: "Información General" },
	{ id: "tools", label: "Herramientas" },
	{ id: "materials", label: "Materiales" },
	{ id: "epp", label: "EPP y Seguridad" },
];

export function KitWizardForm({ onSubmit, errorMessage, activityOptions }: KitWizardFormProps) {
	const [activeSection, setActiveSection] = useState<string>("general");

	const form = useForm({
		resolver: zodResolver(kitWizardSchema),
		defaultValues: {
			name: "",
			description: "",
			activityType: "electrico",
			riskLevel: "low",
			estimatedDurationHours: undefined,
			tools: [DEFAULT_TOOL],
			materials: [],
			epp: [],
		},
	});

	const {
		register,
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = form;
	const toolFields = useFieldArray({ control, name: "tools" });
	const materialFields = useFieldArray({ control, name: "materials" });
	const eppFields = useFieldArray({ control, name: "epp" });

	/** Adapter: form values → CreateKitInput. */
	function toCreateKitInput(values: KitWizardValues): CreateKitInput {
		function toKitItem(item: { name: string; quantity: number; unit: string; isCritical?: boolean; description?: string }, category: KitItem["category"]): KitItem {
			return {
				category,
				name: item.name,
				quantity: item.quantity,
				unit: item.unit,
				isCritical: item.isCritical ?? false,
				isOptional: false,
				description: item.description || undefined,
				requiresCertification: false,
				calibrationRequired: false,
			};
		}
		return {
			name: values.name,
			description: values.description || undefined,
			activityType: values.activityType,
			riskLevel: values.riskLevel ?? "low",
			estimatedDurationHours: values.estimatedDurationHours ?? undefined,
			status: "draft",
			isDefault: false,
			tags: [],
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

	const submitHandler: SubmitHandler<KitWizardValues> = async (values) => {
		await onSubmit(toCreateKitInput(values));
	};

	return (
		<form onSubmit={handleSubmit(submitHandler)} noValidate className="space-y-8">
			{/* Section tabs */}
			<nav
				className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-4"
				aria-label="Secciones del formulario"
			>
				{KIT_WIZARD_SECTIONS.map((s) => (
					<button
						key={s.id}
						type="button"
						onClick={() => setActiveSection(s.id)}
						className={`rounded-[var(--radius-full)] px-4 py-2 text-sm font-medium transition ${
							activeSection === s.id
								? "bg-[var(--color-brand)] text-white"
								: "border border-[var(--border-medium)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]"
						}`}
					>
						{s.label}
					</button>
				))}
			</nav>

			{errorMessage ? (
				<p
					role="alert"
					className="rounded-[var(--radius-md)] border border-[var(--color-danger-bg)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]"
				>
					{errorMessage}
				</p>
			) : null}

			{/* General Section */}
			{activeSection === "general" && (
				<section className="grid gap-5 lg:grid-cols-2">
					<FormField label="Nombre del kit" required error={errors.name?.message}>
						<TextField
							id="kit-name"
							autoComplete="off"
							placeholder="Kit para intervención eléctrica en campo"
							error={Boolean(errors.name)}
							{...register("name")}
						/>
					</FormField>

					<FormField label="Tipo de actividad" required error={errors.activityType?.message}>
						<Select
							id="kit-activity-type"
							error={Boolean(errors.activityType)}
							{...register("activityType")}
						>
							{activityOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Select>
					</FormField>

					<FormField label="Nivel de riesgo" error={errors.riskLevel?.message}>
						<Select id="kit-risk-level" {...register("riskLevel")}>
							{RISH_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</Select>
					</FormField>

					<FormField
						label="Duración estimada (horas)"
						error={errors.estimatedDurationHours?.message}
					>
						<TextField
							id="kit-duration"
							type="number"
							min={0}
							step={0.5}
							placeholder="Ej: 8"
							{...register("estimatedDurationHours")}
						/>
					</FormField>

					<div className="lg:col-span-2">
						<FormField label="Descripción" error={errors.description?.message}>
							<textarea
								{...register("description")}
								rows={3}
								placeholder="Describe el propósito del kit, condiciones de uso o notas relevantes…"
								className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]/20 resize-y min-h-[80px]"
							/>
						</FormField>
					</div>
				</section>
			)}

			{/* Tools Section */}
			{activeSection === "tools" && (
				<section className="space-y-4">
					<KitItemSection
						name="tools"
						label="Herramientas"
						description="Agrega las herramientas requeridas para la actividad."
						emptyMessage="No hay herramientas. Agrega al menos una."
						addButtonLabel="Añadir herramienta"
						fields={toolFields.fields}
						register={register}
						errors={errors}
						onAppend={() => toolFields.append({ ...DEFAULT_TOOL })}
						onRemove={(i) => toolFields.remove(i)}
						minItems={1}
						showDescription
					/>
				</section>
			)}

			{/* Materials Section */}
			{activeSection === "materials" && (
				<section className="space-y-4">
					<KitItemSection
						name="materials"
						label="Materiales"
						description="Opcionalmente agrega materiales necesarios."
						emptyMessage="No hay materiales. Puedes dejar esta sección vacía."
						addButtonLabel="Añadir material"
						fields={materialFields.fields}
						register={register}
						errors={errors}
						onAppend={() => materialFields.append({ ...DEFAULT_MATERIAL })}
						onRemove={(i) => materialFields.remove(i)}
					/>
				</section>
			)}

			{/* EPP Section */}
			{activeSection === "epp" && (
				<section className="space-y-4">
					<KitItemSection
						name="epp"
						label="EPP y Seguridad"
						description="Equipos de protección personal requeridos."
						emptyMessage="No hay EPP configurado. Puedes dejarlo vacío."
						addButtonLabel="Añadir EPP"
						fields={eppFields.fields}
						register={register}
						errors={errors}
						onAppend={() => eppFields.append({ ...DEFAULT_EPP })}
						onRemove={(i) => eppFields.remove(i)}
					/>
				</section>
			)}

			{/* Footer */}
			<footer className="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
				<Link
					href="/resources/kits"
					className="inline-flex items-center justify-center rounded-[var(--radius-full)] border border-[var(--border-medium)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-secondary)]"
				>
					Cancelar
				</Link>

				<div className="flex gap-3">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-full)] bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
						Crear kit
					</button>
				</div>
			</footer>
		</form>
	);
}
