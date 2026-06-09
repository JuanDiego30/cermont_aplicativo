"use client";

import type { InheritedField as InheritedFieldType } from "@cermont/shared-types";
import { InheritedField } from "./InheritedField";

interface InheritedFieldGroupProps {
	title: string;
	fields: InheritedFieldType[];
	values?: Record<string, string>;
	onFieldChange?: (key: string, value: string) => void;
	readOnly?: boolean;
}

/**
 * Group of inherited fields from the same source step.
 * Renders a titled section with inherited field badges.
 */
export function InheritedFieldGroup({
	title,
	fields,
	values,
	onFieldChange,
	readOnly,
}: InheritedFieldGroupProps) {
	if (fields.length === 0) {
		return null;
	}

	return (
		<div className="rounded-[var(--radius-lg)] border border-[var(--color-brand)]/20 bg-[var(--color-brand-blue-bg)] p-4">
			<p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-brand)]">
				{title}
			</p>
			<div className="grid gap-3 sm:grid-cols-2">
				{fields.map((field) => (
					<InheritedField
						key={field.key}
						field={field}
						value={values?.[field.key]}
						onChange={(value) => onFieldChange?.(field.key, value)}
						readOnly={readOnly}
					/>
				))}
			</div>
		</div>
	);
}
