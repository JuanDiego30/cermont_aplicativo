"use client";

/**
 * SectionedFormRenderer
 *
 * A section-aware form renderer for CERMONT real operational forms.
 * Handles the custom field types: conformity (C/NC/NA) and photo uploads.
 *
 * Used for:
 *  - Planeación de obra
 *  - Inspección líneas de vida vertical
 *  - Mantenimiento preventivo CCTV
 */

import { Camera, ChevronDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type {
	CermontFieldType,
	CermontFormFieldDef,
	CermontFormSection,
} from "../templates/cermont-form-templates";

// ── Types ──────────────────────────────────────────────────────────────────

type FieldValue = string | boolean | File | null;
export type FormValues = Record<string, FieldValue>;

// ── ConformityInput ────────────────────────────────────────────────────────

const CONFORMITY_OPTIONS = [
	{
		value: "C",
		label: "C",
		title: "Conforme",
		color: "border-green-400 bg-success-bg text-brand-annotate hover:bg-success-bg",
	},
	{
		value: "NC",
		label: "NC",
		title: "No conforme",
		color: "border-red-400 bg-danger-bg text-brand-error hover:bg-danger-bg",
	},
	{
		value: "NA",
		label: "NA",
		title: "No aplica",
		color: "border-hairline bg-surface text-steel hover:bg-zinc-100",
	},
] as const satisfies ReadonlyArray<{
	value: string;
	label: string;
	title: string;
	color: string;
}>;

function ConformityInput({
	id,
	value,
	onChange,
	disabled,
	fieldLabel,
}: {
	id: string;
	value: FieldValue;
	onChange: (v: string) => void;
	disabled?: boolean;
	fieldLabel?: string;
}) {
	return (
		<fieldset id={id} className="flex gap-2" aria-label={fieldLabel || "Conformidad"}>
			{CONFORMITY_OPTIONS.map((opt) => {
				const isSelected = value === opt.value;
				return (
					<button
						key={opt.value}
						type="button"
						disabled={disabled}
						title={opt.title}
						onClick={() => onChange(isSelected ? "" : opt.value)}
						aria-pressed={isSelected}
						aria-label={`${fieldLabel ? `${fieldLabel} — ` : ""}${opt.title} (${opt.label})`}
						className={`w-14 rounded-[var(--radius-md)] border-2 py-1.5 text-xs font-bold transition-all ${
							isSelected
								? `${opt.color} ring-2 ring-offset-1 ring-current`
								: "border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-[var(--text-muted)] hover:border-[var(--border-medium)]"
						} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						{opt.label}
					</button>
				);
			})}
		</fieldset>
	);
}

// ── PhotoInput ─────────────────────────────────────────────────────────────

function PhotoInput({
	id,
	onChange,
	disabled,
	hint,
}: {
	id: string;
	onChange: (v: File | null) => void;
	disabled?: boolean;
	hint?: string;
}) {
	const ref = useRef<HTMLInputElement>(null);
	const [preview, setPreview] = useState<string | null>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0] ?? null;
		onChange(file);
		if (preview) {
			URL.revokeObjectURL(preview);
		}
		setPreview(file ? URL.createObjectURL(file) : null);
	}

	return (
		<div className="flex items-start gap-3">
			<div className="flex-1">
				<input
					ref={ref}
					id={id}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					disabled={disabled}
					onChange={handleChange}
					aria-label="Seleccionar archivo de imagen"
					className="block w-full text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-[var(--color-brand)] file:bg-[var(--color-brand-blue-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--color-brand)] hover:file:border-[var(--color-brand-hover)]"
				/>
				{hint && <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{hint}</p>}
			</div>
			{preview ? (
				<div className="relative shrink-0">
					{/* unoptimized: blob URL preview — next/image does not support blob: protocol otherwise */}
					<Image
						src={preview}
						alt="Vista previa"
						width={64}
						height={64}
						unoptimized
						className="size-16 rounded-[var(--radius-md)] object-cover ring-1 ring-[var(--border-subtle)]"
					/>
					<button
						type="button"
						onClick={() => {
							onChange(null);
							URL.revokeObjectURL(preview);
							setPreview(null);
							if (ref.current) {
								ref.current.value = "";
							}
						}}
						aria-label="Quitar foto"
						className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white shadow"
					>
						×
					</button>
				</div>
			) : (
				<div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)]">
					<Camera className="size-5 text-[var(--text-muted)]" aria-hidden="true" />
				</div>
			)}
		</div>
	);
}

// ── FieldRenderer ──────────────────────────────────────────────────────────

function FieldRenderer({
	field,
	value,
	error,
	onChange,
	disabled,
}: {
	field: CermontFormFieldDef;
	value: FieldValue;
	error?: string;
	onChange: (v: FieldValue) => void;
	disabled?: boolean;
}) {
	const id = `f-${field.key}`;

	const inputClass =
		"h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 disabled:bg-[var(--surface-secondary)] disabled:opacity-60";
	const textareaClass =
		"w-full rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30 disabled:opacity-60";

	const fieldAriaLabel = field.label ? String(field.label) : undefined;

	function renderInput() {
		switch (field.type as CermontFieldType) {
			case "text":
				return (
					<input
						id={id}
						type="text"
						value={(value as string) ?? ""}
						placeholder={field.placeholder}
						disabled={disabled}
						onChange={(e) => onChange(e.target.value)}
						className={inputClass}
						aria-label={fieldAriaLabel}
					/>
				);

			case "number":
				return (
					<input
						id={id}
						type="number"
						value={(value as string) ?? ""}
						placeholder={field.placeholder}
						disabled={disabled}
						min={0}
						onChange={(e) => onChange(e.target.value)}
						className={inputClass}
						aria-label={fieldAriaLabel}
					/>
				);

			case "date":
				return (
					<input
						id={id}
						type="date"
						value={(value as string) ?? ""}
						disabled={disabled}
						onChange={(e) => onChange(e.target.value)}
						className={inputClass}
						aria-label={fieldAriaLabel}
					/>
				);

			case "textarea":
				return (
					<textarea
						id={id}
						value={(value as string) ?? ""}
						placeholder={field.placeholder}
						disabled={disabled}
						rows={3}
						onChange={(e) => onChange(e.target.value)}
						className={textareaClass}
						aria-label={fieldAriaLabel}
					/>
				);

			case "select":
				return (
					<select
						id={id}
						value={(value as string) ?? ""}
						disabled={disabled}
						onChange={(e) => onChange(e.target.value)}
						className={inputClass}
						aria-label={fieldAriaLabel}
					>
						<option value="">Seleccionar...</option>
						{field.options?.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				);

			case "checkbox":
				return (
					<label className="flex cursor-pointer items-center gap-2.5">
						<input
							id={id}
							type="checkbox"
							checked={(value as boolean) ?? false}
							disabled={disabled}
							onChange={(e) => onChange(e.target.checked)}
							className="size-4 rounded border-[var(--border-subtle)] accent-[var(--color-brand)]"
							aria-label={fieldAriaLabel}
						/>
						<span className="text-sm text-[var(--text-primary)]">{field.label}</span>
					</label>
				);

			case "conformity":
				return (
					<ConformityInput
						id={id}
						value={value}
						onChange={onChange}
						disabled={disabled}
						fieldLabel={fieldAriaLabel}
					/>
				);

			case "photo":
				return <PhotoInput id={id} onChange={onChange} disabled={disabled} hint={field.hint} />;

			case "signature":
				return (
					<div className="flex h-20 w-full items-center justify-center rounded-[var(--radius-md)] border-2 border-dashed border-[var(--border-subtle)] bg-[var(--surface-secondary)] text-xs text-[var(--text-muted)]">
						Firma digital (próxima versión)
					</div>
				);

			default:
				return (
					<input
						id={id}
						type="text"
						value={(value as string) ?? ""}
						placeholder={field.placeholder}
						disabled={disabled}
						onChange={(e) => onChange(e.target.value)}
						className={inputClass}
						aria-label={fieldAriaLabel}
					/>
				);
		}
	}

	// Hoisted: renderInput es factory de JSX (ReactNode), no componente — no remonta
	const input = renderInput();

	// Checkbox renders its own label
	if (field.type === "checkbox") {
		return (
			<div className={`${field.span === 2 ? "sm:col-span-2" : ""}`}>
				{input}
				{error && <p className="mt-1 text-xs text-brand-error">{error}</p>}
			</div>
		);
	}

	return (
		<div className={`space-y-1.5 ${field.span === 2 ? "sm:col-span-2" : ""}`}>
			<label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
				{field.label}
				{field.required && <span className="ml-1 text-brand-error">*</span>}
			</label>
			{input}
			{field.hint && field.type !== "photo" && (
				<p className="text-[10px] text-[var(--text-muted)]">{field.hint}</p>
			)}
			{error && <p className="mt-0.5 text-xs text-brand-error">{error}</p>}
		</div>
	);
}

// ── SectionBlock ───────────────────────────────────────────────────────────

function SectionBlock({
	section,
	values,
	errors,
	onChange,
	disabled,
}: {
	section: CermontFormSection;
	values: FormValues;
	errors: Record<string, string>;
	onChange: (key: string, value: FieldValue) => void;
	disabled?: boolean;
}) {
	const [collapsed, setCollapsed] = useState(false);

	return (
		<div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-card">
			<button
				type="button"
				onClick={() => setCollapsed((c) => !c)}
				className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[var(--surface-secondary)]"
			>
				<div>
					<p className="text-sm font-bold text-[var(--text-primary)]">{section.title}</p>
					{section.description && !collapsed && (
						<p className="mt-0.5 text-xs text-[var(--text-muted)]">{section.description}</p>
					)}
				</div>
				{collapsed ? (
					<ChevronRight className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
				) : (
					<ChevronDown className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
				)}
			</button>

			{!collapsed && (
				<div className="border-t border-[var(--border-subtle)] px-5 py-4">
					<div className="grid gap-4 sm:grid-cols-2">
						{section.fields.map((field) => (
							<FieldRenderer
								key={field.key}
								field={field}
								value={values[field.key] ?? ""}
								error={errors[field.key]}
								onChange={(v) => onChange(field.key, v)}
								disabled={disabled}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// ── Main component ─────────────────────────────────────────────────────────

interface SectionedFormRendererProps {
	/** Template sections to render */
	sections: CermontFormSection[];
	/** Optional initial values */
	initialValues?: FormValues;
	/** Called when form is submitted with valid data */
	onSubmit: (values: FormValues) => void | Promise<void>;
	isSubmitting?: boolean;
	readonly?: boolean;
	submitLabel?: string;
}

export function SectionedFormRenderer({
	sections,
	initialValues = {},
	onSubmit,
	isSubmitting = false,
	readonly = false,
	submitLabel = "Guardar formulario",
}: SectionedFormRendererProps) {
	const [values, setValues] = useState<FormValues>(initialValues);
	const [errors, setErrors] = useState<Record<string, string>>({});

	function handleFieldChange(key: string, value: FieldValue) {
		setValues((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const newErrors: Record<string, string> = {};
		for (const section of sections) {
			for (const field of section.fields) {
				if (field.required) {
					const val = values[field.key];
					if (val === undefined || val === null || val === "" || val === false) {
						newErrors[field.key] = `${field.label} es requerido`;
					}
				}
			}
		}

		setErrors(newErrors);
		if (Object.keys(newErrors).length === 0) {
			void onSubmit(values);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4" noValidate>
			{sections.map((section) => (
				<SectionBlock
					key={section.id}
					section={section}
					values={values}
					errors={errors}
					onChange={handleFieldChange}
					disabled={readonly || isSubmitting}
				/>
			))}

			{!readonly && (
				<div className="flex justify-end border-t border-[var(--border-subtle)] pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? "Guardando…" : submitLabel}
					</button>
				</div>
			)}
		</form>
	);
}
