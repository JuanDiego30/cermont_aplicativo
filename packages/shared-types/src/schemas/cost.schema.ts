import { z } from "zod";
import { statusObjectOf } from "../utils/status-types";

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

export const CostRecordStatusSchema = z.enum(["active", "voided"]);
export type CostRecordStatus = z.infer<typeof CostRecordStatusSchema>;

export const CostByCategorySchema = z.object({
	category: CostCategorySchema,
	estimated: z.number(),
	actual: z.number(),
	tax: z.number(),
	variance: z.number(),
	dataState: CostDataStateSchema,
});
export type CostByCategory = z.infer<typeof CostByCategorySchema>;

export const CostBudgetRiskSchema = z.enum([
	"not_available",
	"within_budget",
	"threshold_reached",
	"over_budget",
]);
export type CostBudgetRisk = z.infer<typeof CostBudgetRiskSchema>;

function hasCostSupport(data: {
	actualAmount: number;
	supportEvidenceIds: string[];
	supportDocumentIds: string[];
}): boolean {
	return (
		data.actualAmount <= 0 || data.supportEvidenceIds.length + data.supportDocumentIds.length > 0
	);
}

const CostInputBaseSchema = z.object({
	orderId: z.string().min(1),
	category: CostCategorySchema,
	description: z.string().min(1).max(200),
	estimatedAmount: z.number().min(0),
	actualAmount: z.number().min(0),
	taxAmount: z.number().min(0).default(0),
	taxRate: z.number().min(0).max(1).default(0),
	currency: z.string().default("COP"),
	notes: z.string().max(500).optional(),
	supportEvidenceIds: z.array(z.string().min(1)).max(20).default([]),
	supportDocumentIds: z.array(z.string().min(1)).max(20).default([]),
});

export const CreateCostSchema = CostInputBaseSchema.refine(hasCostSupport, {
	message: "Actual cost entries require at least one support evidence or document",
	path: ["supportEvidenceIds"],
});
export type CreateCostInput = z.infer<typeof CreateCostSchema>;

export const UpdateCostSchema = CostInputBaseSchema.omit({
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
	variancePercent: statusObjectOf(z.number()),
	approvedBudget: statusObjectOf(z.number().nonnegative()),
	budgetConsumptionPercent: statusObjectOf(z.number().nonnegative()),
	budgetRisk: CostBudgetRiskSchema,
	budgetAlertThreshold: z.number().min(0).max(1),
	actualCostWithTax: z.number().nonnegative(),
	grossProfit: statusObjectOf(z.number()),
	grossMarginPercent: statusObjectOf(z.number()),
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
	supportEvidenceIds: z.array(z.string().min(1)),
	supportDocumentIds: z.array(z.string().min(1)),
	status: CostRecordStatusSchema,
	voidedAt: z.string().optional(),
	voidedBy: z.string().optional(),
	voidReason: z.string().max(500).optional(),
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
	variancePercent: statusObjectOf(z.number()),
	dataState: CostDataStateSchema,
});
export type CostResponse = z.infer<typeof CostResponseSchema>;

// ─────────────────────────────────────────────────────────────────────────
// Spec-015 — Cost catalog, baseline and intelligence contracts
// ─────────────────────────────────────────────────────────────────────────

// CostCatalogItemSchema lives in cost-cart.schema.ts (SSOT) — enriched there
// with unitCostCOP / isBillable. Here only the create/list contracts.

export const CreateCostCatalogItemSchema = z.object({
	code: z.string().min(1).max(40),
	name: z.string().min(1).max(200),
	description: z.string().max(500).optional(),
	category: CostCategorySchema,
	unit: z.string().min(1).max(50),
	unitPrice: z.number().min(0),
	currency: z.string().default("COP"),
	isActive: z.boolean().default(true),
	unitCostCOP: z.number().min(0).optional(),
	isBillable: z.boolean().optional(),
});
export type CreateCostCatalogItemInput = z.infer<typeof CreateCostCatalogItemSchema>;

export const CostCatalogListQuerySchema = z.object({
	category: z.string().max(50).optional(),
	search: z.string().max(100).optional(),
	isActive: z.coerce.boolean().optional(),
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type CostCatalogListQuery = z.infer<typeof CostCatalogListQuerySchema>;

export const BaselineCostSchema = z.object({
	proposalId: z.string().min(1),
	proposalCode: z.string().min(1).optional(),
	frozenAt: z.string().datetime(),
	totalEstimatedCOP: z.number().min(0),
	totalTaxCOP: z.number().min(0).default(0),
	byCategory: z.array(
		z.object({
			category: CostCategorySchema,
			estimatedCOP: z.number().min(0),
		}),
	),
});
export type BaselineCost = z.infer<typeof BaselineCostSchema>;

export const CostIntelligenceSummarySchema = z.object({
	orderId: z.string().min(1),
	orderCode: z.string().optional(),
	baselineCost: BaselineCostSchema.optional(),
	totalEstimated: z.number(),
	totalActual: z.number(),
	totalTaxCOP: z.number().default(0),
	totalMargin: z.number(),
	marginPercent: z.number(),
	budgetConsumedPercent: z.number(),
	isAtRisk: z.boolean(),
	isCritical: z.boolean(),
	deviationByCategory: z.array(
		z.object({
			category: CostCategorySchema,
			estimated: z.number(),
			actual: z.number(),
			deviationPercent: z.number(),
		}),
	),
	lastUpdatedAt: z.string().datetime(),
});
export type CostIntelligenceSummary = z.infer<typeof CostIntelligenceSummarySchema>;

export const CostSummaryEnrichedSchema = CostSummarySchema.extend({
	baselineCost: BaselineCostSchema.optional(),
	budgetConsumedPercent: z.number().optional(),
	marginPercent: z.number().optional(),
	isAtRisk: z.boolean().optional(),
	isCritical: z.boolean().optional(),
});
export type CostSummaryEnriched = z.infer<typeof CostSummaryEnrichedSchema>;
