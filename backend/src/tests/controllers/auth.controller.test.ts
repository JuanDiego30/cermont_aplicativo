/**
 * Auth Controller Tests
 *
 * Tests HTTP layer for authentication endpoints.
 * Mocks service layer to avoid MongoDB dependency.
 */
import type { Request, Response } from "express";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service module before importing controller
const mockLogin = vi.fn();
const mockRefreshAccessToken = vi.fn();
const mockLogout = vi.fn();
const mockGetRefreshTokenMaxAge = vi.fn();

vi.mock("../../modules/auth/auth.service.js", () => ({
	login: mockLogin,
	refreshAccessToken: mockRefreshAccessToken,
	logout: mockLogout,
	getRefreshTokenMaxAge: () => mockGetRefreshTokenMaxAge(),
}));

const importController = async () => import("../../modules/auth/auth.controller.js");
type AuthControllerModule = Awaited<ReturnType<typeof importController>>;

let controller: AuthControllerModule;

function mockReq(overrides: Partial<Request> = {}): Request {
	return {
		query: {},
		params: {},
		body: {},
		headers: {},
		cookies: {},
		ip: "127.0.0.1",
		secure: false,
		protocol: "http",
		...overrides,
	} as Request;
}

function mockRes(): Response {
	const res: Partial<Response> = {};
	res.status = vi.fn().mockReturnValue(res);
	res.json = vi.fn().mockReturnValue(res);
	res.cookie = vi.fn().mockReturnValue(res);
	res.clearCookie = vi.fn().mockReturnValue(res);
	return res as Response;
}

describe("AuthController", () => {
	beforeAll(async () => {
		controller = await importController();
	}, 10_000);

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetRefreshTokenMaxAge.mockReturnValue(604800);
	});

	describe("login", () => {
		it("should login successfully and set cookies", async () => {
			const loginResult = {
				accessToken: "access-token-123",
				refreshToken: "refresh-token-123",
				user: { _id: "user-1", name: "Test User", email: "test@cermont.com", role: "gerente" },
			};
			mockLogin.mockResolvedValue(loginResult);

			const req = mockReq({
				body: { email: "test@cermont.com", password: "password123" },
			});
			const res = mockRes();
			const { login } = controller;

			await login(req, res);

			expect(mockLogin).toHaveBeenCalledWith("test@cermont.com", "password123");
			expect(res.cookie).toHaveBeenCalledTimes(2);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						accessToken: "access-token-123",
					}),
				}),
			);
		});
	});

	describe("refresh", () => {
		it("should refresh token successfully", async () => {
			mockRefreshAccessToken.mockResolvedValue({ accessToken: "new-access-token" });

			const req = mockReq({
				cookies: { refreshToken: "valid-refresh-token" },
			});
			const res = mockRes();
			const { refresh } = controller;

			await refresh(req, res);

			expect(mockRefreshAccessToken).toHaveBeenCalledWith("valid-refresh-token");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: { accessToken: "new-access-token" },
				}),
			);
		});

		it("should throw when no refresh token cookie", async () => {
			const req = mockReq({ cookies: {} });
			const res = mockRes();
			const { refresh } = controller;

			await expect(refresh(req, res)).rejects.toThrow("Refresh token not found");
		});
	});

	describe("logout", () => {
		it("should logout successfully and clear cookies", async () => {
			mockLogout.mockImplementation(async () => {});

			const req = mockReq({
				headers: { authorization: "Bearer access-token-123" },
				cookies: { refreshToken: "refresh-token-123" },
			});
			const res = mockRes();
			const { logout } = controller;

			await logout(req, res);

			expect(mockLogout).toHaveBeenCalledWith("access-token-123", "refresh-token-123");
			expect(res.clearCookie).toHaveBeenCalledTimes(2);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});
});
