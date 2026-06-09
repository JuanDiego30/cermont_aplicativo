/**
 * Step Default Values — Maps inherited fields + canonical data to form default
 * values for any step page. Each step page calls getDefaultValuesForStep()
 * instead of building defaultValues from scratch.
 */

import type {
	InheritedField,
	ServiceCaseStepContext,
} from "@cermont/shared-types";

// ──────────────────────────────────────────────────────────────────────────────
// Type for form default values (record of field key → value)
// ──────────────────────────────────────────────────────────────────────────────

export type StepDefaultValues = Record<string, string | number | boolean | undefined>;

// ──────────────────────────────────────────────────────────────────────────────
// Build default values from the step context
// Merges canonical data + inherited fields + overrides into a flat record
// that can be passed directly to react-hook-form's defaultValues.
// ──────────────────────────────────────────────────────────────────────────────

export function getDefaultValuesForStep(context: ServiceCaseStepContext): StepDefaultValues {
	const values: StepDefaultValues = {};

	// 1. Include canonical case data
	if (context.canonical.clientId) { values.clientId = context.canonical.clientId; }
	if (context.canonical.clientName) { values.clientName = context.canonical.clientName; }
	if (context.canonical.contactName) { values.contactName = context.canonical.contactName; }
	if (context.canonical.contactPhone) { values.contactPhone = context.canonical.contactPhone; }
	if (context.canonical.contactEmail) { values.contactEmail = context.canonical.contactEmail; }
	if (context.canonical.siteId) { values.siteId = context.canonical.siteId; }
	if (context.canonical.siteName) { values.siteName = context.canonical.siteName; }
	if (context.canonical.location) { values.location = context.canonical.location; }
	if (context.canonical.businessUnit) { values.businessUnit = context.canonical.businessUnit; }
	if (context.canonical.workTypeId) { values.workTypeId = context.canonical.workTypeId; }
	if (context.canonical.workTypeName) { values.workTypeName = context.canonical.workTypeName; }
	if (context.canonical.priority) { values.priority = context.canonical.priority; }
	if (context.canonical.requestedDate) { values.requestedDate = context.canonical.requestedDate; }
	if (context.canonical.generalScope) { values.generalScope = context.canonical.generalScope; }

	// 2. Include inherited field values (overrides canonical if same key)
	for (const field of context.inheritedFields) {
		if (field.value) {
			values[field.key] = field.value;
		}
	}

	// 3. Apply overrides (user modifications from previous steps)
	for (const override of context.overrides) {
		if (override.overrideValue) {
			values[override.key] = override.overrideValue;
		}
	}

	return values;
}

// ──────────────────────────────────────────────────────────────────────────────
// Get default values specifically for creating a Site Visit from step 1 data
// ──────────────────────────────────────────────────────────────────────────────

export function getSiteVisitDefaults(context: ServiceCaseStepContext): StepDefaultValues {
	const base = getDefaultValuesForStep(context);

	// SiteVisit-specific mapping:
	// - clientName, location come from inherited
	// - visitDate is a new field (not inherited)
	// - responsibleUserId, responsibleName need to be set by user

	return {
		...base,
		// ServiceCase ID is required for linking
		serviceCaseId: context.serviceCaseId,
		workRequestId: context.linkedEntityIds.workRequestId,
	};
}

// ──────────────────────────────────────────────────────────────────────────────
// Source label for inherited field (e.g. "Heredado de Solicitud de servicio")
// ──────────────────────────────────────────────────────────────────────────────

export function getInheritedFieldSourceLabel(field: InheritedField): string {
	return `Heredado de ${field.sourceStepLabel}`;
}

// ──────────────────────────────────────────────────────────────────────────────
// Check if a field is inherited in the given context
// ──────────────────────────────────────────────────────────────────────────────

export function isFieldInherited(
	context: ServiceCaseStepContext,
	fieldKey: string,
): InheritedField | undefined {
	return context.inheritedFields.find((f) => f.key === fieldKey);
}

// ──────────────────────────────────────────────────────────────────────────────
// Check if a field has an override in the given context
// ──────────────────────────────────────────────────────────────────────────────

export function hasFieldOverride(
	context: ServiceCaseStepContext,
	fieldKey: string,
): { hasOverride: boolean; overrideReason?: string } {
	const override = context.overrides.find((o) => o.key === fieldKey);
	if (override) {
		return { hasOverride: true, overrideReason: override.reason };
	}
	return { hasOverride: false };
}
