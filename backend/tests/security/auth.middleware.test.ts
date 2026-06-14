import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../../src/common/errors";
import { authenticate } from "../../src/middlewares/auth.middleware";

const JWT_SECRET = "test-jwt-secret-for-testing-only";
const USER_ID = "507f1f77bcf86cd799439011";

const mocks = vi.hoisted(() => ({
	tokenFindOne: vi.fn(),
	userFindById: vi.fn(),
}));

vi.mock("../../src/models", () => ({
	TokenBlacklist: { findOne: mocks.tokenFindOne },
	User: { findById: mocks.userFindById },
}));

function blacklistResult(value: object | null) {
	return { lean: vi.fn().mockResolvedValue(value) };
}

function userResult(value: { isActive: boolean; tokenVersion: number } | null) {
	return {
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockResolvedValue(value),
		}),
	};
}

function createProtectedApp() {
	const app = express();
	app.get("/protected", authenticate, (req, res) => {
		res.status(200).json({ success: true, data: req.user });
	});
	app.use(errorHandler);
	return app;
}

function accessToken(overrides: Record<string, string | number> = {}): string {
	return jwt.sign(
		{
			sub: USER_ID,
			role: "gerente",
			tokenType: "access",
			tokenVersion: 3,
			...overrides,
		},
		JWT_SECRET,
		{ expiresIn: "15m" },
	);
}

describe("authenticate middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.tokenFindOne.mockReturnValue(blacklistResult(null));
		mocks.userFindById.mockReturnValue(userResult({ isActive: true, tokenVersion: 3 }));
	});

	it("rejects requests without a bearer token", async () => {
		const response = await request(createProtectedApp()).get("/protected");

		expect(response.status).toBe(401);
		expect(response.body.error.code).toBe("UNAUTHORIZED");
	});

	it("attaches normalized claims for an active session", async () => {
		const response = await request(createProtectedApp())
			.get("/protected")
			.set("Authorization", `Bearer ${accessToken({ jti: "session-1" })}`);

		expect(response.status).toBe(200);
		expect(response.body.data).toMatchObject({
			_id: USER_ID,
			sub: USER_ID,
			role: "gerente",
			jti: "session-1",
			tokenVersion: 3,
		});
		expect(mocks.tokenFindOne).toHaveBeenCalledWith({ jti: "session-1" });
	});

	it("rejects refresh tokens on protected routes", async () => {
		const response = await request(createProtectedApp())
			.get("/protected")
			.set("Authorization", `Bearer ${accessToken({ tokenType: "refresh" })}`);

		expect(response.status).toBe(401);
		expect(response.body.error.message).toContain("Refresh tokens");
	});

	it("rejects revoked sessions", async () => {
		mocks.tokenFindOne.mockReturnValue(blacklistResult({ jti: "revoked-1" }));
		const response = await request(createProtectedApp())
			.get("/protected")
			.set("Authorization", `Bearer ${accessToken({ jti: "revoked-1" })}`);

		expect(response.status).toBe(401);
		expect(response.body.error.message).toContain("revoked");
	});

	it("rejects deactivated accounts and invalidated token versions", async () => {
		mocks.userFindById.mockReturnValueOnce(userResult({ isActive: false, tokenVersion: 3 }));
		const inactive = await request(createProtectedApp())
			.get("/protected")
			.set("Authorization", `Bearer ${accessToken()}`);

		mocks.userFindById.mockReturnValueOnce(userResult({ isActive: true, tokenVersion: 4 }));
		const invalidated = await request(createProtectedApp())
			.get("/protected")
			.set("Authorization", `Bearer ${accessToken()}`);

		expect(inactive.status).toBe(401);
		expect(inactive.body.error.message).toContain("deactivated");
		expect(invalidated.status).toBe(401);
		expect(invalidated.body.error.message).toContain("invalidated");
	});

	it("rejects malformed, expired, subjectless, and roleless tokens", async () => {
		const expired = jwt.sign(
			{ sub: USER_ID, role: "gerente", tokenType: "access", tokenVersion: 3 },
			JWT_SECRET,
			{ expiresIn: -1 },
		);
		const subjectless = jwt.sign({ role: "gerente", tokenType: "access" }, JWT_SECRET);
		const roleless = jwt.sign({ sub: USER_ID, tokenType: "access" }, JWT_SECRET);

		const responses = await Promise.all([
			request(createProtectedApp()).get("/protected").set("Authorization", "Bearer invalid"),
			request(createProtectedApp()).get("/protected").set("Authorization", `Bearer ${expired}`),
			request(createProtectedApp()).get("/protected").set("Authorization", `Bearer ${subjectless}`),
			request(createProtectedApp()).get("/protected").set("Authorization", `Bearer ${roleless}`),
		]);

		expect(responses.map((response) => response.status)).toEqual([401, 401, 401, 401]);
		expect(responses[1].body.error.code).toBe("TOKEN_EXPIRED");
	});
});
