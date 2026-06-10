"use client";

import type {
	CanonicalCaseData,
	InheritedField as InheritedFieldType,
} from "@cermont/shared-types";
import { InheritedField } from "./InheritedField";

interface CanonicalCaseFieldsProps {
	canonical: CanonicalCaseData | null;
	inheritedFields: InheritedFieldType[];
	values?: Record<string, string>;
	onFieldChange?: (key: string, value: string) => void;
	readOnly?: boolean;
}

/**
 * Renders all canonical case fields in a grid.
 * Fields that are inherited display their origin badge.
 * Non-inherited fields show as plain inputs.
 */
export function CanonicalCaseFields({
	canonical,
	inheritedFields,
	values,
	onFieldChange,
	readOnly,
}: CanonicalCaseFieldsProps) {
	if (!canonical) {
		return null;
	}

	const inheritedMap = new Map(inheritedFields.map((f) => [f.key, f]));

	const fields = [
		{ key: "clientName", label: "Nombre del cliente", value: canonical.clientName },
		{ key: "contactName", label: "Nombre de contacto", value: canonical.contactName },
		{ key: "contactPhone", label: "Teléfono de contacto", value: canonical.contactPhone },
		{ key: "contactEmail", label: "Email de contacto", value: canonical.contactEmail },
		{ key: "location", label: "Ubicación", value: canonical.location },
		{ key: "businessUnit", label: "Unidad de negocio", value: canonical.businessUnit },
		{ key: "workTypeName", label: "Tipo de trabajo", value: canonical.workTypeName },
		{ key: "priority", label: "Prioridad", value: canonical.priority },
		{ key: "requestedDate", label: "Fecha requerida", value: canonical.requestedDate },
		{ key: "generalScope", label: "Alcance general", value: canonical.generalScope },
	].filter((f) => f.value);

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			{fields.map((field) => {
				const inherited = inheritedMap.get(field.key);
				if (inherited) {
					return (
						<InheritedField
							key={field.key}
							field={inherited}
							value={values?.[field.key]}
							onChange={(value) => onFieldChange?.(field.key, value)}
							readOnly={readOnly}
						/>
					);
				}

				return (
					<div key={field.key} className="grid gap-1.5">
						<label
							htmlFor={`canonical-${field.key}`}
							className="text-sm font-medium text-[var(--text-primary)]"
						>
							{field.label}
						</label>
						{readOnly ? (
							<div className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-secondary)] px-3 py-2.5 text-sm text-[var(--text-primary)] opacity-70">
								{field.value}
							</div>
						) : (
							<input
								id={`canonical-${field.key}`}
								type="text"
								defaultValue={field.value}
								aria-label={field.label}
								className="min-h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-primary)] px-3 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--color-focus-ring)]"
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
