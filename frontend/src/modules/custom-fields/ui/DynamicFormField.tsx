"use client";

import { useId } from "react";

export interface DynamicFieldDefinition {
	name: string;
	label: string;
	description?: string;
	dataType: "text" | "number" | "boolean" | "select" | "date";
	options?: string[];
	validation?: {
		required?: boolean;
		min?: number;
		max?: number;
		pattern?: string;
		errorMessage?: string;
	};
	order?: number;
}

interface DynamicFormFieldProps {
	field: DynamicFieldDefinition;
	value: string | number | boolean | undefined;
	onChange: (name: string, value: string | number | boolean) => void;
	error?: string;
}

/**
 * DynamicFormField — Renderiza el control de formulario correcto según
 * el dataType del campo personalizado (text, number, boolean, select, date).
 */
export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
	const fieldId = useId();
	const hasError = Boolean(error);

	const baseClasses =
		"w-full rounded-[var(--radius-lg)] border bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-[var(--shadow-1)] transition-colors placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:ring-offset-1";
	const errorClasses = hasError
		? "border-[var(--color-danger)]"
		: "border-[var(--border-default)] hover:border-[var(--color-brand-blue)]";

	if (field.dataType === "boolean") {
		return (
			<div className="space-y-1">
				<div className="flex items-center gap-3">
					<input
						id={fieldId}
						type="checkbox"
						checked={Boolean(value)}
						onChange={(e) => onChange(field.name, e.target.checked)}
						className="size-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-2 focus:ring-[var(--color-focus-ring)]"
						aria-describedby={field.description ? `${fieldId}-desc` : undefined}
						aria-invalid={hasError}
					/>
					<label htmlFor={fieldId} className="text-sm font-medium text-[var(--text-primary)]">
						{field.label}
						{field.validation?.required && (
							<span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
								*
							</span>
						)}
					</label>
				</div>
				{field.description && (
					<p id={`${fieldId}-desc`} className="text-xs text-[var(--text-tertiary)]">
						{field.description}
					</p>
				)}
				{hasError && (
					<p className="text-xs text-[var(--color-danger)]" role="alert">
						{error}
					</p>
				)}
			</div>
		);
	}

	if (field.dataType === "select") {
		return (
			<div className="space-y-1">
				<label htmlFor={fieldId} className="text-sm font-medium text-[var(--text-primary)]">
					{field.label}
					{field.validation?.required && (
						<span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
							*
						</span>
					)}
				</label>
				{field.description && (
					<p id={`${fieldId}-desc`} className="text-xs text-[var(--text-tertiary)]">
						{field.description}
					</p>
				)}
				<select
					id={fieldId}
					value={String(value ?? "")}
					onChange={(e) => onChange(field.name, e.target.value)}
					className={`${baseClasses} ${errorClasses}`}
					aria-describedby={field.description ? `${fieldId}-desc` : undefined}
					aria-invalid={hasError}
				>
					<option value="">Seleccionar...</option>
					{field.options?.map((opt) => (
						<option key={opt} value={opt}>
							{opt}
						</option>
					))}
				</select>
				{hasError && (
					<p className="text-xs text-[var(--color-danger)]" role="alert">
						{error}
					</p>
				)}
			</div>
		);
	}

	if (field.dataType === "date") {
		return (
			<div className="space-y-1">
				<label htmlFor={fieldId} className="text-sm font-medium text-[var(--text-primary)]">
					{field.label}
					{field.validation?.required && (
						<span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
							*
						</span>
					)}
				</label>
				{field.description && (
					<p id={`${fieldId}-desc`} className="text-xs text-[var(--text-tertiary)]">
						{field.description}
					</p>
				)}
				<input
					id={fieldId}
					type="date"
					value={String(value ?? "")}
					onChange={(e) => onChange(field.name, e.target.value)}
					className={`${baseClasses} ${errorClasses}`}
					aria-describedby={field.description ? `${fieldId}-desc` : undefined}
					aria-invalid={hasError}
				/>
				{hasError && (
					<p className="text-xs text-[var(--color-danger)]" role="alert">
						{error}
					</p>
				)}
			</div>
		);
	}

	// Default: text or number
	const inputType = field.dataType === "number" ? "number" : "text";
	const inputMode = field.dataType === "number" ? "numeric" : "text";

	return (
		<div className="space-y-1">
			<label htmlFor={fieldId} className="text-sm font-medium text-[var(--text-primary)]">
				{field.label}
				{field.validation?.required && (
					<span className="ml-0.5 text-[var(--color-danger)]" aria-hidden="true">
						*
					</span>
				)}
			</label>
			{field.description && (
				<p id={`${fieldId}-desc`} className="text-xs text-[var(--text-tertiary)]">
					{field.description}
				</p>
			)}
			<input
				id={fieldId}
				type={inputType}
				inputMode={inputMode}
				value={String(value ?? "")}
				onChange={(e) =>
					onChange(
						field.name,
						field.dataType === "number" ? Number(e.target.value) : e.target.value,
					)
				}
				placeholder={field.label}
				min={field.validation?.min}
				max={field.validation?.max}
				pattern={field.validation?.pattern}
				className={`${baseClasses} ${errorClasses}`}
				aria-describedby={field.description ? `${fieldId}-desc` : undefined}
				aria-invalid={hasError}
			/>
			{hasError && (
				<p className="text-xs text-[var(--color-danger)]" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
