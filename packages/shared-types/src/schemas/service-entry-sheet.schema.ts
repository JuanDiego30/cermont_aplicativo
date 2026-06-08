import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";
import {
	BillingAttachmentSchema,
	BillingCommandHistoryEntrySchema,
	BillingCurrencySchema,
	BillingServiceLineSchema,
	BillingTaxLineSchema,
} from "./invoice.schema";

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

// InvoiceStatusSchema, InvoiceStatus, and all other invoice types are imported from `./invoice.schema`

// BillingCurrencySchema, BillingCurrency, BillingAttachmentSchema, BillingTaxLineSchema, BillingServiceLineSchema, and BillingCommandHistoryEntrySchema are imported from `./invoice.schema`

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

// All invoice schemas and DTOs have been migrated to `./invoice.schema`

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

// InvoiceDocument has been migrated to `./invoice.schema`
