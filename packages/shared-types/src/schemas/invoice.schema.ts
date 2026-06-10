import { z } from "zod";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

// ─── Basic Billing Schemas (migrated from service-entry-sheet.schema) ───

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

// ─── Invoice Status and Types ───

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
	"void",
	"DRAFT",
	"SENT",
	"APPROVED",
	"REJECTED",
	"PAID",
	"VOID",
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceDocumentTypeSchema = z.enum(["NIT", "CC", "CE", "PASAPORTE"]);
export type InvoiceDocumentType = z.infer<typeof InvoiceDocumentTypeSchema>;

export const InvoiceElectronicDocumentTypeSchema = z.enum(["FV", "NC", "ND"]);
export type InvoiceElectronicDocumentType = z.infer<typeof InvoiceElectronicDocumentTypeSchema>;

export const InvoicePaymentMethodSchema = z.enum([
	"TRANSFERENCIA",
	"CHEQUE",
	"EFECTIVO",
	"CREDITO",
]);
export type InvoicePaymentMethod = z.infer<typeof InvoicePaymentMethodSchema>;

export const InvoiceLineItemSchema = z
	.object({
		description: z.string().min(1).max(300),
		quantity: z.number().positive(),
		unitPrice: z.number().nonnegative(),
		discount: z.number().nonnegative().optional(),
		subtotal: z.number().nonnegative(),
	})
	.strict();
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

// ─── Main Invoice Schema ───

export const InvoiceSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().regex(/^INV-\d{4}-\d{4}$/),
		workOrderId: ObjectIdSchema,
		workOrderCode: z.string().optional(),
		serviceEntrySheetId: ObjectIdSchema.optional(),
		serviceEntrySheetCode: z.string().optional(),
		serviceCaseId: ObjectIdSchema.optional(),
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
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
		// Colombian electronic invoicing:
		seller: z
			.object({
				nit: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				phone: z.string().min(1).max(50),
				email: z.email(),
			})
			.strict()
			.optional(),
		buyer: z
			.object({
				documentType: InvoiceDocumentTypeSchema,
				documentNumber: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				email: z.email(),
			})
			.strict()
			.optional(),
		lineItems: z.array(InvoiceLineItemSchema).min(1).optional(),
		taxBase: z.number().nonnegative().optional(),
		ivaRate: z.number().min(0).max(1).optional(),
		ivaAmount: z.number().nonnegative().optional(),
		retentionRate: z.number().min(0).max(1).optional(),
		retentionAmount: z.number().nonnegative().optional(),
		cufe: z.string().max(200).optional(),
		qrCode: z.string().url().max(500).optional(),
		paymentMethod: InvoicePaymentMethodSchema.optional(),
		numeroResolucion: z.string().optional(),
		totalConIva: z.number().positive().optional(),
		retencionFuente: z.number().nonnegative().default(0).optional(),
		nitEmisor: z.string().optional(),
		nitReceptor: z.string().optional(),
		tipoDocumento: InvoiceElectronicDocumentTypeSchema.default("FV"),
	})
	.strip();

export type Invoice = z.infer<typeof InvoiceSchema>;
export const InvoiceOutputDtoSchema = InvoiceSchema;

export const CreateInvoiceSchema = z
	.object({
		workOrderId: ObjectIdSchema,
		serviceEntrySheetId: ObjectIdSchema.optional(),
		serviceCaseId: ObjectIdSchema.optional(),
		clientId: ObjectIdSchema,
		clientName: z.string().min(1).max(200),
		billingAccount: z.string().max(200).optional(),
		amount: z.number().nonnegative(),
		taxAmount: z.number().nonnegative().default(0),
		currency: z.string().length(3).default("COP"),
		notes: z.string().max(1000).optional(),
		// electronic invoicing fields:
		invoiceNumber: z.string().min(1).max(120).optional(),
		invoiceDate: z.coerce.date().optional(),
		dueDate: z.coerce.date().optional(),
		seller: z
			.object({
				nit: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				phone: z.string().min(1).max(50),
				email: z.email(),
			})
			.strict()
			.optional(),
		buyer: z
			.object({
				documentType: InvoiceDocumentTypeSchema,
				documentNumber: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				email: z.email(),
			})
			.strict()
			.optional(),
		lineItems: z.array(InvoiceLineItemSchema).min(1).optional(),
		subtotal: z.number().nonnegative().optional(),
		taxBase: z.number().nonnegative().optional(),
		ivaRate: z.number().min(0).max(1).optional(),
		ivaAmount: z.number().nonnegative().optional(),
		retentionRate: z.number().min(0).max(1).optional(),
		retentionAmount: z.number().nonnegative().optional(),
		total: z.number().nonnegative().optional(),
		cufe: z.string().max(200).optional(),
		qrCode: z.string().url().max(500).optional(),
		paymentMethod: InvoicePaymentMethodSchema.optional(),
		numeroResolucion: z.string().optional(),
		totalConIva: z.number().positive().optional(),
		retencionFuente: z.number().nonnegative().default(0).optional(),
		nitEmisor: z.string().optional(),
		nitReceptor: z.string().optional(),
		tipoDocumento: InvoiceElectronicDocumentTypeSchema.default("FV"),
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
		// electronic invoicing fields:
		seller: z
			.object({
				nit: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				phone: z.string().min(1).max(50),
				email: z.email(),
			})
			.optional(),
		buyer: z
			.object({
				documentType: InvoiceDocumentTypeSchema,
				documentNumber: z.string().min(1).max(30),
				businessName: z.string().min(1).max(200),
				address: z.string().min(1).max(300),
				email: z.email(),
			})
			.optional(),
		lineItems: z.array(InvoiceLineItemSchema).optional(),
		ivaRate: z.number().min(0).max(1).optional(),
		paymentMethod: InvoicePaymentMethodSchema.optional(),
		numeroResolucion: z.string().optional(),
		totalConIva: z.number().positive().optional(),
		retencionFuente: z.number().nonnegative().default(0).optional(),
		nitEmisor: z.string().optional(),
		nitReceptor: z.string().optional(),
		tipoDocumento: InvoiceElectronicDocumentTypeSchema.default("FV"),
	})
	.strict();

export type CreateOrderInvoiceInput = z.infer<typeof CreateOrderInvoiceSchema>;

export const MarkInvoicePaidSchema = z
	.object({
		paymentReference: z.string().min(1).max(100),
		paidAt: z.string().datetime(),
		amount: z.number().positive().optional(),
		clientMutationId: z.string().uuid().optional(),
	})
	.strict();

export type MarkInvoicePaidInput = z.infer<typeof MarkInvoicePaidSchema>;

export const InvoiceIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type InvoiceIdParams = z.infer<typeof InvoiceIdParamsSchema>;

export const ListInvoicesQuerySchema = z
	.object({
		status: z.preprocess(
			(value) => (Array.isArray(value) ? value.filter((v) => v !== "") : value),
			z.array(InvoiceStatusSchema).optional(),
		),
		workOrderId: z.preprocess(
			(value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
			ObjectIdSchema.optional(),
		),
		clientId: z.preprocess(
			(value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
			ObjectIdSchema.optional(),
		),
		search: z.preprocess(
			(value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
			z.string().max(100).optional(),
		),
		dateFrom: z.preprocess(
			(value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
			z.string().datetime().optional(),
		),
		dateTo: z.preprocess(
			(value) => (typeof value === "string" && value.trim().length === 0 ? undefined : value),
			z.string().datetime().optional(),
		),
		page: z
			.preprocess(
				(value) => (typeof value === "number" || typeof value === "string" ? Number(value) : value),
				z.coerce.number().int().min(1),
			)
			.default(1),
		limit: z
			.preprocess(
				(value) => (typeof value === "number" || typeof value === "string" ? Number(value) : value),
				z.coerce.number().int().min(1).max(100),
			)
			.default(20),
	})
	.strip();

export type ListInvoicesQuery = z.infer<typeof ListInvoicesQuerySchema>;

export interface InvoiceDocument<TID = string> extends MongooseDocument<TID> {
	code: string;
	workOrderId: TID;
	workOrderCode?: string;
	serviceEntrySheetId?: TID;
	serviceEntrySheetCode?: string;
	serviceCaseId?: TID;
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
		id?: TID;
		url: string;
		type: string;
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
	// Colombian electronic invoicing:
	seller?: {
		nit: string;
		businessName: string;
		address: string;
		phone: string;
		email: string;
	};
	buyer?: {
		documentType: InvoiceDocumentType;
		documentNumber: string;
		businessName: string;
		address: string;
		email: string;
	};
	lineItems?: Array<{
		description: string;
		quantity: number;
		unitPrice: number;
		discount?: number;
		subtotal: number;
	}>;
	taxBase?: number;
	ivaRate?: number;
	ivaAmount?: number;
	retentionRate?: number;
	retentionAmount?: number;
	cufe?: string;
	qrCode?: string;
	paymentMethod?: InvoicePaymentMethod;
	numeroResolucion?: string;
	totalConIva?: number;
	retencionFuente?: number;
	nitEmisor?: string;
	nitReceptor?: string;
	tipoDocumento?: InvoiceElectronicDocumentType;
}
