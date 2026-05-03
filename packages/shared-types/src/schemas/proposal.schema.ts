import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";
import { OrderPrioritySchema, OrderTypeSchema } from "./order.schema";

export const ProposalStatusSchema = z.enum(["draft", "sent", "approved", "rejected", "expired"]);
export type ProposalStatus = z.infer<typeof ProposalStatusSchema>;

export const ProposalItemInputSchema = z
	.object({
		description: z.string().min(1).max(300),
		unit: z.string().min(1).max(50),
		quantity: z.number().positive(),
		unitCost: z.number().nonnegative(),
	})
	.strict();

export type ProposalItemInput = z.infer<typeof ProposalItemInputSchema>;

export const ProposalItemSchema = ProposalItemInputSchema.extend({
	total: z.number().nonnegative(),
}).strip();

export type ProposalItem = z.infer<typeof ProposalItemSchema>;

export const ProposalOutputDtoSchema = z
	.object({
		_id: ObjectIdSchema,
		code: z.string().regex(/^PROP-\d{4}-\d{4}$/),
		title: z.string().min(5).max(200),
		clientName: z.string().min(2).max(200),
		clientEmail: z.string().email().optional(),
		status: ProposalStatusSchema,
		validUntil: z.string().datetime(),
		items: z.array(ProposalItemSchema).min(1),
		subtotal: z.number().nonnegative(),
		taxRate: z.number().min(0).max(1).default(0.19),
		total: z.number().nonnegative(),
		notes: z.string().max(2000).optional(),
		poNumber: z.string().trim().optional(),
		createdBy: ObjectIdSchema,
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		generatedOrders: z.array(ObjectIdSchema).default([]),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export const ProposalSchema = ProposalOutputDtoSchema;
export type Proposal = z.infer<typeof ProposalOutputDtoSchema>;

export const CreateProposalSchema = z
	.object({
		title: z.string().min(5).max(200),
		clientName: z.string().min(2).max(200),
		clientEmail: z.string().email().optional(),
		items: z.array(ProposalItemInputSchema).min(1),
		validUntil: z.string().datetime(),
		notes: z.string().max(2000).optional(),
	})
	.strict();

export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;

export const UpdateProposalStatusSchema = z
	.object({
		status: z.enum(["sent", "approved", "rejected"]),
		poNumber: z.string().trim().optional(),
	})
	.strict();

export type UpdateProposalStatusInput = z.infer<typeof UpdateProposalStatusSchema>;

export const ApproveProposalSchema = z
	.object({
		poNumber: z.string().trim().optional(),
	})
	.strict();

export type ApproveProposalInput = z.infer<typeof ApproveProposalSchema>;

export const RejectProposalSchema = z.object({}).strict();
export type RejectProposalInput = z.infer<typeof RejectProposalSchema>;

export const ProposalIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type ProposalIdParams = z.infer<typeof ProposalIdSchema>;

export const ProposalOrderIdParamsSchema = z
	.object({
		order_id: ObjectIdSchema,
	})
	.strict();

export type ProposalOrderIdParams = z.infer<typeof ProposalOrderIdParamsSchema>;

export const ListProposalsQuerySchema = z
	.object({
		status: z.preprocess(normalizeOptionalStringQueryValue, ProposalStatusSchema.optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).optional()),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(50),
		offset: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(0).optional()),
	})
	.strip();

export type ListProposalsQuery = z.infer<typeof ListProposalsQuerySchema>;

export const ConvertProposalToOrderSchema = z
	.object({
		type: OrderTypeSchema,
		priority: OrderPrioritySchema,
		assetId: z.string().min(1),
		assetName: z.string().min(1).max(200),
		location: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
	})
	.strict();

export type ConvertProposalToOrderInput = z.infer<typeof ConvertProposalToOrderSchema>;

/**
 * Mongoose Document representation for Proposal.
 * Used for type safety in backend services and repositories.
 */
export interface ProposalDocument<TID = string> extends MongooseDocument<TID> {
	code: string;
	title: string;
	clientName: string;
	clientEmail?: string;
	status: ProposalStatus;
	validUntil: Date;
	items: ProposalItem[];
	subtotal: number;
	taxRate: number;
	total: number;
	notes?: string;
	poNumber?: string;
	createdBy: TID;
	approvedBy?: TID;
	approvedAt?: Date;
	generatedOrders: TID[];
}
