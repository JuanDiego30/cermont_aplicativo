import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Cost Catalog Item ───────────────────────────────────────────────────────

export const CostCatalogItemCategoryEnum = z.enum([
	"material",
	"labor",
	"equipment",
	"transport",
	"overhead",
	"other",
]);

export type CostCatalogItemCategory = z.infer<typeof CostCatalogItemCategoryEnum>;

export const CostCatalogItemSchema = z.object({
	_id: ObjectIdSchema,
	code: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	category: CostCatalogItemCategoryEnum,
	unit: z.string().min(1),
	unitPrice: z.number().nonnegative(),
	currency: z.string().default("COP"),
	isActive: z.boolean().default(true),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type CostCatalogItem = z.infer<typeof CostCatalogItemSchema>;

// ─── Cost Cart ───────────────────────────────────────────────────────────────

export const CostCartItemSchema = z.object({
	itemId: z.string().min(1),
	catalogItemId: ObjectIdSchema.optional(),
	description: z.string().min(1),
	category: CostCatalogItemCategoryEnum,
	unit: z.string().min(1),
	quantity: z.number().positive(),
	unitCost: z.number().nonnegative(),
	totalCost: z.number().nonnegative(),
	taxRate: z.number().min(0).max(1).default(0),
	taxAmount: z.number().nonnegative().default(0),
	recordedBy: ObjectIdSchema,
	recordedAt: z.string().datetime(),
	notes: z.string().optional(),
});

export type CostCartItem = z.infer<typeof CostCartItemSchema>;

export const CostCartStatusEnum = z.enum(["open", "frozen", "approved", "rejected"]);

export const CostCartSchema = z.object({
	_id: ObjectIdSchema,
	orderId: ObjectIdSchema,
	status: CostCartStatusEnum,
	items: z.array(CostCartItemSchema),
	subtotal: z.number().nonnegative(),
	totalTax: z.number().nonnegative(),
	totalAmount: z.number().nonnegative(),
	currency: z.string().default("COP"),
	baselineSnapshotId: ObjectIdSchema.optional(),
	metadata: z.record(z.string(), z.unknown()).optional(),
	createdBy: ObjectIdSchema,
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type CostCart = z.infer<typeof CostCartSchema>;

// ─── Cost Deviation ────────────────────────────────────────────────────────────

export const CostDeviationSchema = z.object({
	category: CostCatalogItemCategoryEnum,
	estimated: z.number().nonnegative(),
	actual: z.number().nonnegative(),
	variance: z.number(),
	variancePercentage: z.number(),
	status: z.enum(["under_budget", "on_budget", "over_budget"]),
});

export type CostDeviation = z.infer<typeof CostDeviationSchema>;

export const CostComparisonSchema = z.object({
	orderId: ObjectIdSchema,
	overallStatus: z.enum(["under_budget", "on_budget", "over_budget"]),
	totalEstimated: z.number().nonnegative(),
	totalActual: z.number().nonnegative(),
	totalVariance: z.number(),
	deviations: z.array(CostDeviationSchema),
});

export type CostComparison = z.infer<typeof CostComparisonSchema>;

// ─── Input Schemas ───────────────────────────────────────────────────────────

export const CreateCostCartItemSchema = z.object({
	description: z.string().min(1),
	category: CostCatalogItemCategoryEnum.default("other"),
	unit: z.string().min(1),
	quantity: z.number().positive(),
	unitCost: z.number().nonnegative(),
	taxRate: z.number().min(0).max(1).optional(),
	catalogItemId: z.string().optional(),
	notes: z.string().optional(),
});

export type CreateCostCartItemInput = z.infer<typeof CreateCostCartItemSchema>;
