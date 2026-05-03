import { describe, expect, it } from "vitest";

import {
	buildAllowedCorsOrigins,
	resolveRateLimitKey,
	resolveTrustProxySetting,
} from "../../src/_shared/config/http-security";

describe("HTTP security configuration", () => {
	it("allows localhost CORS origins only outside production", () => {
		expect(
			buildAllowedCorsOrigins({
				frontendUrl: "https://app.cermont.co",
				nodeEnv: "production",
			}),
		).toEqual(["https://app.cermont.co"]);

		expect(
			buildAllowedCorsOrigins({
				frontendUrl: "http://localhost:3000",
				nodeEnv: "development",
			}),
		).toEqual(["http://localhost:3000", "http://127.0.0.1:3000"]);
	});

	it("enables a single trusted proxy hop only in production", () => {
		expect(resolveTrustProxySetting("production")).toBe(1);
		expect(resolveTrustProxySetting("test")).toBe(false);
		expect(resolveTrustProxySetting("development")).toBe(false);
	});

	it("builds rate-limit keys from Express trusted IP resolution", () => {
		expect(resolveRateLimitKey("203.0.113.10", "10.0.0.5")).toBe("203.0.113.10");
		expect(resolveRateLimitKey(undefined, "10.0.0.5")).toBe("10.0.0.5");
	});
});
