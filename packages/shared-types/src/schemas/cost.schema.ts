import { z } from "zod";

export const CostCategorySchema = z.enum([
	"labor",
	"materials",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"tax",
	"other",
]);
export type CostCategory = z.infer<typeof CostCategorySchema>;

export const CostDataStateSchema = z.enum([
	"NO_DATA",
	"ESTIMATED_ONLY",
	"ACTUAL_ONLY",
	"ESTIMATED_AND_ACTUAL",
	"INVOICED",
	"PAID",
]);
export type CostDataState = z.infer<typeof CostDataStateSchema>;

export const CostByCategorySchema = z.object({
	category: CostCategorySchema,
	estimated: z.number(),
	actual: z.number(),
	tax: z.number(),
	variance: z.number(),
	dataState: CostDataStateSchema,
});
export type CostByCategory = z.infer<typeof CostByCategorySchema>;

export const CreateCostSchema = z.object({
	orderId: z.string().min(1),
	category: CostCategorySchema,
	description: z.string().min(1).max(200),
	estimatedAmount: z.number().min(0),
	actualAmount: z.number().min(0),
	taxAmount: z.number().min(0).default(0),
	taxRate: z.number().min(0).max(1).default(0),
	currency: z.string().default("COP"),
	notes: z.string().max(500).optional(),
});
export type CreateCostInput = z.infer<typeof CreateCostSchema>;

export const UpdateCostSchema = CreateCostSchema.omit({
	orderId: true,
}).partial();
export type UpdateCostInput = z.infer<typeof UpdateCostSchema>;

export const CostIdSchema = z.object({
	id: z.string().min(1),
});
export type CostIdInput = z.infer<typeof CostIdSchema>;

export const CostOrderIdSchema = z.object({
	orderId: z.string().min(1),
});
export type CostOrderIdInput = z.infer<typeof CostOrderIdSchema>;

export const ListCostsQuerySchema = z.object({
	orderId: z.string().min(1).optional(),
	category: CostCategorySchema.optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListCostsQuery = z.infer<typeof ListCostsQuerySchema>;

export const CostSummarySchema = z.object({
	orderId: z.string(),
	totalEstimated: z.number(),
	totalActual: z.number(),
	totalTax: z.number(),
	variance: z.number(),
	variancePercent: z.number().nullable(),
	hasCosts: z.boolean(),
	dataState: CostDataStateSchema,
	byCategory: z.array(CostByCategorySchema),
});
export type CostSummary = z.infer<typeof CostSummarySchema>;

export const CostSchema = z.object({
	_id: z.string(),
	orderId: z.string(),
	category: CostCategorySchema,
	description: z.string().min(1).max(200),
	estimatedAmount: z.number().min(0),
	actualAmount: z.number().min(0),
	taxAmount: z.number().min(0),
	taxRate: z.number().min(0).max(1),
	currency: z.string(),
	notes: z.string().max(500).optional(),
	recordedBy: z.string(),
	recordedAt: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});
export type Cost = z.infer<typeof CostSchema>;

export const CostLineDeltaStatusSchema = z.enum([
	"under_budget",
	"on_budget",
	"over_budget",
	"critical",
]);
export type CostLineDeltaStatus = z.infer<typeof CostLineDeltaStatusSchema>;

export const CostResponseSchema = CostSchema.extend({
	variance: z.number(),
	variancePercent: z.number().nullable(),
	dataState: CostDataStateSchema,
});
export type CostResponse = z.infer<typeof CostResponseSchema>;
