import { beforeEach, describe, expect, it } from "vitest";
import {
	getErrorMetrics,
	resetErrorMetrics,
	trackErrorMetric,
} from "@/common/observability/error-metrics";

describe("error metrics observability", () => {
	beforeEach(() => {
		resetErrorMetrics();
	});

	it("tracks error count by module and endpoint", () => {
		trackErrorMetric("GET", "/api/orders");
		trackErrorMetric("GET", "/api/orders");
		trackErrorMetric("POST", "/api/auth/login");

		const metrics = getErrorMetrics(10);

		expect(metrics.totalErrors).toBe(3);
		expect(metrics.modules).toEqual([
			{ module: "orders", count: 2 },
			{ module: "auth", count: 1 },
		]);
		expect(metrics.endpoints[0]).toMatchObject({
			module: "orders",
			endpoint: "GET /api/orders",
			count: 2,
		});
	});
});
