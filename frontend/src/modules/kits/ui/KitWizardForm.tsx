"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, Select, TextField } from "@/core/ui/FormField";

const kitWizardSchema = z.object({
	name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(200),
	description: z.string().max(2000).optional(),
	activityType: z.string().min(1, "Selecciona una actividad"),
	riskLevel: z.string().optional(),
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

type KitWizardValues = z.infer<typeof kitWizardSchema>;

const DEFAULT_TOOL = { name: "", quantity: 1, unit: "unidad", isCritical: false, description: "" };
const DEFAULT_MATERIAL = { name: "", quantity: 1, unit: "unidad", isCritical: false };
const DEFAULT_EPP = { name: "", quantity: 1, unit: "unidad", isCritical: true };

interface KitWizardFormProps {
	onSubmit: (payload: Record<string, unknown>) => Promise<void>;
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

	const form = useForm<KitWizardValues>({
		resolver: zodResolver(kitWizardSchema) as never,
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

	const submitHandler: SubmitHandler<KitWizardValues> = async (values) => {
		await onSubmit(values as unknown as Record<string, unknown>);
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
								className="w-full rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]/20 resize-y min-h-[80px]"
							/>
						</FormField>
					</div>
				</section>
			)}

			{/* Tools Section */}
			{activeSection === "tools" && (
				<section className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Herramientas</h2>
							<p className="text-sm text-[var(--text-secondary)]">
								Agrega las herramientas requeridas para la actividad.
							</p>
						</div>
						<button
							type="button"
							onClick={() => toolFields.append({ ...DEFAULT_TOOL })}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-cermont-blue-bg)]"
						>
							<Plus className="size-4" />
							Añadir herramienta
						</button>
					</div>

					{toolFields.fields.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-medium)] px-4 py-6 text-sm text-[var(--text-tertiary)]">
							No hay herramientas. Agrega al menos una.
						</p>
					) : (
						<div className="space-y-4">
							{toolFields.fields.map((field, index) => {
								const toolError = errors.tools?.[index];
								return (
									<article
										key={field.id}
										className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4"
									>
										<div className="grid gap-4 lg:grid-cols-[1.4fr_0.5fr_0.6fr_auto] lg:items-start">
											<FormField label="Nombre" required error={toolError?.name?.message}>
												<TextField
													id={`tool-name-${field.id}`}
													placeholder="Ej: Taladro percutor"
													error={Boolean(toolError?.name)}
													{...register(`tools.${index}.name` as const)}
												/>
											</FormField>

											<FormField label="Cantidad" required error={toolError?.quantity?.message}>
												<TextField
													id={`tool-qty-${field.id}`}
													type="number"
													min={1}
													error={Boolean(toolError?.quantity)}
													{...register(`tools.${index}.quantity` as const, { valueAsNumber: true })}
												/>
											</FormField>

											<FormField label="Unidad" required error={toolError?.unit?.message}>
												<TextField
													id={`tool-unit-${field.id}`}
													placeholder="unidad"
													{...register(`tools.${index}.unit` as const)}
												/>
											</FormField>

											<button
												type="button"
												onClick={() => toolFields.remove(index)}
												disabled={toolFields.fields.length === 1}
												className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-medium)] px-3 text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)] disabled:cursor-not-allowed disabled:opacity-40"
											>
												<Trash2 className="size-4" />
												Quitar
											</button>
										</div>
									</article>
								);
							})}
						</div>
					)}
					{errors.tools ? (
						<p role="alert" className="text-sm text-[var(--color-danger)]">
							{errors.tools.message || "Verifica las herramientas del kit."}
						</p>
					) : null}
				</section>
			)}

			{/* Materials Section */}
			{activeSection === "materials" && (
				<section className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">Materiales</h2>
							<p className="text-sm text-[var(--text-secondary)]">
								Opcionalmente agrega materiales necesarios.
							</p>
						</div>
						<button
							type="button"
							onClick={() => materialFields.append({ ...DEFAULT_MATERIAL })}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-cermont-blue-bg)]"
						>
							<Plus className="size-4" />
							Añadir material
						</button>
					</div>

					{materialFields.fields.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-medium)] px-4 py-6 text-sm text-[var(--text-tertiary)]">
							No hay materiales. Puedes dejar esta sección vacía.
						</p>
					) : (
						<div className="space-y-4">
							{materialFields.fields.map((field, index) => (
								<article
									key={field.id}
									className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4"
								>
									<div className="grid gap-4 lg:grid-cols-[1.4fr_0.5fr_0.6fr_auto] lg:items-start">
										<FormField label="Nombre" required>
											<TextField
												id={`mat-name-${field.id}`}
												placeholder="Ej: Cable THHN #12"
												{...register(`materials.${index}.name` as const)}
											/>
										</FormField>
										<FormField label="Cantidad" required>
											<TextField
												id={`mat-qty-${field.id}`}
												type="number"
												min={1}
												{...register(`materials.${index}.quantity` as const, {
													valueAsNumber: true,
												})}
											/>
										</FormField>
										<FormField label="Unidad" required>
											<TextField
												id={`mat-unit-${field.id}`}
												placeholder="metro, kg"
												{...register(`materials.${index}.unit` as const)}
											/>
										</FormField>
										<button
											type="button"
											onClick={() => materialFields.remove(index)}
											className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-medium)] px-3 text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]"
										>
											<Trash2 className="size-4" />
											Quitar
										</button>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			)}

			{/* EPP Section */}
			{activeSection === "epp" && (
				<section className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-lg font-semibold text-[var(--text-primary)]">EPP y Seguridad</h2>
							<p className="text-sm text-[var(--text-secondary)]">
								Equipos de protección personal requeridos.
							</p>
						</div>
						<button
							type="button"
							onClick={() => eppFields.append({ ...DEFAULT_EPP })}
							className="inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-medium)] px-4 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-cermont-blue-bg)]"
						>
							<Plus className="size-4" />
							Añadir EPP
						</button>
					</div>

					{eppFields.fields.length === 0 ? (
						<p className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-medium)] px-4 py-6 text-sm text-[var(--text-tertiary)]">
							No hay EPP configurado. Puedes dejarlo vacío.
						</p>
					) : (
						<div className="space-y-4">
							{eppFields.fields.map((field, index) => (
								<article
									key={field.id}
									className="rounded-[var(--radius-md)] border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4"
								>
									<div className="grid gap-4 lg:grid-cols-[1.4fr_0.5fr_0.6fr_auto] lg:items-start">
										<FormField label="Nombre" required>
											<TextField
												id={`epp-name-${field.id}`}
												placeholder="Ej: Casco de seguridad"
												{...register(`epp.${index}.name` as const)}
											/>
										</FormField>
										<FormField label="Cantidad" required>
											<TextField
												id={`epp-qty-${field.id}`}
												type="number"
												min={1}
												{...register(`epp.${index}.quantity` as const, { valueAsNumber: true })}
											/>
										</FormField>
										<FormField label="Unidad" required>
											<TextField
												id={`epp-unit-${field.id}`}
												placeholder="unidad"
												{...register(`epp.${index}.unit` as const)}
											/>
										</FormField>
										<button
											type="button"
											onClick={() => eppFields.remove(index)}
											className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-medium)] px-3 text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger-bg)]"
										>
											<Trash2 className="size-4" />
											Quitar
										</button>
									</div>
								</article>
							))}
						</div>
					)}
				</section>
			)}

			{/* Footer */}
			<footer className="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
				<Link
					href="/maintenance"
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
