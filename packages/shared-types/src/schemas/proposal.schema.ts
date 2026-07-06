import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { OrderPrioritySchema, OrderTypeSchema } from "./order.schema";

const normalizeQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

const normalizeOptionalStringQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized !== "string") {
		return normalized;
	}

	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const ProposalStatusSchema = z.enum([
	"draft",
	"sent",
	"approved",
	"rejected",
	"expired",
	"converted",
]);
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
		clientEmail: z.email().optional(),
		status: ProposalStatusSchema,
		validUntil: z.string().datetime(),
		items: z.array(ProposalItemSchema).min(1),
		subtotal: z.number().nonnegative(),
		taxRate: z.number().min(0).max(1).default(0.19),
		total: z.number().nonnegative(),
		notes: z.string().max(2000).optional(),
		createdBy: ObjectIdSchema,
		approvedBy: ObjectIdSchema.optional(),
		approvedAt: z.string().datetime().optional(),
		generatedOrders: z.array(ObjectIdSchema).default([]),
		serviceCaseId: z.string().optional(),
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
		clientEmail: z.email().optional(),
		items: z.array(ProposalItemInputSchema).min(1),
		validUntil: z.string().datetime(),
		notes: z.string().max(2000).optional(),
		serviceCaseId: z
			.string()
			.regex(/^[a-f\d]{24}$/i)
			.optional(),
	})
	.strict();

export type CreateProposalInput = z.infer<typeof CreateProposalSchema>;

export const UpdateProposalStatusSchema = z
	.object({
		status: z.enum(["sent", "approved", "rejected"]),
		notes: z.string().max(500).optional(),
		approvedAt: z.string().datetime().optional(),
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

export const CreateProposalInputSchema = z
	.object({
		client: z.string().min(1, "El cliente es requerido"),
		description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
		estimatedValue: z.number().min(1, "El valor estimado debe ser mayor a 0"),
		orderId: z.string().optional(),
		serviceCaseId: z
			.string()
			.regex(/^[a-f\d]{24}$/i)
			.optional(),
	})
	.strict();

export type CreateProposalFormInput = z.infer<typeof CreateProposalInputSchema>;
