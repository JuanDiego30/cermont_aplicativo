import { describe, expect, it, vi } from "vitest";

vi.unmock("../../src/config/env");

const { validateBackendEnv } = await vi.importActual("../../src/config/env");

const validEnvironment = {
	NODE_ENV: "test",
	MONGODB_URI: "mongodb://127.0.0.1:27017/cermont_test",
	JWT_SECRET: "a".repeat(32),
	REFRESH_TOKEN_SECRET: "b".repeat(32),
	FRONTEND_URL: "http://localhost:3000",
};

describe("backend environment validation", () => {
	it("returns required backend variables after Zod validation", () => {
		const parsed = validateBackendEnv(validEnvironment);

		expect(parsed.MONGODB_URI).toBe(validEnvironment.MONGODB_URI);
		expect(parsed.FRONTEND_URL).toBe(validEnvironment.FRONTEND_URL);
	});

	it("fails fast when a required backend variable is absent", () => {
		const { MONGODB_URI: _omitted, ...missingMongo } = validEnvironment;

		expect(() => validateBackendEnv(missingMongo)).toThrowError(/MONGODB_URI/);
	});

	it("rejects weak JWT secrets", () => {
		expect(() =>
			validateBackendEnv({
				...validEnvironment,
				JWT_SECRET: "too-short",
			}),
		).toThrowError(/JWT_SECRET/);
	});
});
