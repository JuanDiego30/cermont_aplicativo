import { describe, expect, it } from "vitest";
import {
	CostCatalogItemSchema,
	CostSummarySchema,
	ListCostCatalogQuerySchema,
} from "../../src/schemas";

describe("cost intelligence contracts", () => {
	it("uses the canonical cost categories in catalog records", () => {
		const item = CostCatalogItemSchema.parse({
			_id: "507f1f77bcf86cd799439011",
			code: "MAT-001",
			name: "Consumible multipropósito",
			description: { status: "absent" },
			category: "materials",
			unit: "unidad",
			unitPrice: 25_000,
			currency: "COP",
			isActive: true,
			createdAt: "2026-06-29T12:00:00.000Z",
			updatedAt: "2026-06-29T12:00:00.000Z",
		});

		expect(item.category).toBe("materials");
	});

	it("normalizes catalog pagination without accepting unsupported fields", () => {
		const query = ListCostCatalogQuerySchema.parse({ category: "labor", page: "2", limit: "15" });

		expect(query).toEqual({ category: "labor", page: 2, limit: 15 });
	});

	it("requires an explicit approved-budget state in summaries", () => {
		const summary = CostSummarySchema.parse({
			orderId: "507f1f77bcf86cd799439011",
			totalEstimated: 1_000,
			totalActual: 800,
			totalTax: 0,
			variance: -200,
			variancePercent: { status: "present", value: -0.2 },
			approvedBudget: { status: "present", value: 1_000 },
			budgetConsumptionPercent: { status: "present", value: 0.8 },
			budgetRisk: "threshold_reached",
			budgetAlertThreshold: 0.8,
			actualCostWithTax: 800,
			grossProfit: { status: "present", value: 200 },
			grossMarginPercent: { status: "present", value: 0.2 },
			hasCosts: true,
			dataState: "ESTIMATED_AND_ACTUAL",
			byCategory: [],
		});

		expect(summary.budgetRisk).toBe("threshold_reached");
	});
});
