import { describe, expect, it } from "vitest";
import { calculateGrossMargin, evaluateCostBudgetRisk } from "../cost.rules";

describe("evaluateCostBudgetRisk", () => {
	it("reports unavailable when the order has no approved budget", () => {
		expect(
			evaluateCostBudgetRisk({
				actualAmount: 800,
				approvedBudget: { status: "absent" },
			}),
		).toEqual({
			risk: "not_available",
			consumptionPercent: { status: "absent" },
			threshold: 0.8,
		});
	});

	it.each([
		{ actualAmount: 799, risk: "within_budget" },
		{ actualAmount: 800, risk: "threshold_reached" },
		{ actualAmount: 1_000, risk: "threshold_reached" },
		{ actualAmount: 1_001, risk: "over_budget" },
	] as const)("classifies $actualAmount as $risk", ({ actualAmount, risk }) => {
		const assessment = evaluateCostBudgetRisk({
			actualAmount,
			approvedBudget: { status: "present", value: 1_000 },
		});

		expect(assessment.risk).toBe(risk);
		expect(assessment.consumptionPercent).toEqual({
			status: "present",
			value: actualAmount / 1_000,
		});
	});
});

describe("calculateGrossMargin", () => {
	it("calculates profit and margin from approved revenue and supported cost", () => {
		expect(
			calculateGrossMargin({
				revenue: { status: "present", value: 2_000 },
				actualCost: 1_500,
			}),
		).toEqual({
			grossProfit: { status: "present", value: 500 },
			grossMarginPercent: { status: "present", value: 0.25 },
		});
	});

	it("keeps profitability absent without approved revenue", () => {
		expect(calculateGrossMargin({ revenue: { status: "absent" }, actualCost: 1_500 })).toEqual({
			grossProfit: { status: "absent" },
			grossMarginPercent: { status: "absent" },
		});
	});
});
