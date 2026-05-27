"use client";

import type React from "react";
import { useMemo } from "react";

export type FieldType =
	| "text"
	| "textarea"
	| "number"
	| "currency"
	| "date"
	| "datetime"
	| "time"
	| "boolean"
	| "select"
	| "multi_select"
	| "checkbox"
	| "checklist"
	| "radio"
	| "yes_no"
	| "signature"
	| "photo"
	| "file"
	| "gps"
	| "table"
	| "calculated"
	| "section"
	| "repeatable_group"
	| "evidence_block";

export interface DynamicTableColumn {
	key: string;
	label: string;
	type?: FieldType;
	required?: boolean;
	options?: string[];
}

export interface DynamicField {
	key: string;
	label: string;
	type: FieldType;
	required?: boolean;
	options?: string[];
	columns?: DynamicTableColumn[];
	placeholder?: string;
	allowOtherOption?: boolean;
	otherOptionLabel?: string;
	allowCustomOption?: boolean;
	customOptionLabel?: string;
}

export interface DynamicSection {
	id: string;
	title: string;
	fields: DynamicField[];
}

export interface DynamicFormSchema {
	title: string;
	sections: DynamicSection[];
}

interface DynamicFormRendererProps {
	schema: DynamicFormSchema;
	values: Record<string, unknown>;
	errors: Record<string, string>;
	onFieldChange: (key: string, value: unknown) => void;
	formId?: string;
}

const OTHER_SENTINEL = "__cermont_other__";
const INPUT_CLASS =
	"w-full rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-blue)]";

interface MultiOptionValue {
	selected: string[];
	otherValue?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringValue(value: unknown): string {
	return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((item): item is string => typeof item === "string");
}

function toMultiOptionValue(value: unknown): MultiOptionValue {
	if (Array.isArray(value)) {
		return { selected: toStringArray(value) };
	}
	if (isRecord(value)) {
		return {
			selected: toStringArray(value.selected),
			...(typeof value.otherValue === "string" && { otherValue: value.otherValue }),
		};
	}
	return { selected: [] };
}

function allowsCustomOption(field: DynamicField): boolean {
	return field.allowOtherOption === true || field.allowCustomOption === true;
}

function resolveCustomOptionLabel(field: DynamicField): string {
	return field.otherOptionLabel || field.customOptionLabel || "Otro / Personalizado";
}

function buildMultiOptionChange(selected: string[], current: MultiOptionValue): MultiOptionValue {
	return typeof current.otherValue === "string" ? { selected, otherValue: current.otherValue } : { selected };
}

function toRecordValue(value: unknown): Record<string, unknown> {
	return isRecord(value) ? value : {};
}

function toTableRows(value: unknown): Record<string, unknown>[] {
	if (!Array.isArray(value)) {
		return [{}];
	}
	const rows = value.filter((row): row is Record<string, unknown> => isRecord(row));
	return rows.length > 0 ? rows : [{}];
}

function updateRecordValue(
	field: DynamicField,
	value: unknown,
	key: string,
	next: unknown,
	onFieldChange: (key: string, value: unknown) => void,
) {
	onFieldChange(field.key, { ...toRecordValue(value), [key]: next });
}

function buildErrorProps(fieldId: string, hasError: boolean) {
	return hasError ? { "aria-invalid": true as const, "aria-describedby": `${fieldId}-error` } : {};
}

export function DynamicFormRenderer({
	schema,
	values,
	errors,
	onFieldChange,
	formId = "dynamic-form",
}: DynamicFormRendererProps) {
	const stableFormId = useMemo(() => formId, [formId]);

	return (
		<div className="space-y-8">
			<h2 className="text-xl font-semibold text-[var(--text-primary)]">{schema.title}</h2>

			{schema.sections.map((section) => (
				<fieldset
					key={section.id}
					className="space-y-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-1)]"
				>
					<legend className="px-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
						{section.title}
					</legend>

					{section.fields.map((field) => {
						const fieldId = `${stableFormId}-${section.id}-${field.key}`;
						const fieldValue = values[field.key];
						const fieldError = errors[field.key];
						const hasError = Boolean(fieldError);

						return (
							<div key={field.key} className="space-y-1.5">
								<label
									htmlFor={fieldId}
									className="block text-sm font-medium text-[var(--text-primary)]"
								>
									{field.label}
									{field.required && (
										<span className="ml-1 text-[var(--color-danger)]" aria-hidden="true">
											*
										</span>
									)}
								</label>

								{renderField(field, fieldId, fieldValue, hasError, onFieldChange)}

								{hasError && (
									<p
										id={`${fieldId}-error`}
										role="alert"
										className="text-xs text-[var(--color-danger)]"
									>
										{fieldError}
									</p>
								)}
							</div>
						);
					})}
				</fieldset>
			))}
		</div>
	);
}

function renderSelectWithOther(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const recordValue = toRecordValue(value);
	const optionValue = recordValue.option === OTHER_SENTINEL ? OTHER_SENTINEL : toStringValue(value);
	const otherValue = typeof recordValue.customValue === "string" ? recordValue.customValue : "";
	const showOther = allowsCustomOption(field) && (field.options?.length ?? 0) > 0;
	const isOtherSelected = showOther && optionValue === OTHER_SENTINEL;
	const otherLabel = resolveCustomOptionLabel(field);
	const errorProps = buildErrorProps(fieldId, hasError);

	return (
		<div className="space-y-2">
			<select
				id={fieldId}
				name={field.key}
				value={optionValue}
				onChange={(event) =>
					onFieldChange(
						field.key,
						event.target.value === OTHER_SENTINEL
							? { option: OTHER_SENTINEL, customValue: "" }
							: event.target.value,
					)
				}
				required={field.required}
				className={INPUT_CLASS}
				{...errorProps}
			>
				<option value="">Seleccionar...</option>
				{field.options?.map((opt) => (
					<option key={opt} value={opt}>
						{opt}
					</option>
				))}
				{showOther ? <option value={OTHER_SENTINEL}>{otherLabel}</option> : null}
			</select>
			{isOtherSelected ? (
				<input
					id={`${fieldId}-custom`}
					name={`${field.key}_custom`}
					type="text"
					value={otherValue}
					placeholder={`Escriba ${otherLabel.toLowerCase()}`}
					required={field.required}
					aria-label={`${field.label} ${otherLabel}`}
					className={INPUT_CLASS}
					onChange={(event) =>
						onFieldChange(field.key, {
							option: OTHER_SENTINEL,
							customValue: event.target.value,
						})
					}
					{...errorProps}
				/>
			) : null}
		</div>
	);
}

function renderOptionCheckboxes(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const otherLabel = resolveCustomOptionLabel(field);
	const current = toMultiOptionValue(value);
	const selected = current.selected;
	const showOther = allowsCustomOption(field);
	const errorProps = buildErrorProps(fieldId, hasError);

	function toggleOption(option: string, checked: boolean) {
		const next = checked
			? Array.from(new Set([...selected, option]))
			: selected.filter((item) => item !== option);
		onFieldChange(field.key, showOther ? buildMultiOptionChange(next, current) : next);
	}

	function updateOtherValue(otherValue: string) {
		const nextSelected = selected.includes(OTHER_SENTINEL)
			? selected
			: [...selected, OTHER_SENTINEL];
		onFieldChange(field.key, { selected: nextSelected, otherValue });
	}

	return (
		<fieldset className="space-y-2" aria-labelledby={`${fieldId}-legend`}>
			<legend id={`${fieldId}-legend`} className="sr-only">
				{field.label}
			</legend>
			<div className="grid gap-2 sm:grid-cols-2">
				{field.options?.map((option) => {
					const optionId = `${fieldId}-${option}`;
					return (
						<label
							key={option}
							htmlFor={optionId}
							className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-primary)]"
						>
							<input
								id={optionId}
								type="checkbox"
								checked={selected.includes(option)}
								onChange={(event) => toggleOption(option, event.target.checked)}
								className="size-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]"
								{...errorProps}
							/>
							{option}
						</label>
					);
				})}
				{showOther ? (
					<label
						htmlFor={`${fieldId}-other`}
						className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-primary)]"
					>
						<input
							id={`${fieldId}-other`}
							type="checkbox"
							checked={selected.includes(OTHER_SENTINEL)}
							onChange={(event) => toggleOption(OTHER_SENTINEL, event.target.checked)}
							className="size-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]"
							{...errorProps}
						/>
						{otherLabel}
					</label>
				) : null}
			</div>
			{showOther && selected.includes(OTHER_SENTINEL) ? (
				<input
					id={`${fieldId}-other-value`}
					type="text"
					value={current.otherValue || ""}
					aria-label={`${field.label} ${otherLabel}`}
					placeholder={`Escriba ${otherLabel.toLowerCase()}`}
					className={INPUT_CLASS}
					onChange={(event) => updateOtherValue(event.target.value)}
					{...errorProps}
				/>
			) : null}
		</fieldset>
	);
}

function renderGpsField(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const gps = toRecordValue(value);
	const errorProps = buildErrorProps(fieldId, hasError);
	return (
		<div className="grid gap-2 sm:grid-cols-3">
			<input
				id={fieldId}
				type="number"
				inputMode="decimal"
				value={toStringValue(gps.latitude)}
				aria-label={`${field.label} latitud`}
				placeholder="Latitud"
				className={INPUT_CLASS}
				onChange={(event) =>
					updateRecordValue(field, value, "latitude", event.target.value, onFieldChange)
				}
				{...errorProps}
			/>
			<input
				type="number"
				inputMode="decimal"
				value={toStringValue(gps.longitude)}
				aria-label={`${field.label} longitud`}
				placeholder="Longitud"
				className={INPUT_CLASS}
				onChange={(event) =>
					updateRecordValue(field, value, "longitude", event.target.value, onFieldChange)
				}
				{...errorProps}
			/>
			<input
				type="number"
				inputMode="decimal"
				value={toStringValue(gps.accuracy)}
				aria-label={`${field.label} precision`}
				placeholder="Precision m"
				className={INPUT_CLASS}
				onChange={(event) =>
					updateRecordValue(field, value, "accuracy", event.target.value, onFieldChange)
				}
				{...errorProps}
			/>
		</div>
	);
}

function renderTableField(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const columns =
		field.columns && field.columns.length > 0
			? field.columns
			: [{ key: "value", label: "Valor", type: "text" as const }];
	const rows = toTableRows(value);
	const firstRow = rows[0];
	const errorProps = buildErrorProps(fieldId, hasError);

	function updateCell(columnKey: string, next: string) {
		onFieldChange(field.key, [{ ...firstRow, [columnKey]: next }]);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-[var(--border-default)]">
			<table aria-label={field.label} className="w-full min-w-[520px] text-left text-sm">
				<thead className="bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
					<tr>
						{columns.map((column) => (
							<th key={column.key} scope="col" className="px-3 py-2 font-medium">
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					<tr>
						{columns.map((column) => (
							<td key={column.key} className="px-3 py-2">
								<input
									type={column.type === "number" || column.type === "currency" ? "number" : "text"}
									inputMode={column.type === "currency" ? "decimal" : undefined}
									value={toStringValue(firstRow[column.key])}
									aria-label={`${field.label} ${column.label}`}
									className={INPUT_CLASS}
									onChange={(event) => updateCell(column.key, event.target.value)}
									{...errorProps}
								/>
							</td>
						))}
					</tr>
				</tbody>
			</table>
		</div>
	);
}

function renderEvidenceBlock(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const evidence = toRecordValue(value);
	const errorProps = buildErrorProps(fieldId, hasError);
	return (
		<div className="grid gap-2">
			<textarea
				id={fieldId}
				value={toStringValue(evidence.notes)}
				aria-label={`${field.label} notas`}
				placeholder="Notas de evidencia"
				rows={3}
				className={INPUT_CLASS}
				onChange={(event) =>
					updateRecordValue(field, value, "notes", event.target.value, onFieldChange)
				}
				{...errorProps}
			/>
			<input
				type="text"
				value={toStringValue(evidence.documentIds)}
				aria-label={`${field.label} documentos`}
				placeholder="IDs de documentos separados por coma"
				className={INPUT_CLASS}
				onChange={(event) =>
					updateRecordValue(
						field,
						value,
						"documentIds",
						event.target.value
							.split(",")
							.map((item) => item.trim())
							.filter(Boolean),
						onFieldChange,
					)
				}
				{...errorProps}
			/>
		</div>
	);
}

function renderField(
	field: DynamicField,
	fieldId: string,
	value: unknown,
	hasError: boolean,
	onFieldChange: (key: string, value: unknown) => void,
): React.ReactNode {
	const errorProps = buildErrorProps(fieldId, hasError);

	switch (field.type) {
		case "textarea":
			return (
				<textarea
					id={fieldId}
					name={field.key}
					value={toStringValue(value)}
					onChange={(event) => onFieldChange(field.key, event.target.value)}
					placeholder={field.placeholder}
					required={field.required}
					rows={4}
					className={INPUT_CLASS}
					{...errorProps}
				/>
			);

		case "number":
		case "currency":
			return (
				<input
					id={fieldId}
					name={field.key}
					type="number"
					inputMode={field.type === "currency" ? "decimal" : "numeric"}
					step={field.type === "currency" ? "0.01" : "1"}
					value={toStringValue(value)}
					onChange={(event) => onFieldChange(field.key, event.target.value)}
					placeholder={field.placeholder}
					required={field.required}
					className={INPUT_CLASS}
					{...errorProps}
				/>
			);

		case "date":
		case "datetime":
		case "time":
			return (
				<input
					id={fieldId}
					name={field.key}
					type={field.type === "datetime" ? "datetime-local" : field.type}
					value={toStringValue(value)}
					onChange={(event) => onFieldChange(field.key, event.target.value)}
					required={field.required}
					className={INPUT_CLASS}
					{...errorProps}
				/>
			);

		case "select":
			return renderSelectWithOther(field, fieldId, value, hasError, onFieldChange);

		case "multi_select":
		case "checklist":
			return renderOptionCheckboxes(field, fieldId, value, hasError, onFieldChange);

		case "checkbox":
		case "boolean":
			return (
				<div className="flex items-center gap-2">
					<input
						id={fieldId}
						name={field.key}
						type="checkbox"
						checked={Boolean(value)}
						onChange={(event) => onFieldChange(field.key, event.target.checked)}
						className="size-4 rounded border-[var(--border-default)] text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]"
						{...errorProps}
					/>
					<span className="text-sm text-[var(--text-secondary)]">
						{field.placeholder || field.label}
					</span>
				</div>
			);

		case "radio":
		case "yes_no":
			return (
				<div className="flex flex-wrap gap-3">
					{(field.options && field.options.length > 0 ? field.options : ["Sí", "No"]).map((opt) => {
						const radioId = `${fieldId}-${opt}`;
						return (
							<label
								key={opt}
								htmlFor={radioId}
								className="flex items-center gap-1.5 text-sm text-[var(--text-primary)]"
							>
								<input
									id={radioId}
									type="radio"
									name={field.key}
									value={opt}
									checked={value === opt}
									onChange={() => onFieldChange(field.key, opt)}
									className="text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]"
									{...errorProps}
								/>
								{opt}
							</label>
						);
					})}
				</div>
			);

		case "gps":
			return renderGpsField(field, fieldId, value, hasError, onFieldChange);

		case "table":
		case "repeatable_group":
			return renderTableField(field, fieldId, value, hasError, onFieldChange);

		case "evidence_block":
			return renderEvidenceBlock(field, fieldId, value, hasError, onFieldChange);

		case "photo":
		case "file":
			return (
				<input
					id={fieldId}
					name={field.key}
					type="file"
					accept={field.type === "photo" ? "image/*" : undefined}
					onChange={(event) => onFieldChange(field.key, event.target.files?.[0]?.name || "")}
					required={field.required}
					className={INPUT_CLASS}
					{...errorProps}
				/>
			);

		case "signature":
			return (
				<div className="rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)] p-4 text-center text-sm text-[var(--text-tertiary)]">
					<input
						id={fieldId}
						name={field.key}
						type="text"
						placeholder="Nombre del firmante"
						value={toStringValue(value)}
						onChange={(event) => onFieldChange(field.key, event.target.value)}
						className={INPUT_CLASS}
						{...errorProps}
					/>
				</div>
			);

		case "calculated":
			return (
				<input
					id={fieldId}
					name={field.key}
					type="text"
					value={toStringValue(value)}
					readOnly
					placeholder={field.placeholder}
					className={`${INPUT_CLASS} bg-[var(--surface-secondary)]`}
					{...errorProps}
				/>
			);

		default:
			return (
				<input
					id={fieldId}
					name={field.key}
					type="text"
					value={toStringValue(value)}
					onChange={(event) => onFieldChange(field.key, event.target.value)}
					placeholder={field.placeholder}
					required={field.required}
					className={INPUT_CLASS}
					{...errorProps}
				/>
			);
	}
}
