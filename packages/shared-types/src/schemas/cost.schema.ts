import { z } from "zod";
import type { MongooseDocument } from "./common.schema";

export const CostCategorySchema = z.enum([
	"labor",
	"materials",
	"equipment",
	"transport",
	"subcontract",
	"overhead",
	"other",
]);
export type CostCategory = z.infer<typeof CostCategorySchema>;

export const CostByCategorySchema = z.object({
	category: CostCategorySchema,
	estimated: z.number(),
	actual: z.number(),
	tax: z.number(),
	variance: z.number(),
});
export type CostByCategory = z.infer<typeof CostByCategorySchema>;

export const CostLineDeltaStatusSchema = z.enum([
	"under_budget",
	"on_budget",
	"over_budget",
	"critical",
]);
export type CostLineDeltaStatus = z.infer<typeof CostLineDeltaStatusSchema>;

export const CostLineDeltaSchema = z.object({
	category: CostCategorySchema,
	description: z.string(),
	budgeted: z.number(),
	actual: z.number(),
	delta: z.number(),
	deltaPct: z.number().optional(),
	status: CostLineDeltaStatusSchema,
});
export type CostLineDelta = z.infer<typeof CostLineDeltaSchema>;

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
	baselineEstimated: z.number(),
	baselineApproved: z.number(),
	variance: z.number(),
	variancePercent: z.number().optional(),
	deviationStatus: z.enum(["on_track", "over_budget"]),
	hasCosts: z.boolean(),
	byCategory: z.array(CostByCategorySchema),
	lineDeltas: z.array(CostLineDeltaSchema).default([]),
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

export const CostResponseSchema = CostSchema.extend({
	variance: z.number(),
	variancePercent: z.number().optional(),
});
export type CostResponse = z.infer<typeof CostResponseSchema>;

/**
 * Mongoose Document representation for Cost.
 * Used for type safety in backend services and repositories.
 */
export interface CostDocument<TID = string> extends MongooseDocument<TID> {
	orderId: TID;
	category: CostCategory;
	description: string;
	estimatedAmount: number;
	actualAmount: number;
	taxAmount: number;
	taxRate: number;
	currency: string;
	notes?: string;
	recordedBy: TID;
	recordedAt: Date;
}
