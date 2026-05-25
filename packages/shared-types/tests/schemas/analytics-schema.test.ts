import { describe, expect, it } from "vitest";
import {
	DashboardTechnicianWorkloadQuerySchema,
	DashboardTopAssetsQuerySchema,
	ExtendedKpisQuerySchema,
} from "../../src/schemas/analytics.schema";

describe("analytics dashboard schemas", () => {
	it("applies safe defaults for DOC-07B dashboard queries", () => {
		expect(ExtendedKpisQuerySchema.parse({})).toEqual({ period: "30d", compare: true });
		expect(DashboardTopAssetsQuerySchema.parse({})).toEqual({ limit: 10 });
		expect(DashboardTechnicianWorkloadQuerySchema.parse({})).toEqual({ days: 14 });
	});

	it("rejects unsupported dashboard ranges and caps expensive queries", () => {
		expect(() => ExtendedKpisQuerySchema.parse({ period: "365d" })).toThrow();
		expect(() => DashboardTopAssetsQuerySchema.parse({ limit: 200 })).toThrow();
		expect(() => DashboardTechnicianWorkloadQuerySchema.parse({ days: 90 })).toThrow();
	});
});
