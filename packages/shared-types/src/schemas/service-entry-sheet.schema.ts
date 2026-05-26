import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

/**
 * Service Entry Sheet (SES) / Ariba Status
 * Represents the lifecycle from SES creation to payment
 */
export const ServiceEntrySheetStatusSchema = z.enum([
	"not_created",
	"draft",
	"created",
	"submitted",
	"approved",
	"rejected",
	"cancelled",
]);
export type ServiceEntrySheetStatus = z.infer<typeof ServiceEntrySheetStatusSchema>;

/**
 * Invoice Status
 */
export const InvoiceStatusSchema = z.enum([
	"draft",
	"issued",
	"sent",
	"submitted",
	"approved",
	"accepted",
	"rejected",
	"partially_paid",
	"paid",
	"cancelled",
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const BillingCurrencySchema = z.enum(["COP", "USD", "EUR"]);
export type BillingCurrency = z.infer<typeof BillingCurrencySchema>;

export const BillingAttachmentSchema = z
	.object({
		id: ObjectIdSchema.optional(),
		url: z.string().url(),
		type: z.enum(["pdf", "image", "document"]),
		name: z.string().min(1).max(200),
		uploadedAt: z.string().datetime().optional(),
	})
	.strip();

export const BillingTaxLineSchema = z
	.object({
		name: z.string().min(1).max(120),
		rate: z.number().min(0).max(1),
		amount: z.number().nonnegative(),
	})
	.strict();

export const BillingServiceLineSchema = z
	.object({
		description: z.string().min(1).max(300),
		quantity: z.number().positive(),
		unit: z.string().min(1).max(50),
		unitPrice: z.number().nonnegative(),
		total: z.number().nonnegative(),
	})
	.strict();

export const BillingCommandHistoryEntrySchema = z
	.object({
		clientMutationId: z.string().uuid(),
		command: z.string().min(1).max(80),
		recordedAt: z.string().datetime(),
	})
	.strict();

/**
 * Service Entry Sheet Output DTO
 */
export const ServiceEntrySheetOutputDtoSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().regex(/^SES-\d{4}-\d{4}$/),
		workOrderId: ObjectIdSchema,
		workOrderCode: z.string().optional(),
		deliveryRecordId: ObjectIdSchema.optional(),
		technicalReportId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema,
		clientName: z.string(),
		billingAccount: z.string().optional(),
		aribaReference: z.string().optional(),
		aribaDocumentNumber: z.string().max(120).optional(),
		submittedAt: z.string().datetime().optional(),
		submittedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		approvedBy: ObjectIdSchema.optional(),
		approverReference: z.string().max(160).optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectionReason: z.string().max(500).optional(),
		amount: z.number().nonnegative(),
		currency: BillingCurrencySchema.default("COP"),
		taxAmount: z.number().nonnegative().default(0),
		totalAmount: z.number().nonnegative(),
		serviceLines: z.array(BillingServiceLineSchema).default([]),
		subtotal: z.number().nonnegative().optional(),
		taxLines: z.array(BillingTaxLineSchema).default([]),
		total: z.number().nonnegative().optional(),
		description: z.string().max(1000).optional(),
		status: ServiceEntrySheetStatusSchema,
		attachments: z.array(BillingAttachmentSchema).default([]),
		commandHistory: z.array(BillingCommandHistoryEntrySchema).default([]),
		createdBy: ObjectIdSchema,
		updatedBy: ObjectIdSchema.optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export type ServiceEntrySheet = z.infer<typeof ServiceEntrySheetOutputDtoSchema>;

/**
 * Create Service Entry Sheet Input
 */
export const CreateServiceEntrySheetSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		billingAccount: z.string().max(200).optional(),
		amount: z.number().nonnegative(),
		currency: z.string().length(3).default("COP"),
		taxAmount: z.number().nonnegative().default(0),
		description: z.string().max(1000).optional(),
	})
	.strict();

export type CreateServiceEntrySheetInput = z.infer<typeof CreateServiceEntrySheetSchema>;

export const CreateOrderServiceEntrySheetSchema = z
	.object({
		aribaDocumentNumber: z.string().trim().min(1).max(120).optional(),
		serviceLines: z.array(BillingServiceLineSchema).min(1),
		subtotal: z.number().nonnegative(),
		taxLines: z.array(BillingTaxLineSchema).default([]),
		total: z.number().positive(),
		currency: BillingCurrencySchema.default("COP"),
		description: z.string().max(1000).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type CreateOrderServiceEntrySheetInput = z.infer<typeof CreateOrderServiceEntrySheetSchema>;

/**
 * Submit SES for approval
 */
export const SubmitServiceEntrySheetSchema = z
	.object({
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type SubmitServiceEntrySheetInput = z.infer<typeof SubmitServiceEntrySheetSchema>;

/**
 * Approve SES
 */
export const ApproveServiceEntrySheetSchema = z
	.object({
		approverReference: z.string().trim().min(1).max(160).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();
export type ApproveServiceEntrySheetInput = z.infer<typeof ApproveServiceEntrySheetSchema>;

/**
 * Reject SES
 */
export const RejectServiceEntrySheetSchema = z
	.object({
		reason: z.string().min(10).max(500),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type RejectServiceEntrySheetInput = z.infer<typeof RejectServiceEntrySheetSchema>;

/**
 * Service Entry Sheet ID Params
 */
export const ServiceEntrySheetIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type ServiceEntrySheetIdParams = z.infer<typeof ServiceEntrySheetIdParamsSchema>;

/**
 * List Service Entry Sheets Query
 */
export const ListServiceEntrySheetsQuerySchema = z
	.object({
		status: z.preprocess(
			(value) => (Array.isArray(value) ? value.filter((v) => v !== "") : value),
			z.array(ServiceEntrySheetStatusSchema).optional(),
		),
		workOrderId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		clientId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		dateFrom: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		dateTo: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();

export type ListServiceEntrySheetsQuery = z.infer<typeof ListServiceEntrySheetsQuerySchema>;

/**
 * Invoice Output DTO
 */
export const InvoiceOutputDtoSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().regex(/^INV-\d{4}-\d{4}$/),
		workOrderId: ObjectIdSchema,
		workOrderCode: z.string().optional(),
		serviceEntrySheetId: ObjectIdSchema.optional(),
		serviceEntrySheetCode: z.string().optional(),
		clientId: ObjectIdSchema,
		clientName: z.string(),
		billingAccount: z.string().optional(),
		invoiceNumber: z.string().optional(),
		amount: z.number().nonnegative(),
		taxAmount: z.number().nonnegative().default(0),
		totalAmount: z.number().nonnegative(),
		currency: BillingCurrencySchema.default("COP"),
		issuedAt: z.string().datetime().optional(),
		sentAt: z.string().datetime().optional(),
		submittedAt: z.string().datetime().optional(),
		submittedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		approvedBy: ObjectIdSchema.optional(),
		acceptedAt: z.string().datetime().optional(),
		acceptedBy: ObjectIdSchema.optional(),
		rejectedAt: z.string().datetime().optional(),
		rejectedBy: ObjectIdSchema.optional(),
		rejectionReason: z.string().max(500).optional(),
		paidAt: z.string().datetime().optional(),
		paymentReference: z.string().max(100).optional(),
		issueDate: z.string().datetime().optional(),
		dueDate: z.string().datetime().optional(),
		invoiceLines: z.array(BillingServiceLineSchema).default([]),
		taxBreakdown: z.array(BillingTaxLineSchema).default([]),
		subtotal: z.number().nonnegative().optional(),
		total: z.number().nonnegative().optional(),
		status: InvoiceStatusSchema,
		attachments: z.array(BillingAttachmentSchema).default([]),
		commandHistory: z.array(BillingCommandHistoryEntrySchema).default([]),
		notes: z.string().max(1000).optional(),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export type Invoice = z.infer<typeof InvoiceOutputDtoSchema>;

/**
 * Create Invoice Input
 */
export const CreateInvoiceSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		serviceEntrySheetId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		billingAccount: z.string().max(200).optional(),
		amount: z.number().nonnegative(),
		taxAmount: z.number().nonnegative().default(0),
		currency: z.string().length(3).default("COP"),
		notes: z.string().max(1000).optional(),
	})
	.strict();

export type CreateInvoiceInput = z.infer<typeof CreateInvoiceSchema>;

export const CreateOrderInvoiceSchema = z
	.object({
		invoiceNumber: z.string().trim().min(1).max(120).optional(),
		issueDate: z.string().datetime(),
		dueDate: z.string().datetime(),
		billingAccount: z.string().trim().min(1).max(200).optional(),
		notes: z.string().max(1000).optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type CreateOrderInvoiceInput = z.infer<typeof CreateOrderInvoiceSchema>;

/**
 * Mark Invoice as Paid
 */
export const MarkInvoicePaidSchema = z
	.object({
		paymentReference: z.string().min(1).max(100),
		paidAt: z.string().datetime(),
		amount: z.number().positive().optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type MarkInvoicePaidInput = z.infer<typeof MarkInvoicePaidSchema>;

/**
 * Invoice ID Params
 */
export const InvoiceIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type InvoiceIdParams = z.infer<typeof InvoiceIdParamsSchema>;

/**
 * List Invoices Query
 */
export const ListInvoicesQuerySchema = z
	.object({
		status: z.preprocess(
			(value) => (Array.isArray(value) ? value.filter((v) => v !== "") : value),
			z.array(InvoiceStatusSchema).optional(),
		),
		workOrderId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		clientId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		search: z.preprocess(normalizeOptionalStringQueryValue, z.string().max(100).optional()),
		dateFrom: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		dateTo: z.preprocess(normalizeOptionalStringQueryValue, z.string().datetime().optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();

export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;

/**
 * Mongoose Document representations
 */
export interface ServiceEntrySheetDocument<TID = string> extends MongooseDocument<TID> {
	code: string;
	workOrderId?: TID;
	workOrderCode?: string;
	deliveryRecordId?: TID;
	technicalReportId?: TID;
	clientId: TID;
	clientName: string;
	billingAccount?: string;
	aribaReference?: string;
	aribaDocumentNumber?: string;
	submittedAt?: Date;
	submittedBy?: TID;
	approvedAt?: Date;
	approvedBy?: TID;
	approverReference?: string;
	rejectedAt?: Date;
	rejectedBy?: TID;
	rejectionReason?: string;
	amount: number;
	currency: string;
	taxAmount: number;
	totalAmount: number;
	serviceLines: Array<{
		description: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		total: number;
	}>;
	subtotal?: number;
	taxLines: Array<{
		name: string;
		rate: number;
		amount: number;
	}>;
	total?: number;
	description?: string;
	status: ServiceEntrySheetStatus;
	attachments: Array<{
		id: TID;
		url: string;
		type: "pdf" | "image" | "document";
		name: string;
		uploadedAt: Date;
	}>;
	commandHistory: Array<{
		clientMutationId: string;
		command: string;
		recordedAt: Date;
	}>;
	createdBy: TID;
	updatedBy?: TID;
}

export interface InvoiceDocument<TID = string> extends MongooseDocument<TID> {
	code: string;
	workOrderId: TID;
	workOrderCode?: string;
	serviceEntrySheetId?: TID;
	serviceEntrySheetCode?: string;
	clientId: TID;
	clientName: string;
	billingAccount?: string;
	invoiceNumber?: string;
	amount: number;
	taxAmount: number;
	totalAmount: number;
	currency: string;
	issuedAt?: Date;
	sentAt?: Date;
	submittedAt?: Date;
	submittedBy?: TID;
	approvedAt?: Date;
	approvedBy?: TID;
	acceptedAt?: Date;
	acceptedBy?: TID;
	rejectedAt?: Date;
	rejectedBy?: TID;
	rejectionReason?: string;
	paidAt?: Date;
	paymentReference?: string;
	issueDate?: Date;
	dueDate?: Date;
	invoiceLines: Array<{
		description: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		total: number;
	}>;
	taxBreakdown: Array<{
		name: string;
		rate: number;
		amount: number;
	}>;
	subtotal?: number;
	total?: number;
	status: InvoiceStatus;
	attachments: Array<{
		id: TID;
		url: string;
		type: "pdf" | "image";
		name: string;
		uploadedAt: Date;
	}>;
	commandHistory: Array<{
		clientMutationId: string;
		command: string;
		recordedAt: Date;
	}>;
	notes?: string;
	createdBy: TID;
}
