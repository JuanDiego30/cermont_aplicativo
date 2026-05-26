import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Domain Command Names — SSOT for all explicit pipeline transitions
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Section 3B
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_COMMAND_NAME_VALUES = [
	// WorkRequest
	"SubmitWorkRequest",
	"QualifyWorkRequest",
	"RequireSiteVisit",
	"ConvertWorkRequestToProposal",
	"CancelWorkRequest",
	// SiteVisit
	"ScheduleSiteVisit",
	"CompleteSiteVisit",
	"ApproveSiteVisit",
	"CancelSiteVisit",
	// Proposal
	"SubmitProposal",
	"ApproveProposal",
	"RejectProposal",
	"ExpireProposal",
	"ConvertProposalToWorkOrder",
	// PurchaseOrderAuthorization
	"RegisterPurchaseOrder",
	"ValidatePurchaseOrder",
	"RejectPurchaseOrder",
	// WorkOrder
	"CreateWorkOrder",
	"AssignCrew",
	"ConfirmPlanning",
	"StartExecution",
	"BlockWorkOrder",
	"CompleteTechnicalExecution",
	"CloseWorkOrder",
	"ArchiveWorkOrder",
	// PlanningPacket
	"CreatePlanningPacket",
	"UpdatePlanningPacket",
	"ValidatePlanningReadiness",
	"ApprovePlanning",
	// ExecutionSession
	"CreateExecutionSession",
	"StartExecutionSession",
	"AddChecklistEntry",
	"AddEvidence",
	"RecordMaterialsUsed",
	"RecordLaborTime",
	"RecordEquipmentUsage",
	"RegisterIncident",
	"AddFieldObservation",
	"SignExecutionTechnician",
	"SignExecutionSupervisor",
	"FinishExecutionSession",
	"SyncExecutionSession",
	// TechnicalReport
	"CreateTechnicalReport",
	"GenerateTechnicalReport",
	"ReviewTechnicalReport",
	"ApproveTechnicalReport",
	"RejectTechnicalReport",
	"RegenerateTechnicalReportPdf",
	// DeliveryRecord
	"CreateDeliveryRecord",
	"SendDeliveryRecord",
	"SignDeliveryRecord",
	"RejectDeliveryRecord",
	"CancelDeliveryRecord",
	// ServiceEntrySheet
	"CreateServiceEntrySheet",
	"SubmitServiceEntrySheet",
	"ApproveServiceEntrySheet",
	"RejectServiceEntrySheet",
	"CancelServiceEntrySheet",
	"LinkInvoice",
	// Invoice
	"CreateInvoice",
	"SubmitInvoice",
	"AcceptInvoice",
	"RejectInvoice",
	"MarkInvoiceAsPartiallyPaid",
	"MarkInvoiceAsPaid",
	"CancelInvoice",
	// Payment
	"RegisterPayment",
	"ReconcilePayment",
	"RejectPaymentRecord",
] as const;

export const DomainCommandNameSchema = z.enum(DOMAIN_COMMAND_NAME_VALUES);
export type DomainCommandName = z.infer<typeof DomainCommandNameSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Command execution status (for outbox/queue tracking)
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_COMMAND_STATUS_VALUES = [
	"pending",
	"processing",
	"completed",
	"failed",
	"skipped",
] as const;

export const DomainCommandStatusSchema = z.enum(DOMAIN_COMMAND_STATUS_VALUES);
export type DomainCommandStatus = z.infer<typeof DomainCommandStatusSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// DomainCommand — typed command envelope
// clientMutationId enables idempotency for offline-first command outbox
// ──────────────────────────────────────────────────────────────────────────────

export const DomainCommandSchema = z
	.object({
		commandId: z.string().uuid(),
		clientMutationId: z.string().uuid(),
		command: DomainCommandNameSchema,
		entityType: z.string().min(1).max(80),
		entityId: ObjectIdSchema.optional(),
		actorId: ObjectIdSchema,
		actorRole: z.string().min(1).max(60),
		payload: z.record(z.string(), z.unknown()),
		status: DomainCommandStatusSchema.default("pending"),
		attempts: z.number().int().min(0).default(0),
		createdAt: z.string().datetime(),
		processedAt: z.string().datetime().optional(),
		failureReason: z.string().max(500).optional(),
	})
	.strict();

export type DomainCommand = z.infer<typeof DomainCommandSchema>;
