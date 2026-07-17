import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ──────────────────────────────────────────────────────────────────────────────
// Payment — Standalone entity for reconciliation
// Replaces the paymentReference string field inside ServiceEntrySheet.
// Reference: docs/audits/DOMAIN_PIPELINE_REMEDIATION_PLAN.md — Section 2A
// ──────────────────────────────────────────────────────────────────────────────

const PAYMENT_STATUS_VALUES = ["not_due", "due", "recorded", "reconciled", "rejected"] as const;

export const PaymentStatusSchema = z.enum(PAYMENT_STATUS_VALUES);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

const PAYMENT_METHOD_VALUES = ["bank_transfer", "check", "electronic", "cash", "other"] as const;

export const PaymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

const PAYMENT_CURRENCY_VALUES = ["COP", "USD", "EUR"] as const;

export const PaymentCurrencySchema = z.enum(PAYMENT_CURRENCY_VALUES);
export type PaymentCurrency = z.infer<typeof PaymentCurrencySchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Main entity
// ──────────────────────────────────────────────────────────────────────────────

export const PaymentSchema = z
	.object({
		_id: ObjectIdSchema,
		invoiceId: ObjectIdSchema,
		workOrderId: ObjectIdSchema,
		serviceEntrySheetId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		paymentReference: z.string().min(1).max(100),
		paidAt: z.string().datetime(),
		amount: z.number().positive(),
		currency: PaymentCurrencySchema,
		paymentMethod: PaymentMethodSchema,
		bankReference: z.string().max(150).optional(),
		supportingDocument: z.string().max(500).optional(),
		supportingDocumentUrl: z.string().url().optional(),
		recordedBy: ObjectIdSchema,
		recordedAt: z.string().datetime(),
		reconciledBy: ObjectIdSchema.optional(),
		reconciledAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectionReason: z.string().max(500).optional(),
		reconciliationNotes: z.string().max(500).optional(),
		commandHistory: z
			.array(
				z
					.object({
						clientMutationId: z.string().uuid(),
						command: z.string().min(1).max(80),
						recordedAt: z.string().datetime(),
					})
					.strict(),
			)
			.default([]),
		status: PaymentStatusSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type Payment = z.infer<typeof PaymentSchema>;

// ──────────────────────────────────────────────────────────────────────────────
// Command schemas
// ──────────────────────────────────────────────────────────────────────────────

export const RegisterPaymentSchema = z
	.object({
		invoiceId: ObjectIdSchema.optional(),
		paymentReference: z.string().min(1).max(100),
		paidAt: z.string().datetime(),
		amount: z.number().positive(),
		currency: PaymentCurrencySchema.optional(),
		paymentMethod: PaymentMethodSchema.default("bank_transfer"),
		bankReference: z.string().max(150).optional(),
		supportingDocument: z.string().max(500).optional(),
		supportingDocumentUrl: z.string().url().optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RegisterPaymentInput = z.infer<typeof RegisterPaymentSchema>;

export const RegisterInvoicePaymentSchema = RegisterPaymentSchema.omit({ invoiceId: true });
export type RegisterInvoicePaymentInput = z.infer<typeof RegisterInvoicePaymentSchema>;

export const ReconcilePaymentSchema = z
	.object({
		notes: z.string().max(500).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type ReconcilePaymentInput = z.infer<typeof ReconcilePaymentSchema>;

export const RejectPaymentRecordSchema = z
	.object({
		rejectionReason: z.string().min(5).max(500),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RejectPaymentRecordInput = z.infer<typeof RejectPaymentRecordSchema>;

export const ListPaymentsQuerySchema = z
	.object({
		invoiceId: ObjectIdSchema.optional(),
		workOrderId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema.optional(),
		status: PaymentStatusSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strip();

export type ListPaymentsQuery = z.infer<typeof ListPaymentsQuerySchema>;

export const PaymentIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();
export type PaymentIdParams = z.infer<typeof PaymentIdParamsSchema>;

// ─── Dashboard / Aging types ──────────────────────────────────────────

export const PaymentAgingEntrySchema = z.object({
	invoiceId: z.string(),
	clientName: z.string(),
	invoiceNumber: z.string().optional(),
	totalAmount: z.number().nonnegative(),
	paidAmount: z.number().nonnegative(),
	outstanding: z.number().nonnegative(),
	pendingAmount: z.number().nonnegative(),
	total: z.number().nonnegative(),
	bucket: z.string(),
	agingBucket: z.string(),
	issueDate: z.string().optional(),
	dueDate: z.string(),
	daysOverdue: z.number().int(),
	invoiceCode: z.string().optional(),
	count: z.number().int().nonnegative().optional(),
});
export type PaymentAgingEntry = z.infer<typeof PaymentAgingEntrySchema>;

export const PaymentDashboardSchema = z.object({
	totalInvoiced: z.number().nonnegative(),
	totalCollected: z.number().nonnegative(),
	totalPending: z.number().nonnegative(),
	totalOverdue: z.number().nonnegative(),
	collectionRate: z.number().min(0).max(100),
	averagePaymentDays: z.number().nonnegative(),
	agingBuckets: z.array(PaymentAgingEntrySchema),
});
export type PaymentDashboard = z.infer<typeof PaymentDashboardSchema>;
