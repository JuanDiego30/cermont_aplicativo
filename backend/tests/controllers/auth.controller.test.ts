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
const mockGenerateResetToken = vi.fn();
const mockSendResetPasswordEmail = vi.fn();
const mockResetPassword = vi.fn();

vi.mock("../../src/modules/auth/auth.service", () => ({
	login: mockLogin,
	refreshAccessToken: mockRefreshAccessToken,
	logout: mockLogout,
	getRefreshTokenMaxAge: () => mockGetRefreshTokenMaxAge(),
	generateResetToken: (...args: string[]) => mockGenerateResetToken(...args),
	sendResetPasswordEmail: (...args: string[]) => mockSendResetPasswordEmail(...args),
	resetPassword: (...args: string[]) => mockResetPassword(...args),
}));

vi.mock("../../src/modules/user/user.service", () => ({
	getUserById: vi.fn(),
	updateUser: vi.fn(),
	getUserByEmail: vi.fn(),
	deleteUser: vi.fn(),
}));

const importController = async () => import("../../src/modules/auth/auth.controller");
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
			expect(res.cookie).toHaveBeenNthCalledWith(
				1,
				"refreshToken",
				"refresh-token-123",
				expect.objectContaining({
					httpOnly: true,
					secure: false,
					sameSite: "lax",
				}),
			);
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

		it("should mark cookies secure behind an HTTPS reverse proxy", async () => {
			mockLogin.mockResolvedValue({
				accessToken: "access-token-123",
				refreshToken: "refresh-token-123",
				user: { _id: "user-1", name: "Test User", email: "test@cermont.com", role: "gerente" },
			});

			const req = mockReq({
				body: { email: "test@cermont.com", password: "password123" },
				headers: { "x-forwarded-proto": "https" },
			});
			const res = mockRes();

			await controller.login(req, res);

			expect(res.cookie).toHaveBeenNthCalledWith(
				1,
				"refreshToken",
				"refresh-token-123",
				expect.objectContaining({
					httpOnly: true,
					secure: true,
					sameSite: "lax",
				}),
			);
			expect(res.cookie).toHaveBeenNthCalledWith(
				2,
				"userRole",
				"gerente",
				expect.objectContaining({
					httpOnly: false,
					secure: true,
					sameSite: "lax",
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

	describe("forgotPassword", () => {
		it("should generate reset token and send email", async () => {
			mockGenerateResetToken.mockResolvedValue("raw-token-123");
			mockSendResetPasswordEmail.mockResolvedValue({ success: true, messageId: "msg-1" });

			const req = mockReq({
				body: { email: "user@test.com" },
			});
			const res = mockRes();
			const { forgotPassword } = controller;

			await forgotPassword(req, res);

			expect(mockGenerateResetToken).toHaveBeenCalledWith("user@test.com");
			expect(mockSendResetPasswordEmail).toHaveBeenCalledWith("user@test.com", "raw-token-123");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						message: expect.stringContaining("instrucciones"),
					}),
				}),
			);
		});

		it("should not send email for non-existent user (anti-enumeration)", async () => {
			mockGenerateResetToken.mockResolvedValue("");

			const req = mockReq({
				body: { email: "unregistered@test.com" },
			});
			const res = mockRes();
			const { forgotPassword } = controller;

			await forgotPassword(req, res);

			expect(mockGenerateResetToken).toHaveBeenCalledWith("unregistered@test.com");
			expect(mockSendResetPasswordEmail).not.toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("should return generic success even when email fails", async () => {
			mockGenerateResetToken.mockResolvedValue("raw-token-456");
			mockSendResetPasswordEmail.mockResolvedValue({ success: false, error: "SMTP down" });

			const req = mockReq({
				body: { email: "user@test.com" },
			});
			const res = mockRes();
			const { forgotPassword } = controller;

			await forgotPassword(req, res);

			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						message: expect.stringContaining("instrucciones"),
					}),
				}),
			);
		});
	});

	describe("resetPassword", () => {
		it("should reset password with valid token", async () => {
			mockResetPassword.mockImplementation(async () => {});

			const req = mockReq({
				body: { token: "valid-token", password: "NewSecurePass123!" },
			});
			const res = mockRes();
			const { resetPassword } = controller;

			await resetPassword(req, res);

			expect(mockResetPassword).toHaveBeenCalledWith("valid-token", "NewSecurePass123!");
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith(
				expect.objectContaining({
					success: true,
					data: expect.objectContaining({
						message: expect.stringContaining("restablecida"),
					}),
				}),
			);
		});

		it("should propagate BadRequestError for invalid token", async () => {
			const { BadRequestError } = await import("../../src/common/errors/AppError");
			mockResetPassword.mockRejectedValue(
				new BadRequestError("PASSWORD_RESET_TOKEN_INVALID", "Invalid token"),
			);

			const req = mockReq({
				body: { token: "bad-token", password: "NewSecurePass123!" },
			});
			const res = mockRes();
			const { resetPassword } = controller;

			await expect(resetPassword(req, res)).rejects.toThrow(BadRequestError);
		});
	});
});
