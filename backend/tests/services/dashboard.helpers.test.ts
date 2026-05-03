import { afterEach, describe, expect, it, vi } from "vitest";
import {
	buildDateKeys,
	buildDateRangeFilter,
	buildFinancial,
	buildLeadTime,
	calcCompletionRate,
	getClosureDays,
	getPeriodDays,
	getPeriodWindow,
	roundMetric,
	toCountMap,
} from "../../src/dashboard/application/dashboard.helpers";

describe("dashboard helpers", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("formats count maps and percentage metrics", () => {
		expect(
			toCountMap([
				{ _id: "open", count: 3 },
				{ _id: "closed", count: 2 },
			]),
		).toEqual({ open: 3, closed: 2 });
		expect(calcCompletionRate(2, 4)).toBe(50);
		expect(calcCompletionRate(1, 0)).toBe(0);
		expect(roundMetric(12.26)).toBe(12.3);
	});

	it("builds period windows and date keys from the selected analytics period", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-29T12:00:00.000Z"));

		expect(getPeriodDays("7d")).toBe(7);
		expect(getPeriodDays("30d")).toBe(30);
		expect(getPeriodDays("90d")).toBe(90);
		expect(buildDateKeys(3)).toEqual(["2026-04-27", "2026-04-28", "2026-04-29"]);

		const currentWindow = getPeriodWindow("7d");
		const previousWindow = getPeriodWindow("7d", 1);

		expect(currentWindow.end.toISOString()).toBe("2026-04-29T12:00:00.000Z");
		expect(previousWindow.end.toISOString()).toBe("2026-04-22T12:00:00.000Z");
	});

	it("ignores invalid date filters and keeps valid range bounds", () => {
		expect(buildDateRangeFilter("createdAt", { startDate: "invalid" })).toEqual({});
		expect(
			buildDateRangeFilter("createdAt", {
				startDate: "2026-04-01",
				endDate: "2026-04-29",
			}),
		).toEqual({
			createdAt: {
				$gte: new Date("2026-04-01T00:00:00.000Z"),
				$lte: new Date("2026-04-29T23:59:59.999Z"),
			},
		});
	});

	it("normalizes aggregate defaults without changing API shapes", () => {
		expect(buildFinancial(void 0)).toEqual({ total_actual: 0, count: 0, currency: "COP" });
		expect(buildFinancial({ _id: void 0 as never, total_actual: 2500, count: 2 })).toEqual({
			total_actual: 2500,
			count: 2,
			currency: "COP",
		});
		const emptyLeadTime = buildLeadTime(void 0);
		expect(emptyLeadTime.count).toBe(0);
		expect(emptyLeadTime.avg_lead_time_days).toBeNull();
		expect(emptyLeadTime.min_lead_time_days).toBeNull();
		expect(emptyLeadTime.max_lead_time_days).toBeNull();
	});

	it("calculates report closure days only when both dates are valid", () => {
		expect(getClosureDays("2026-04-01T00:00:00.000Z", "2026-04-03T12:00:00.000Z")).toBe(2.5);
		expect(getClosureDays(void 0, "2026-04-03T12:00:00.000Z")).toBeNull();
		expect(getClosureDays("invalid", "2026-04-03T12:00:00.000Z")).toBeNull();
	});
});
