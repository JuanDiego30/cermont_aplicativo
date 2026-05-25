import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Domain Blocker Codes — SSOT for all pipeline blockers across Cermont
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Section 3C
// ──────────────────────────────────────────────────────────────────────────────

const DOMAIN_BLOCKER_CODE_VALUES = [
	"MISSING_SITE_VISIT",
	"MISSING_PO",
	"MISSING_CREW_ASSIGNMENT",
	"MISSING_KIT_TEMPLATE",
	"MISSING_TOOLS",
	"MISSING_EQUIPMENT",
	"MISSING_HSE_CERTIFICATION",
	"EXPIRED_CERTIFICATION",
	"MISSING_AST",
	"MISSING_PTW",
	"MISSING_SUPPORT_DOCUMENT",
	"MISSING_BEFORE_PHOTO",
	"MISSING_AFTER_PHOTO",
	"MISSING_MATERIALS_USED",
	"MISSING_LABOR_TIME",
	"MISSING_TECHNICAL_SIGNATURE",
	"MISSING_SUPERVISOR_SIGNATURE",
	"MISSING_TECHNICAL_REPORT",
	"TECHNICAL_REPORT_REJECTED",
	"MISSING_CLIENT_SIGNATURE",
	"DELIVERY_RECORD_REJECTED",
	"SES_NOT_CREATED",
	"SES_REJECTED",
	"SES_NOT_APPROVED",
	"INVOICE_NOT_CREATED",
	"INVOICE_REJECTED",
	"PAYMENT_REFERENCE_REQUIRED",
	"PAYMENT_OVERDUE",
	"ARCHIVE_NOT_ALLOWED",
	"MISSING_STEP_REQUIRED_DOCUMENT",
	"MISSING_STEP_REQUIRED_EVIDENCE",
	"MISSING_DYNAMIC_FORM_RESPONSE",
	"TEMPLATE_RESPONSE_NOT_VALIDATED",
	"CLOSING_PACKAGE_INCOMPLETE",
	"INVOICE_NOT_APPROVED",
	"PAYMENT_NOT_RECONCILED",
] as const;

export const DomainBlockerCodeSchema = z.enum(DOMAIN_BLOCKER_CODE_VALUES);
export type DomainBlockerCode = z.infer<typeof DomainBlockerCodeSchema>;

const DOMAIN_BLOCKER_SEVERITY_VALUES = ["blocking", "warning", "info"] as const;

export const DomainBlockerSeveritySchema = z.enum(DOMAIN_BLOCKER_SEVERITY_VALUES);
export type DomainBlockerSeverity = z.infer<typeof DomainBlockerSeveritySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Artifact type that a blocker references
// ──────────────────────────────────────────────────────────────────────────────

const BLOCKER_ARTIFACT_TYPE_VALUES = [
	"WorkRequest",
	"SiteVisit",
	"Proposal",
	"PurchaseOrderAuthorization",
	"WorkOrder",
	"PlanningPacket",
	"ExecutionSession",
	"TechnicalReport",
	"DeliveryRecord",
	"ServiceEntrySheet",
	"Invoice",
	"Payment",
] as const;

export const BlockerArtifactTypeSchema = z.enum(BLOCKER_ARTIFACT_TYPE_VALUES);
export type BlockerArtifactType = z.infer<typeof BlockerArtifactTypeSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// DomainBlocker — single blocking condition in the pipeline
// ──────────────────────────────────────────────────────────────────────────────

export const DomainBlockerSchema = z
	.object({
		code: DomainBlockerCodeSchema,
		severity: DomainBlockerSeveritySchema,
		message: z.string().min(1).max(500),
		ownerRole: UserRoleSchema,
		recommendedAction: z.string().min(1).max(300),
		artifactType: BlockerArtifactTypeSchema,
		artifactId: ObjectIdSchema.optional(),
		stepCode: CermontOperationalStepCodeSchema.optional(),
		field: z.string().min(1).max(120).optional(),
	})
	.strict();

export type DomainBlocker = z.infer<typeof DomainBlockerSchema>;
