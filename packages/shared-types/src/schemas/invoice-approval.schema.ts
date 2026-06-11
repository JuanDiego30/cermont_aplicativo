import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Invoice Approval — Paso 13: Workflow de aprobación de facturas
// Portal cliente para aprobar/rechazar, notificaciones, razones estructuradas
// ──────────────────────────────────────────────────────────────────────────────

export const InvoiceApprovalStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"]);
export type InvoiceApprovalStatus = z.infer<typeof InvoiceApprovalStatusSchema>;

export const InvoiceRejectionReasonSchema = z.enum([
	"amount_incorrect",
	"service_not_completed",
	"missing_supporting_documents",
	"duplicate_invoice",
	"contractual_discrepancy",
	"tax_info_incorrect",
	"other",
]);
export type InvoiceRejectionReason = z.infer<typeof InvoiceRejectionReasonSchema>;

/**
 * Invoice Approval Request
 * Represents a request sent to the client for invoice approval
 */
export const InvoiceApprovalSchema = z
	.object({
		_id: ObjectIdSchema,
		invoiceId: ObjectIdSchema,
		workOrderId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		clientEmail: z.email().optional(),
		requestedBy: ObjectIdSchema,
		requestedAt: z.string().datetime(),
		status: InvoiceApprovalStatusSchema,
		approvedAt: z.string().datetime().optional(),
		approvedBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectionReason: InvoiceRejectionReasonSchema.optional(),
		rejectionDetails: z.string().max(1000).optional(),
		correctedAt: z.string().datetime().optional(),
		correctedBy: ObjectIdSchema.optional(),
		correctionNotes: z.string().max(1000).optional(),
		notifiedAt: z.string().datetime().optional(),
		reminderSentAt: z.array(z.string().datetime()).default([]),
		expiresAt: z.string().datetime().optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type InvoiceApproval = z.infer<typeof InvoiceApprovalSchema>;

// ─── Input Schemas ──────────────────────────────────────────────────────────

export const RequestInvoiceApprovalSchema = z
	.object({
		invoiceId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		clientEmail: z.email().optional(),
		expiresAt: z.string().datetime().optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RequestInvoiceApprovalInput = z.infer<typeof RequestInvoiceApprovalSchema>;

export const ApproveInvoiceApprovalSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type ApproveInvoiceApprovalInput = z.infer<typeof ApproveInvoiceApprovalSchema>;

export const RejectInvoiceApprovalSchema = z
	.object({
		reason: InvoiceRejectionReasonSchema,
		details: z.string().max(1000).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RejectInvoiceApprovalInput = z.infer<typeof RejectInvoiceApprovalSchema>;

export const CorrectInvoiceApprovalSchema = z
	.object({
		correctionNotes: z.string().min(1).max(1000),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type CorrectInvoiceApprovalInput = z.infer<typeof CorrectInvoiceApprovalSchema>;

export const InvoiceApprovalIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

export type InvoiceApprovalIdParams = z.infer<typeof InvoiceApprovalIdParamsSchema>;

export const ListInvoiceApprovalsQuerySchema = z
	.object({
		invoiceId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema.optional(),
		status: InvoiceApprovalStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListInvoiceApprovalsQuery = z.infer<typeof ListInvoiceApprovalsQuerySchema>;

// ─── Mongoose Document interface ────────────────────────────────────────────

export interface InvoiceApprovalDocument<TID = string> {
	_id: TID;
	invoiceId: TID;
	workOrderId: TID;
	clientId: TID;
	clientName: string;
	clientEmail?: string;
	requestedBy: TID;
	requestedAt: Date;
	status: InvoiceApprovalStatus;
	approvedAt?: Date;
	approvedBy?: TID;
	rejectedAt?: Date;
	rejectedBy?: TID;
	rejectionReason?: InvoiceRejectionReason;
	rejectionDetails?: string;
	correctedAt?: Date;
	correctedBy?: TID;
	correctionNotes?: string;
	notifiedAt?: Date;
	reminderSentAt: Date[];
	expiresAt?: Date;
	metadata?: Record<string, unknown>;
	createdAt: Date;
	updatedAt: Date;
}
