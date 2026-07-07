import type { Cost, CostSummary } from "@cermont/shared-types";
import { describe, expect, it } from "vitest";
import { buildCostExportCsv } from "@/modules/costs/cost-export";

describe("buildCostExportCsv", () => {
	it("exports financial summary and supported cost rows", () => {
		const summary = {
			orderId: "order-1",
			totalEstimated: 1_000,
			totalActual: 700,
			totalTax: 100,
			variance: -300,
			variancePercent: { status: "present", value: -0.3 },
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
		} satisfies CostSummary;
		const costs = [
			{
				_id: "cost-1",
				orderId: "order-1",
				category: "labor",
				description: "Cuadrilla, turno día",
				estimatedAmount: 1_000,
				actualAmount: 700,
				taxAmount: 100,
				taxRate: 0.19,
				currency: "COP",
				supportEvidenceIds: ["evidence-1"],
				supportDocumentIds: [],
				status: "active",
				recordedBy: "user-1",
				recordedAt: "2026-06-29T12:00:00.000Z",
				createdAt: "2026-06-29T12:00:00.000Z",
				updatedAt: "2026-06-29T12:00:00.000Z",
			} satisfies Cost,
		];

		const csv = buildCostExportCsv(summary, costs);

		expect(csv).toContain("Presupuesto aprobado,1000");
		expect(csv).toContain("Margen bruto,20.00%");
		expect(csv).toContain('labor,"Cuadrilla, turno día",1000,700,100,COP,1');
	});
});
