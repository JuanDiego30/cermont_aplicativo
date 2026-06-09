import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { DomainBlockerSchema } from "./domain-blocker.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Inherited Field — A single field inherited from a previous operational step
// Each inherited field carries its origin (source step, source entity ID) so the
// UI can display "Heredado de Solicitud", "Heredado de Visita", etc.
// ──────────────────────────────────────────────────────────────────────────────

export const InheritedFieldSchema = z
	.object({
		key: z.string().min(1).max(120),
		label: z.string().min(1).max(200),
		value: z.string().max(2000).default(""),
		sourceStepCode: CermontOperationalStepCodeSchema,
		sourceEntityId: ObjectIdSchema,
		sourceStepLabel: z.string().min(1).max(200),
		editable: z.boolean().default(false),
		required: z.boolean().default(false),
	})
	.strict();

export type InheritedField = z.infer<typeof InheritedFieldSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Field Override — Records when a user modifies an inherited field
// Prevents silent overwrites: every change to inherited data requires a reason.
// ──────────────────────────────────────────────────────────────────────────────

export const FieldOverrideSchema = z
	.object({
		key: z.string().min(1).max(120),
		label: z.string().min(1).max(200),
		inheritedValue: z.string().max(2000).default(""),
		overrideValue: z.string().max(2000).default(""),
		reason: z.string().min(1).max(500),
		changedBy: ObjectIdSchema,
		changedAt: z.string().datetime(),
	})
	.strict();

export type FieldOverride = z.infer<typeof FieldOverrideSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Canonical Case Data — Fields that are shared across ALL steps
// These live in ServiceCase and should never be duplicated per-step.
// ──────────────────────────────────────────────────────────────────────────────

export const CanonicalCaseDataSchema = z
	.object({
		clientId: ObjectIdSchema.optional(),
		clientName: z.string().max(200).optional(),
		contactName: z.string().max(200).optional(),
		contactPhone: z.string().max(30).optional(),
		contactEmail: z.string().email().optional(),
		siteId: ObjectIdSchema.optional(),
		siteName: z.string().max(200).optional(),
		location: z.string().max(500).optional(),
		businessUnit: z.string().max(120).optional(),
		workTypeId: ObjectIdSchema.optional(),
		workTypeName: z.string().max(120).optional(),
		priority: z.string().max(60).optional(),
		requestedDate: z.string().datetime().optional(),
		generalScope: z.string().max(3000).optional(),
	})
	.strict();

export type CanonicalCaseData = z.infer<typeof CanonicalCaseDataSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Previous Step Entity — Lightweight reference to the entity created in the
// immediately preceding step, so the current step can load its full data.
// ──────────────────────────────────────────────────────────────────────────────

export const PreviousStepEntitySchema = z
	.object({
		stepCode: CermontOperationalStepCodeSchema,
		entityId: ObjectIdSchema,
		entityType: z.string().min(1).max(80),
		status: z.string().min(1).max(60),
	})
	.strict();

export type PreviousStepEntity = z.infer<typeof PreviousStepEntitySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Allowed Action — What the user CAN do from the current step
// Derived from the step definition and current blockers.
// ──────────────────────────────────────────────────────────────────────────────

export const StepAllowedActionSchema = z
	.object({
		command: z.string().min(1).max(80),
		label: z.string().min(1).max(200),
		requiredRole: z.string().min(1).max(60),
		route: z.string().max(200).optional(),
	})
	.strict();

export type StepAllowedAction = z.infer<typeof StepAllowedActionSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Step Required Field — A field the current step MUST capture
// Derived from the step definition's required documents/evidences/forms.
// ──────────────────────────────────────────────────────────────────────────────

export const StepRequiredFieldSchema = z
	.object({
		key: z.string().min(1).max(120),
		label: z.string().min(1).max(200),
		type: z.enum(["document", "evidence", "signature", "form", "field"]),
		required: z.boolean().default(true),
		blocksTransition: z.boolean().default(true),
	})
	.strict();

export type StepRequiredField = z.infer<typeof StepRequiredFieldSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// ServiceCaseStepContext — Complete context for rendering a step page
// Every step page consumes this to know what data to display, what's inherited,
// what blockers exist, what actions are allowed, and what fields are required.
// ──────────────────────────────────────────────────────────────────────────────

export const ServiceCaseStepContextSchema = z
	.object({
		serviceCaseId: ObjectIdSchema,
		currentStepCode: CermontOperationalStepCodeSchema,
		currentStepLabel: z.string().min(1).max(200),

		// Canonical case data (shared across all steps)
		canonical: CanonicalCaseDataSchema,

		// Fields inherited from previous steps
		inheritedFields: z.array(InheritedFieldSchema).default([]),

		// Previous step entity reference
		previousStep: PreviousStepEntitySchema.optional(),

		// User-made overrides on inherited fields
		overrides: z.array(FieldOverrideSchema).default([]),

		// Blockers preventing advancement
		blockers: z.array(DomainBlockerSchema).default([]),

		// Actions the current user can take
		allowedActions: z.array(StepAllowedActionSchema).default([]),

		// Fields the current step must complete
		requiredFields: z.array(StepRequiredFieldSchema).default([]),

		// IDs of entities linked to this case
		linkedEntityIds: z
			.object({
				workRequestId: ObjectIdSchema.optional(),
				siteVisitId: ObjectIdSchema.optional(),
				proposalId: ObjectIdSchema.optional(),
				purchaseOrderId: ObjectIdSchema.optional(),
				workOrderId: ObjectIdSchema.optional(),
				planningPacketId: ObjectIdSchema.optional(),
				executionSessionId: ObjectIdSchema.optional(),
				technicalReportId: ObjectIdSchema.optional(),
				deliveryRecordId: ObjectIdSchema.optional(),
				serviceEntrySheetId: ObjectIdSchema.optional(),
				invoiceId: ObjectIdSchema.optional(),
				paymentId: ObjectIdSchema.optional(),
			})
			.default({}),

		// Metadata
		generatedAt: z.string().datetime(),
	})
	.strict();

export type ServiceCaseStepContext = z.infer<typeof ServiceCaseStepContextSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Step Default Values — Prefill data for react-hook-form based on step context
// Maps inherited fields + canonical data to form default values for each step.
// ──────────────────────────────────────────────────────────────────────────────

export const StepDefaultValuesSchema = z.record(z.string(), z.custom());

export type StepDefaultValues = z.infer<typeof StepDefaultValuesSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Query params for the step-context endpoint
// ──────────────────────────────────────────────────────────────────────────────

export const StepContextQuerySchema = z
	.object({
		stepCode: CermontOperationalStepCodeSchema,
	})
	.strict();

export type StepContextQuery = z.infer<typeof StepContextQuerySchema>;

export const StepContextParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type StepContextParams = z.infer<typeof StepContextParamsSchema>;
