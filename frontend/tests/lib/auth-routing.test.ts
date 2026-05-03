import { isPublicPath } from "@cermont/shared-types/rbac";
import { describe, expect, it } from "vitest";
import { toApiUrl } from "@/_shared/lib/http/api-client";

describe("auth routing contract", () => {
	it("keeps backend API requests behind the frontend rewrite prefix", () => {
		expect(toApiUrl("/auth/login")).toBe("/api/backend/auth/login");
	});

	it("treats login and offline routes as public paths", () => {
		expect(isPublicPath("/login")).toBe(true);
		expect(isPublicPath("/login?from=%2Fdashboard")).toBe(true);
		expect(isPublicPath("/offline")).toBe(true);
	});
});
