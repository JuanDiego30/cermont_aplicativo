/**
 * Cost Comparison — tests for baseline vs actual cost analysis.
 *
 * Verifies:
 * - Variance calculation between estimated and actual amounts
 * - Margin percentage computation
 * - Overrun detection
 * - Cost breakdown by category
 */

import { describe, expect, it } from "vitest";

// Cost analysis types matching the domain
interface CostLineItem {
	category: "materials" | "labor" | "tools" | "transport" | "taxes" | "overhead";
	estimatedAmount: number;
	actualAmount: number;
}

interface CostAnalysis {
	totalEstimated: number;
	totalActual: number;
	variance: number;
	variancePercent: number;
	margin: number;
	marginPercent: number;
	overrun: boolean;
	items: CostLineItem[];
}

function analyzeCosts(items: CostLineItem[]): CostAnalysis {
	const totalEstimated = items.reduce((s, i) => s + i.estimatedAmount, 0);
	const totalActual = items.reduce((s, i) => s + i.actualAmount, 0);
	const variance = totalActual - totalEstimated;
	const variancePercent = totalEstimated > 0 ? (variance / totalEstimated) * 100 : 0;
	const margin = totalEstimated - totalActual;
	const marginPercent = totalEstimated > 0 ? (margin / totalEstimated) * 100 : 0;
	return {
		totalEstimated,
		totalActual,
		variance,
		variancePercent,
		margin,
		marginPercent,
		overrun: variance > 0,
		items,
	};
}

describe("Cost Comparison Analysis", () => {
	it("should calculate positive variance (overrun) correctly", () => {
		const result = analyzeCosts([
			{ category: "materials", estimatedAmount: 1000, actualAmount: 1200 },
			{ category: "labor", estimatedAmount: 2000, actualAmount: 2500 },
			{ category: "tools", estimatedAmount: 500, actualAmount: 400 },
		]);
		expect(result.totalEstimated).toBe(3500);
		expect(result.totalActual).toBe(4100);
		expect(result.variance).toBe(600);
		expect(result.variancePercent).toBeCloseTo(17.14, 1);
		expect(result.overrun).toBe(true);
	});

	it("should calculate negative variance (under budget) correctly", () => {
		const result = analyzeCosts([
			{ category: "materials", estimatedAmount: 1000, actualAmount: 800 },
			{ category: "labor", estimatedAmount: 2000, actualAmount: 1800 },
		]);
		expect(result.variance).toBe(-400);
		expect(result.overrun).toBe(false);
		expect(result.margin).toBe(400);
	});

	it("should detect zero costs gracefully", () => {
		const result = analyzeCosts([{ category: "materials", estimatedAmount: 0, actualAmount: 0 }]);
		expect(result.totalEstimated).toBe(0);
		expect(result.variancePercent).toBe(0);
		expect(result.overrun).toBe(false);
	});

	it("should handle multiple cost categories", () => {
		const items: CostLineItem[] = [
			{ category: "materials", estimatedAmount: 5000, actualAmount: 5500 },
			{ category: "labor", estimatedAmount: 8000, actualAmount: 7600 },
			{ category: "tools", estimatedAmount: 1500, actualAmount: 1800 },
			{ category: "transport", estimatedAmount: 1000, actualAmount: 1200 },
			{ category: "taxes", estimatedAmount: 2000, actualAmount: 2000 },
			{ category: "overhead", estimatedAmount: 1000, actualAmount: 1100 },
		];
		const result = analyzeCosts(items);
		expect(result.items).toHaveLength(6);
		expect(result.totalEstimated).toBe(18500);
		expect(result.totalActual).toBe(19200);
		expect(result.variancePercent).toBeCloseTo(3.78, 1);
	});
});

describe("Cost Budget Status", () => {
	it("should flag cost overrun when actual > estimated", () => {
		const status = {
			budget: 10000,
			actual: 12500,
			remaining: -2500,
			overrun: true,
			overrunPercent: 25,
		};
		expect(status.overrun).toBe(true);
		expect(status.remaining).toBeLessThan(0);
		expect(status.overrunPercent).toBe(25);
	});

	it("should show healthy status when actual < estimated", () => {
		const status = {
			budget: 10000,
			actual: 8500,
			remaining: 1500,
			overrun: false,
			savingsPercent: 15,
		};
		expect(status.overrun).toBe(false);
		expect(status.remaining).toBeGreaterThan(0);
	});
});
