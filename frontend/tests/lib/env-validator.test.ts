import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateEnv } from "@/lib/env-validator";

describe("validateEnv (frontend)", () => {
	beforeEach(() => {
		// Reset to safe defaults for testing
		vi.stubEnv("NODE_ENV", "development");
		vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://127.0.0.1:3000");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("passes with valid NEXT_PUBLIC_APP_URL", () => {
		expect(() => validateEnv()).not.toThrow();
	});

	it("throws when NEXT_PUBLIC_APP_URL is missing", () => {
		vi.stubEnv("NEXT_PUBLIC_APP_URL", "");
		expect(() => validateEnv()).toThrow("NEXT_PUBLIC_APP_URL is required");
	});

	it("returns env object with NEXT_PUBLIC_APP_URL", () => {
		const env = validateEnv();
		expect(env.NEXT_PUBLIC_APP_URL).toBe("http://127.0.0.1:3000");
	});
});
