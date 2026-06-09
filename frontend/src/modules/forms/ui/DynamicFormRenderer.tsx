"use client";

import type { DynamicFormField, DynamicFormTemplate } from "@cermont/shared-types";
import { type FormEvent, useCallback, useState } from "react";

interface DynamicFormRendererProps {
	template: DynamicFormTemplate;
	onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
	initialValues?: Record<string, unknown>;
	isSubmitting?: boolean;
	readonly?: boolean;
}

export function DynamicFormRenderer({
	template,
	onSubmit,
	initialValues = {},
	isSubmitting = false,
	readonly = false,
}: DynamicFormRendererProps) {
	const [values, setValues] = useState<Record<string, unknown>>(initialValues);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = useCallback(
		(e: FormEvent) => {
			e.preventDefault();
			const newErrors: Record<string, string> = {};
			for (const field of template.fields) {
				if (field.required && !values[field.key]) {
					newErrors[field.key] = `${field.label} es requerido`;
				}
				if (field.validation?.minLength && typeof values[field.key] === "string") {
					const strVal = values[field.key] as string;
					if (strVal.length < field.validation.minLength) {
						newErrors[field.key] = `Mínimo ${field.validation.minLength} caracteres`;
					}
				}
				if (field.validation?.maxLength && typeof values[field.key] === "string") {
					const strVal = values[field.key] as string;
					if (strVal.length > field.validation.maxLength) {
						newErrors[field.key] = `Máximo ${field.validation.maxLength} caracteres`;
					}
				}
				if (field.validation?.pattern && typeof values[field.key] === "string") {
					const strVal = values[field.key] as string;
					if (strVal && !new RegExp(field.validation.pattern).test(strVal)) {
						newErrors[field.key] = "Formato inválido";
					}
				}
			}
			setErrors(newErrors);
			if (Object.keys(newErrors).length === 0) {
				onSubmit(values);
			}
		},
		[template.fields, values, onSubmit],
	);

	const updateField = useCallback((key: string, value: unknown) => {
		setValues((prev) => ({ ...prev, [key]: value }));
		setErrors((prev) => {
			const next = { ...prev };
			delete next[key];
			return next;
		});
	}, []);

	const renderField = useCallback(
		(field: DynamicFormField) => {
			const commonProps = {
				id: `field-${field.key}`,
				disabled: readonly || isSubmitting,
				"aria-invalid": !!errors[field.key],
				"aria-describedby": errors[field.key] ? `error-${field.key}` : undefined,
			};

			switch (field.type) {
				case "text":
					return (
						<input
							{...commonProps}
							type="text"
							value={(values[field.key] as string) ?? field.defaultValue ?? ""}
							onChange={(e) => updateField(field.key, e.target.value)}
							placeholder={field.placeholder}
							className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					);

				case "number":
					return (
						<input
							{...commonProps}
							type="number"
							value={(values[field.key] as string) ?? field.defaultValue ?? ""}
							onChange={(e) => updateField(field.key, e.target.value ? Number(e.target.value) : "")}
							placeholder={field.placeholder}
							min={field.validation?.min}
							max={field.validation?.max}
							className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					);

				case "textarea":
					return (
						<textarea
							{...commonProps}
							value={(values[field.key] as string) ?? field.defaultValue ?? ""}
							onChange={(e) => updateField(field.key, e.target.value)}
							placeholder={field.placeholder}
							rows={4}
							className="w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm"
						/>
					);

				case "select":
					return (
						<select
							{...commonProps}
							value={(values[field.key] as string) ?? field.defaultValue ?? ""}
							onChange={(e) => updateField(field.key, e.target.value)}
							className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						>
							<option value="">{field.placeholder || "Seleccione..."}</option>
							{field.options?.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					);

				case "checkbox":
					return (
						<input
							{...commonProps}
							type="checkbox"
							checked={(values[field.key] as boolean) ?? field.defaultValue ?? false}
							onChange={(e) => updateField(field.key, e.target.checked)}
							className="size-4 rounded border-[var(--border-default)]"
						/>
					);

				case "date":
					return (
						<input
							{...commonProps}
							type="date"
							value={(values[field.key] as string) ?? field.defaultValue ?? ""}
							onChange={(e) => updateField(field.key, e.target.value)}
							className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					);

				case "file":
					return (
						<input
							{...commonProps}
							type="file"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									updateField(field.key, file);
								}
							}}
							className="text-sm text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--color-brand)] file:px-3 file:py-1.5 file:text-sm file:text-white"
						/>
					);

				case "gps":
					return (
						<div className="flex gap-2">
							<input
								{...commonProps}
								type="text"
								value={(values[field.key] as string) ?? ""}
								onChange={(e) => updateField(field.key, e.target.value)}
								placeholder="Lat, Lng"
								className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
							/>
							<button
								type="button"
								disabled={readonly}
								onClick={() => {
									navigator.geolocation.getCurrentPosition(
										(pos) =>
											updateField(field.key, `${pos.coords.latitude},${pos.coords.longitude}`),
										() => {},
									);
								}}
								className="shrink-0 rounded-md bg-[var(--color-brand)] px-3 text-xs font-medium text-white"
							>
								GPS
							</button>
						</div>
					);

				default:
					return (
						<input
							{...commonProps}
							type="text"
							value={(values[field.key] as string) ?? ""}
							onChange={(e) => updateField(field.key, e.target.value)}
							className="h-10 w-full rounded-md border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm"
						/>
					);
			}
		},
		[values, errors, readonly, isSubmitting, updateField],
	);

	return (
		<form onSubmit={handleSubmit} className="space-y-6" noValidate>
			{template.description && (
				<p className="text-sm text-[var(--text-secondary)]">{template.description}</p>
			)}
			<div className="grid gap-4 sm:grid-cols-2">
				{template.fields.map((field) => (
					<div
						key={field.key}
						className={`space-y-1.5 ${field.type === "textarea" || field.type === "file" || field.type === "gps" ? "sm:col-span-2" : ""}`}
					>
						<label
							htmlFor={`field-${field.key}`}
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							{field.label}
							{field.required && <span className="ml-1 text-red-500">*</span>}
						</label>
						{renderField(field)}
						{errors[field.key] && (
							<p id={`error-${field.key}`} className="text-xs text-red-500">
								{errors[field.key]}
							</p>
						)}
					</div>
				))}
			</div>
			{!readonly && (
				<div className="flex justify-end border-t border-[var(--border-subtle)] pt-4">
					<button
						type="submit"
						disabled={isSubmitting}
						className="rounded-full bg-[var(--color-brand)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
					>
						{isSubmitting ? "Guardando..." : "Guardar formulario"}
					</button>
				</div>
			)}
		</form>
	);
}
