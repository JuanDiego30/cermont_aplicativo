import { describe, expect, it } from "vitest";
import {
	buildPipelineSummary,
	mapCostCategoryRows,
} from "../../src/modules/dashboard/dashboard.service";

describe("dashboard business aggregations", () => {
	it("builds the pipeline from real service-case stage counts without estimates", () => {
		const summary = buildPipelineSummary([
			{ _id: "intake", count: 4 },
			{ _id: "in_execution", count: 3 },
			{ _id: "paid", count: 2 },
			{ _id: "archived", count: 1 },
			{ _id: "cancelled", count: 1 },
		]);

		expect(summary.totalActive).toBe(7);
		expect(summary.totalClosed).toBe(3);
		expect(summary.completionRate).toBe(27);
		expect(summary.stages.find((stage) => stage.stage === "planning")?.count).toBe(0);
		expect(summary.stages.find((stage) => stage.stage === "in_execution")?.count).toBe(3);
	});

	it("maps cost categories from actual monetary totals", () => {
		expect(
			mapCostCategoryRows([
				{ _id: "labor", total: 2_500_000 },
				{ _id: "materials", total: 1_750_000 },
			]),
		).toEqual([
			{ label: "labor", value: 2_500_000 },
			{ label: "materials", value: 1_750_000 },
		]);
	});
});
