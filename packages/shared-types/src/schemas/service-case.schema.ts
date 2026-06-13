import { z } from "zod";
import {
	type CermontOperationalStepCode,
	CermontOperationalStepCodeSchema,
	CermontOperationalStepViewSchema,
} from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { DomainBlockerSchema } from "./domain-blocker.schema";
import { ResolvedStepRequirementSchema } from "./operational-step-requirement.schema";
import { UserRoleSchema } from "./user.schema";

// ──────────────────────────────────────────────────────────────────────────────
// ServiceCase — Read-side projection orchestrating all pipeline artifacts
// This is the domain orchestrator. In Phase 1 it is a contract only.
// The stage computation happens in the backend (Phase 2).
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Sections 1, 2A
// ──────────────────────────────────────────────────────────────────────────────

const SERVICE_CASE_STAGE_VALUES = [
	"intake",
	"assessment",
	"proposal",
	"authorization",
	"planning",
	"ready_to_execute",
	"in_execution",
	"technical_closure",
	"administrative_closure",
	"ses_pending",
	"billing_pending",
	"receivable_open",
	"paid",
	"archived",
	"cancelled",
] as const;

export const ServiceCaseStageSchema = z.enum(SERVICE_CASE_STAGE_VALUES);
export type ServiceCaseStage = z.infer<typeof ServiceCaseStageSchema>;

export const CERMONT_STEP_STAGE_MAP: Record<CermontOperationalStepCode, ServiceCaseStage> = {
	step_01_work_request: "intake",
	step_02_site_visit: "assessment",
	step_03_proposal: "proposal",
	step_04_purchase_order: "authorization",
	step_05_planning: "planning",
	step_06_execution: "in_execution",
	step_07_technical_report: "technical_closure",
	step_08_delivery_record: "administrative_closure",
	step_09_client_signature: "administrative_closure",
	step_10_ses_submission: "ses_pending",
	step_11_ses_approval: "billing_pending",
	step_12_invoice_submission: "receivable_open",
	step_13_invoice_approval: "receivable_open",
	step_14_payment_closure: "paid",
};

// ──────────────────────────────────────────────────────────────────────────────
// Artifact reference — safe reference without importing full artifact schemas
// (avoids circular imports in Phase 1)
// ──────────────────────────────────────────────────────────────────────────────

export const ArtifactRefSchema = z
	.object({
		id: ObjectIdSchema,
		code: z.string().optional(),
		status: z.string().min(1).max(60),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type ArtifactRef = z.infer<typeof ArtifactRefSchema>;

export const ServiceCaseArtifactsSchema = z
	.object({
		workRequest: ArtifactRefSchema.optional(),
		siteVisit: ArtifactRefSchema.optional(),
		proposal: ArtifactRefSchema.optional(),
		purchaseOrder: ArtifactRefSchema.optional(),
		workOrder: ArtifactRefSchema.optional(),
		planningPacket: ArtifactRefSchema.optional(),
		executionSession: ArtifactRefSchema.optional(),
		technicalReport: ArtifactRefSchema.optional(),
		deliveryRecord: ArtifactRefSchema.optional(),
		serviceEntrySheet: ArtifactRefSchema.optional(),
		invoice: ArtifactRefSchema.optional(),
		payment: ArtifactRefSchema.optional(),
	})
	.strict();

export type ServiceCaseArtifacts = z.infer<typeof ServiceCaseArtifactsSchema>;

export const ServiceCaseOperationalStepStatusSchema = z.enum([
	"pending",
	"active",
	"blocked",
	"completed",
	"skipped",
	"cancelled",
]);

export type ServiceCaseOperationalStepStatus = z.infer<
	typeof ServiceCaseOperationalStepStatusSchema
>;

export const ServiceCaseOperationalStepSchema = CermontOperationalStepViewSchema.extend({
	status: ServiceCaseOperationalStepStatusSchema,
	blockers: z.array(DomainBlockerSchema).default([]),
	requirements: z.array(ResolvedStepRequirementSchema).default([]),
	canAdvanceFromHere: z.boolean().default(false),
});

export type ServiceCaseOperationalStep = z.infer<typeof ServiceCaseOperationalStepSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Next action recommendation for the current actor
// ──────────────────────────────────────────────────────────────────────────────

export const NextActionSchema = z
	.object({
		command: z.string().min(1).max(80),
		label: z.string().min(1).max(200),
		requiredRole: UserRoleSchema,
		route: z.string().max(200).optional(),
	})
	.strict();

export type NextAction = z.infer<typeof NextActionSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Timeline entry — immutable event log for audit
// ──────────────────────────────────────────────────────────────────────────────

export const TimelineEntrySchema = z
	.object({
		eventId: z.string().min(1).max(80),
		stage: ServiceCaseStageSchema,
		command: z.string().min(1).max(80),
		actorId: ObjectIdSchema,
		actorRole: UserRoleSchema,
		occurredAt: z.string().datetime(),
		notes: z.string().max(500).optional(),
	})
	.strict();

export type TimelineEntry = z.infer<typeof TimelineEntrySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Financial and operational summaries
// ──────────────────────────────────────────────────────────────────────────────

export const ServiceCaseFinancialSummarySchema = z
	.object({
		status: z.enum(["pending_data", "not_available", "complete"]).default("pending_data"),
		estimatedTotal: z.number().nonnegative().optional(),
		actualTotal: z.number().nonnegative().optional(),
		varianceAmount: z.number().optional(),
		variancePercentage: z.number().optional(),
		sesTotal: z.number().nonnegative().optional(),
		invoiceTotal: z.number().nonnegative().optional(),
		paidTotal: z.number().nonnegative().optional(),
		outstandingAmount: z.number().nonnegative().optional(),
		proposalAmount: z.number().nonnegative().optional(),
		poAmount: z.number().nonnegative().optional(),
		actualCost: z.number().nonnegative().optional(),
		invoicedAmount: z.number().nonnegative().optional(),
		paidAmount: z.number().nonnegative().optional(),
		currency: z.enum(["COP", "USD", "EUR"]).optional(),
		invoiceAgingStatus: z.enum(["not_available", "not_due", "due", "overdue", "paid"]).optional(),
		paymentStatus: z
			.enum(["not_available", "not_due", "due", "recorded", "reconciled", "rejected"])
			.optional(),
	})
	.strict();

export type ServiceCaseFinancialSummary = z.infer<typeof ServiceCaseFinancialSummarySchema>;

export const ServiceCaseOperationalSummarySchema = z
	.object({
		planningStatus: z.string().min(1).max(60).optional(),
		executionStatus: z.string().min(1).max(60).optional(),
		evidenceCount: z.number().int().nonnegative().optional(),
		reportStatus: z.string().min(1).max(60).optional(),
		deliveryRecordStatus: z.string().min(1).max(60).optional(),
		blockersCount: z.number().int().nonnegative().optional(),
		criticalBlockersCount: z.number().int().nonnegative().optional(),
		offlineSyncStatus: z.string().min(1).max(60).optional(),
		assignedCrew: z.array(ObjectIdSchema).default([]),
		currentOwnerRole: z.string().min(1).max(60).optional(),
		plannedStartAt: z.string().datetime().optional(),
		actualStartAt: z.string().datetime().optional(),
		actualEndAt: z.string().datetime().optional(),
		totalLaborHours: z.number().nonnegative().optional(),
		totalMaterialLines: z.number().int().nonnegative().optional(),
		incidentCount: z.number().int().nonnegative().optional(),
		/** Days the case has been in the current workflow step (computed at read time) */
		daysInCurrentStep: z.number().int().nonnegative().optional(),
	})
	.strict();

export type ServiceCaseOperationalSummary = z.infer<typeof ServiceCaseOperationalSummarySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Main entity — projection (read-only in Phase 1)
// ──────────────────────────────────────────────────────────────────────────────

export const ServiceCaseSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().min(1).max(40),
		clientId: ObjectIdSchema.optional(),
		clientName: z.string().min(1).max(200),
		currentStage: ServiceCaseStageSchema,
		currentStepCode: CermontOperationalStepCodeSchema.optional(),
		artifacts: ServiceCaseArtifactsSchema,
		blockers: z.array(DomainBlockerSchema).default([]),
		canAdvance: z.boolean().optional(),
		currentStepRequirements: z.array(ResolvedStepRequirementSchema).default([]),
		stepsChecklist: z.array(ServiceCaseOperationalStepSchema).default([]),
		nextActions: z.array(NextActionSchema).default([]),
		timeline: z.array(TimelineEntrySchema).default([]),
		financialSummary: ServiceCaseFinancialSummarySchema.optional(),
		operationalSummary: ServiceCaseOperationalSummarySchema.optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type ServiceCase = z.infer<typeof ServiceCaseSchema>;

export function mapLegacyServiceCaseStageToStep(
	stage: ServiceCaseStage,
): CermontOperationalStepCode {
	const map: Record<ServiceCaseStage, CermontOperationalStepCode> = {
		intake: "step_01_work_request",
		assessment: "step_02_site_visit",
		proposal: "step_03_proposal",
		authorization: "step_04_purchase_order",
		planning: "step_05_planning",
		ready_to_execute: "step_05_planning",
		in_execution: "step_06_execution",
		technical_closure: "step_07_technical_report",
		administrative_closure: "step_08_delivery_record",
		ses_pending: "step_10_ses_submission",
		billing_pending: "step_12_invoice_submission",
		receivable_open: "step_13_invoice_approval",
		paid: "step_14_payment_closure",
		archived: "step_14_payment_closure",
		cancelled: "step_14_payment_closure",
	};
	return map[stage];
}

// ──────────────────────────────────────────────────────────────────────────────
// Query / params schemas
// ──────────────────────────────────────────────────────────────────────────────

export const ServiceCaseIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type ServiceCaseIdParams = z.infer<typeof ServiceCaseIdParamsSchema>;

export const ListServiceCasesQuerySchema = z
	.object({
		clientId: ObjectIdSchema.optional(),
		currentStage: ServiceCaseStageSchema.optional(),
		search: z.string().max(100).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListServiceCasesQuery = z.infer<typeof ListServiceCasesQuerySchema>;

// ============================================================================
// Additional Types (missing and causing frontend errors)
// ============================================================================

/**
 * Dashboard summary for service cases
 */
export const DashboardServiceCaseSummarySchema = z.object({
	totalCases: z.number(),
	activeCases: z.number(),
	pendingApproval: z.number(),
	inProgress: z.number(),
	completedThisMonth: z.number(),
	revenue: z.number(),
});
export type DashboardServiceCaseSummary = z.infer<typeof DashboardServiceCaseSummarySchema>;
