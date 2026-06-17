"use client";

import type { InheritedField as InheritedFieldType } from "@cermont/shared-types";
import { Info } from "lucide-react";

interface InheritedFieldProps {
	field: InheritedFieldType;
	value?: string;
	onChange?: (value: string) => void;
	readOnly?: boolean;
}

/**
 * Displays a single inherited field with its origin badge.
 * Shows "Heredado de [StepName]" badge and allows editing if editable.
 */
export function InheritedField({ field, value, onChange, readOnly }: InheritedFieldProps) {
	const displayValue = value ?? field.value;
	const isReadOnly = readOnly || !field.editable;

	return (
		<div className="grid gap-1.5">
			<div className="flex items-center justify-between">
				<label
					htmlFor={`inherited-${field.key}`}
					className="text-sm font-medium text-[var(--text-primary)]"
				>
					{field.label}
					{field.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
				</label>
				<span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-blue-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-brand)]">
					<Info className="size-2.5" aria-hidden="true" />
					Heredado de {field.sourceStepLabel}
				</span>
			</div>
			{isReadOnly ? (
				<div className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] opacity-70">
					{displayValue || <span className="italic text-[var(--text-muted)]">Sin dato</span>}
				</div>
			) : (
				<input
					id={`inherited-${field.key}`}
					type="text"
					value={displayValue}
					onChange={(e) => onChange?.(e.target.value)}
					required={field.required}
					aria-label={field.label}
					className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)]"
				/>
			)}
		</div>
	);
}
