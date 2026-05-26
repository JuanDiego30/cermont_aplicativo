import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { DomainBlockerSchema } from "./domain-blocker.schema";
import { EvidenceTypeSchema } from "./evidence.schema";
import { ResolvedStepRequirementSchema } from "./operational-step-requirement.schema";
import {
	NextActionSchema,
	ServiceCaseArtifactsSchema,
	ServiceCaseFinancialSummarySchema,
	ServiceCaseOperationalStepSchema,
	ServiceCaseOperationalStepStatusSchema,
	ServiceCaseOperationalSummarySchema,
	TimelineEntrySchema,
} from "./service-case.schema";

// ─────────────────────────────────────────────────────────────────────────
// ServiceCaseWorkflowViewModel — Full cockpit view for one case/OT
// Reference: docs/plans/refactor-cermont-14-pasos/00_PLAN_MAESTRO_ORQUESTADOR_14_PASOS.md
// ─────────────────────────────────────────────────────────────────────────

/**
 * Lightweight summary of a linked document visible in the workflow cockpit.
 */
export const LinkedDocumentSummarySchema = z.object({
	documentId: ObjectIdSchema,
	title: z.string().min(1),
	purpose: z.enum(["library", "evidence", "form_source", "closure_support", "report_attachment"]),
	stepCode: CermontOperationalStepCodeSchema.optional(),
	linkedRequirementId: z.string().optional(),
	fileUrl: z.string().optional(),
	mimeType: z.string().optional(),
	uploadedAt: z.string().datetime().optional(),
});
export type LinkedDocumentSummary = z.infer<typeof LinkedDocumentSummarySchema>;

/**
 * Lightweight summary of a linked evidence item visible in the workflow cockpit.
 */
export const LinkedEvidenceSummarySchema = z.object({
	evidenceId: ObjectIdSchema,
	filename: z.string().min(1),
	evidenceType: EvidenceTypeSchema,
	stepCode: CermontOperationalStepCodeSchema.optional(),
	requirementId: z.string().optional(),
	url: z.string().url().optional(),
	capturedAt: z.string().datetime().optional(),
	hasGps: z.boolean().default(false),
});
export type LinkedEvidenceSummary = z.infer<typeof LinkedEvidenceSummarySchema>;

/**
 * Status of a single operational step as displayed in the cockpit timeline.
 */
export const OperationalStepProgressItemSchema = z.object({
	stepCode: CermontOperationalStepCodeSchema,
	stepNumber: z.number().min(1).max(14),
	label: z.string().min(1),
	phase: z.enum(["operational", "administrative"]),
	status: ServiceCaseOperationalStepStatusSchema,
	blockerCount: z.number().int().nonnegative().default(0),
	missingRequirementCount: z.number().int().nonnegative().default(0),
	completedAt: z.string().datetime().optional(),
	route: z.string().optional(),
});
export type OperationalStepProgressItem = z.infer<typeof OperationalStepProgressItemSchema>;

/**
 * Cost traceability summary for the cockpit cost panel.
 */
export const CostTraceabilitySummarySchema = z.object({
	estimated: z.object({
		proposalValue: z.number().nonnegative().default(0),
		estimatedLabor: z.number().nonnegative().default(0),
		estimatedMaterials: z.number().nonnegative().default(0),
		estimatedEquipment: z.number().nonnegative().default(0),
		estimatedTaxes: z.number().nonnegative().default(0),
		estimatedTotalCost: z.number().nonnegative().default(0),
		estimatedMargin: z.number().default(0),
	}),
	actual: z.object({
		actualLabor: z.number().nonnegative().default(0),
		actualMaterials: z.number().nonnegative().default(0),
		actualEquipment: z.number().nonnegative().default(0),
		actualTaxes: z.number().nonnegative().default(0),
		actualTotalCost: z.number().nonnegative().default(0),
		actualMargin: z.number().default(0),
	}),
	billing: z.object({
		sesValue: z.number().nonnegative().default(0),
		invoiceValue: z.number().nonnegative().default(0),
		paidValue: z.number().nonnegative().default(0),
		pendingValue: z.number().nonnegative().default(0),
	}),
	variance: z.object({
		costDifference: z.number().default(0),
		marginDifference: z.number().default(0),
		status: z.enum(["ok", "warning", "loss"]).default("ok"),
	}),
});
export type CostTraceabilitySummary = z.infer<typeof CostTraceabilitySummarySchema>;

/**
 * Summary of closure/administrative status for steps 8-14.
 */
export const ClosureWorkflowSummarySchema = z.object({
	deliveryRecordSigned: z.boolean().default(false),
	sesSubmitted: z.boolean().default(false),
	sesApproved: z.boolean().default(false),
	invoiceSubmitted: z.boolean().default(false),
	invoiceApproved: z.boolean().default(false),
	paymentReconciled: z.boolean().default(false),
	caseClosed: z.boolean().default(false),
	daysOverdue: z.number().int().nonnegative().default(0),
	closingPackageReady: z.boolean().default(false),
});
export type ClosureWorkflowSummary = z.infer<typeof ClosureWorkflowSummarySchema>;

/**
 * A recommended next action visible in the cockpit's intelligence panel.
 */
export const WorkflowNextActionSchema = z.object({
	actionId: z.string().min(1),
	label: z.string().min(1),
	description: z.string().optional(),
	stepCode: CermontOperationalStepCodeSchema.optional(),
	route: z.string().optional(),
	priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
	blockerCode: z.string().optional(),
});
export type WorkflowNextAction = z.infer<typeof WorkflowNextActionSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Main cockpit view model — the single payload the frontend needs
// ─────────────────────────────────────────────────────────────────────────

export const ServiceCaseWorkflowViewSchema = z.object({
	serviceCaseId: ObjectIdSchema,
	orderId: ObjectIdSchema.optional(),
	code: z.string().min(1),
	clientName: z.string().min(1),
	location: z.string().optional(),
	serviceType: z.string().optional(),
	globalStatus: z.string().min(1),
	responsibleName: z.string().optional(),
	deadline: z.string().datetime().optional(),
	updatedAt: z.string().datetime(),

	// 14-step timeline
	currentStepCode: CermontOperationalStepCodeSchema,
	steps: z.array(ServiceCaseOperationalStepSchema),

	// Current step detail
	activeStepRequirements: z.array(ResolvedStepRequirementSchema),

	// Blockers
	blockers: z.array(DomainBlockerSchema),

	// Intelligence panel
	nextActions: z.array(NextActionSchema),
	canAdvance: z.boolean().optional(),

	// Artifacts / audit continuity
	artifacts: ServiceCaseArtifactsSchema,
	timeline: z.array(TimelineEntrySchema).default([]),
	financialSummary: ServiceCaseFinancialSummarySchema.optional(),
	operationalSummary: ServiceCaseOperationalSummarySchema.optional(),

	// Linked artifacts
	documents: z.array(LinkedDocumentSummarySchema),
	evidences: z.array(LinkedEvidenceSummarySchema),

	// Financial
	costs: CostTraceabilitySummarySchema,
	closure: ClosureWorkflowSummarySchema,

	generatedAt: z.string().datetime(),
});
export type ServiceCaseWorkflowViewModel = z.infer<typeof ServiceCaseWorkflowViewSchema>;
