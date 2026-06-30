import type { CostSummary } from "@cermont/shared-types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CostBudgetStatus } from "@/modules/costs/ui/CostBudgetStatus";
import { CostComparisonChart } from "@/modules/costs/ui/CostComparisonChart";

const summary: CostSummary = {
	orderId: "507f1f77bcf86cd799439011",
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
};

describe("CostBudgetStatus", () => {
	it("shows the preventive threshold against the approved proposal", () => {
		render(<CostBudgetStatus summary={summary} />);

		expect(screen.getByText("Umbral preventivo alcanzado")).toBeInTheDocument();
		expect(screen.getByText("80% consumido")).toBeInTheDocument();
		expect(screen.getByText(/presupuesto aprobado/i)).toBeInTheDocument();
	});

	it("uses actual minus estimated as the comparison variance", () => {
		render(<CostComparisonChart estimated={1_000} actual={1_200} />);

		expect(screen.getByText("+20% (sobre presupuesto)")).toBeInTheDocument();
	});
});
