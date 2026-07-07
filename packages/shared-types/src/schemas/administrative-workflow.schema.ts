import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Technical Report ───
export const TechnicalReportStatusSchema = z.enum([
	"draft",
	"pending_review",
	"approved",
	"rejected",
	"cancelled",
]);

export const CreateTechnicalReportSchema = z
	.object({
		executionSessionId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		title: z.string().min(1).max(200),
		description: z.string().min(1).max(5000),
		findings: z.string().max(5000).optional(),
		recommendations: z.string().max(5000).optional(),
	})
	.strict();

export const TechnicalReportSchema = CreateTechnicalReportSchema.extend({
	_id: ObjectIdSchema,
	status: TechnicalReportStatusSchema.default("draft"),
	version: z.number().int().positive().default(1),
	evidenceIds: z.array(ObjectIdSchema).default([]),
	documentIds: z.array(ObjectIdSchema).default([]),
	signedById: ObjectIdSchema.optional(),
	signedAt: z.string().datetime().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}).strict();

// ─── Delivery Record ───
export const DeliveryRecordStatusSchema = z.enum([
	"draft",
	"sent",
	"signed",
	"rejected",
	"cancelled",
]);

export const CreateDeliveryRecordSchema = z
	.object({
		technicalReportId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		recipientName: z.string().min(1).max(200),
		recipientEmail: z.string().email().optional(),
		notes: z.string().max(2000).optional(),
	})
	.strict();

export const DeliveryRecordSchema = CreateDeliveryRecordSchema.extend({
	_id: ObjectIdSchema,
	status: DeliveryRecordStatusSchema.default("draft"),
	signedById: ObjectIdSchema.optional(),
	signedAt: z.string().datetime().optional(),
	signatureImageId: ObjectIdSchema.optional(),
	sentAt: z.string().datetime().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}).strict();

// ─── Service Entry Sheet (SES) ───
export const ServiceEntrySheetStatusSchema = z.enum([
	"draft",
	"submitted",
	"approved",
	"rejected",
	"cancelled",
]);

export const CreateServiceEntrySheetSchema = z
	.object({
		deliveryRecordId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		aribaReference: z.string().max(100).optional(),
		totalAmountCOP: z.number().nonnegative(),
	})
	.strict();

export const ServiceEntrySheetSchema = CreateServiceEntrySheetSchema.extend({
	_id: ObjectIdSchema,
	status: ServiceEntrySheetStatusSchema.default("draft"),
	approvedById: ObjectIdSchema.optional(),
	approvedAt: z.string().datetime().optional(),
	rejectedReason: z.string().max(1000).optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}).strict();

// ─── Invoice ───
export const InvoiceStatusSchema = z.enum([
	"draft",
	"submitted",
	"approved",
	"rejected",
	"cancelled",
	"paid",
]);

export const CreateInvoiceSchema = z
	.object({
		serviceEntrySheetId: ObjectIdSchema,
		orderId: ObjectIdSchema,
		invoiceNumber: z.string().min(1).max(50),
		totalAmountCOP: z.number().nonnegative(),
		taxAmountCOP: z.number().nonnegative().default(0),
		dueDate: z.string().datetime(),
	})
	.strict();

export const InvoiceSchema = CreateInvoiceSchema.extend({
	_id: ObjectIdSchema,
	status: InvoiceStatusSchema.default("draft"),
	approvedById: ObjectIdSchema.optional(),
	approvedAt: z.string().datetime().optional(),
	paidAt: z.string().datetime().optional(),
	paymentId: ObjectIdSchema.optional(),
	agingDays: z.number().int().nonnegative().default(0),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}).strict();

// ─── Payment ───
export const PaymentStatusSchema = z.enum([
	"pending",
	"completed",
	"reconciled",
	"rejected",
	"cancelled",
]);

export const RegisterPaymentSchema = z
	.object({
		invoiceId: ObjectIdSchema,
		amountCOP: z.number().positive(),
		paymentMethod: z.string().max(100),
		referenceNumber: z.string().max(100).optional(),
		paidAt: z.string().datetime(),
	})
	.strict();

export const PaymentSchema = RegisterPaymentSchema.extend({
	_id: ObjectIdSchema,
	status: PaymentStatusSchema.default("pending"),
	reconciledById: ObjectIdSchema.optional(),
	reconciledAt: z.string().datetime().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}).strict();
