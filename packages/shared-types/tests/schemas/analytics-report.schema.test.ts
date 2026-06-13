import { describe, expect, it } from "vitest";
import {
	AnalyticsReportFilterSchema,
	AnalyticsReportParamsSchema,
} from "../../src/schemas/analytics.schema";

describe("analytics report schemas", () => {
	it("accepts a supported report domain", () => {
		const result = AnalyticsReportParamsSchema.parse({ domain: "orders" });
		expect(result.domain).toBe("orders");
	});

	it("rejects an inverted date range", () => {
		const result = AnalyticsReportFilterSchema.safeParse({
			dateFrom: "2026-06-12T00:00:00.000Z",
			dateTo: "2026-06-11T00:00:00.000Z",
		});
		expect(result.success).toBe(false);
	});

	it("strips no arbitrary filter keys", () => {
		const result = AnalyticsReportFilterSchema.safeParse({ injected: "value" });
		expect(result.success).toBe(false);
	});
});
