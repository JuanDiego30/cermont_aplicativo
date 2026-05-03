import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UnauthorizedError } from "../../src/_shared/common/errors";
import { authenticate } from "../../src/_shared/middlewares/auth.middleware";
import { TokenBlacklist, User } from "../../src/auth/infrastructure/model";

vi.mock("../../src/auth/infrastructure/model", () => ({
	TokenBlacklist: {
		findOne: vi.fn(),
	},
	User: {
		findById: vi.fn(),
	},
}));

const JWT_SECRET = "test-jwt-secret-for-testing-only";

function makeRequest(token: string): Request {
	return {
		headers: {
			authorization: `Bearer ${token}`,
		},
	} as Request;
}

function configureActiveUser(): void {
	vi.mocked(TokenBlacklist.findOne).mockReturnValue({
		lean: vi.fn().mockResolvedValue(false),
	} as never);
	vi.mocked(User.findById).mockReturnValue({
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockResolvedValue({ isActive: true }),
		}),
	} as never);
}

describe("authenticate middleware", () => {
	beforeEach(() => {
		configureActiveUser();
	});

	it("accepts subject-only tokens and stores a minimal auth payload", async () => {
		const token = jwt.sign({ sub: "user-1", role: "manager", jti: "token-1" }, JWT_SECRET);
		const req = makeRequest(token);
		const next = vi.fn();

		await authenticate(req, {} as Response, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ jti: "token-1" });
		expect(User.findById).toHaveBeenCalledWith("user-1");
		expect(req.user).toEqual({
			_id: "user-1",
			role: "manager",
			jti: "token-1",
		});
	});

	it("rejects tokens that do not match the auth payload contract", async () => {
		const token = jwt.sign({ sub: "user-1", jti: "token-1" }, JWT_SECRET);
		const req = makeRequest(token);

		await expect(authenticate(req, {} as Response, vi.fn())).rejects.toThrow(UnauthorizedError);
		await expect(authenticate(req, {} as Response, vi.fn())).rejects.toThrow(
			"Invalid access token payload",
		);
		expect(TokenBlacklist.findOne).not.toHaveBeenCalled();
		expect(User.findById).not.toHaveBeenCalled();
	});
});
