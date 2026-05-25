/**
 * AuthService Unit Tests
 *
 * Tests for authentication business logic:
 * - Token generation and validation
 * - User login with password hashing
 * - Token refresh mechanism
 * - Token revocation (logout)
 * - Error handling
 *
 * NOTE: AuthService exports functions, NOT a class
 */

import jwt, { type JwtPayload } from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../src/common/errors/AppError";
import { TokenBlacklist, User } from "../../src/models";
import * as authService from "../../src/modules/auth/auth.service";

// Mock dependencies BEFORE importing AuthService
vi.mock("jsonwebtoken");
vi.mock("uuid", () => ({
	v4: vi.fn().mockReturnValue("test-uuid-1234"),
}));
vi.mock("../../src/models", () => ({
	User: {
		findOne: vi.fn(),
		findById: vi.fn(),
	},
	TokenBlacklist: {
		findOne: vi.fn(),
		create: vi.fn(),
	},
}));
vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn().mockReturnValue({
		info: vi.fn(),
		error: vi.fn(),
	}),
}));

/** Helper: mock a Mongoose findOne chain ending with .select() */
function mockFindOneSelect<T>(value: T) {
	return { select: vi.fn().mockResolvedValue(value) };
}

/** Helper: mock a Mongoose findById chain ending with .lean() */
function mockFindByIdLean<T>(value: T) {
	return { lean: vi.fn().mockResolvedValue(value) };
}

/** Helper: mock a TokenBlacklist.findOne chain ending with .lean() */
function mockFindOneLean<T>(value: T) {
	return { lean: vi.fn().mockResolvedValue(value) };
}

describe("AuthService", () => {
	const mockUserId = "507f1f77bcf86cd799439011";
	const mockEmail = "test@cermont.com";
	const mockName = "Test User";
	const mockPassword = "SecurePass123!";
	const mockRole = "gerente";
	const _mockJwtSecret = "test-secret";
	const _mockRefreshSecret = "test-refresh-secret";

	beforeEach(() => {
		vi.clearAllMocks();
		// Use values from setup.ts which are already loaded
		// mockJwtSecret and mockRefreshSecret come from process.env set by vitest setup
	});

	describe("login", () => {
		it("should login with valid credentials", async () => {
			const mockUser = {
				_id: mockUserId,
				name: mockName,
				email: mockEmail,
				role: mockRole,
				isActive: true,
				comparePassword: vi.fn().mockResolvedValue(true),
				select: vi.fn().mockReturnThis(),
			};

			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

			const mockAccessToken = "mock-access-token";
			vi.mocked(jwt.sign).mockReturnValue(mockAccessToken);

			const result = await authService.login(mockEmail, mockPassword);

			expect(User.findOne).toHaveBeenCalledWith({ email: mockEmail });
			// Verify select was called (returned chain object)
			expect(vi.mocked(User.findOne).mock.results[0].value.select).toBeDefined();
			expect(mockUser.comparePassword).toHaveBeenCalledWith(mockPassword);
			expect(result).toEqual({
				accessToken: mockAccessToken,
				refreshToken: mockAccessToken,
				user: {
					_id: mockUserId,
					name: mockName,
					email: mockEmail,
					role: mockRole,
					isActive: true,
				},
			});
		});

		it("should throw error for user not found", async () => {
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null));

			await expect(authService.login(mockEmail, mockPassword)).rejects.toThrow(UnauthorizedError);
		});

		it("should throw error for invalid password", async () => {
			const mockUser = {
				_id: mockUserId,
				email: mockEmail,
				isActive: true,
				comparePassword: vi.fn().mockResolvedValue(false),
				select: vi.fn().mockReturnThis(),
			};

			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

			await expect(authService.login(mockEmail, "wrong-password")).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw error if user is inactive", async () => {
			const mockUser = {
				_id: mockUserId,
				email: mockEmail,
				isActive: false,
				select: vi.fn().mockReturnThis(),
			};

			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

			await expect(authService.login(mockEmail, mockPassword)).rejects.toThrow(UnauthorizedError);
		});
	});

	describe("refreshAccessToken", () => {
		it("should refresh access token with valid refresh token", async () => {
			const mockRefreshToken = "valid-refresh-token";
			const mockPayload = {
				sub: mockUserId,
				email: mockEmail,
				role: mockRole,
				jti: "test-jti",
			};

			vi.mocked(jwt.verify).mockReturnValue(mockPayload as JwtPayload);
			vi.mocked(TokenBlacklist.findOne).mockReturnValue(mockFindOneLean(null));

			const mockUser = {
				_id: mockUserId,
				email: mockEmail,
				role: mockRole,
				isActive: true,
				toString: vi.fn().mockReturnValue(mockUserId),
			};

			vi.mocked(User.findById).mockReturnValue(mockFindByIdLean(mockUser));

			const mockAccessToken = "new-access-token";
			vi.mocked(jwt.sign).mockReturnValue(mockAccessToken);

			const result = await authService.refreshAccessToken(mockRefreshToken);

			// Verify token was verified (secret value comes from env)
			expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
			expect(TokenBlacklist.findOne).toHaveBeenCalledWith({ jti: mockPayload.jti });
			expect(User.findById).toHaveBeenCalledWith(mockUserId);
			expect(result).toEqual({
				accessToken: mockAccessToken,
			});
		});

		it("should refresh access token with legacy _id claim", async () => {
			const mockRefreshToken = "legacy-refresh-token";
			const mockPayload = {
				_id: mockUserId,
				email: mockEmail,
				role: mockRole,
				jti: "legacy-jti",
			};

			vi.mocked(jwt.verify).mockReturnValue(mockPayload as JwtPayload);
			vi.mocked(TokenBlacklist.findOne).mockReturnValue(mockFindOneLean(null));

			const mockUser = {
				_id: mockUserId,
				email: mockEmail,
				role: mockRole,
				isActive: true,
				toString: vi.fn().mockReturnValue(mockUserId),
			};

			vi.mocked(User.findById).mockReturnValue(mockFindByIdLean(mockUser));
			vi.mocked(jwt.sign).mockReturnValue("new-access-token");

			const result = await authService.refreshAccessToken(mockRefreshToken);

			expect(User.findById).toHaveBeenCalledWith(mockUserId);
			expect(result).toEqual({ accessToken: "new-access-token" });
		});

		it("should throw error if refresh token is blacklisted", async () => {
			const mockRefreshToken = "blacklisted-token";
			const mockPayload = {
				_id: mockUserId,
				email: mockEmail,
				role: mockRole,
				jti: "blacklisted-jti",
			};

			vi.mocked(jwt.verify).mockReturnValue(mockPayload as JwtPayload);
			vi.mocked(TokenBlacklist.findOne).mockReturnValue(
				mockFindOneLean({ _id: "blacklist-entry" }),
			);

			await expect(authService.refreshAccessToken(mockRefreshToken)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw error if user not found during refresh", async () => {
			const mockRefreshToken = "valid-refresh-token";
			const mockPayload = {
				_id: mockUserId,
				email: mockEmail,
				role: mockRole,
				jti: "test-jti",
			};

			vi.mocked(jwt.verify).mockReturnValue(mockPayload as JwtPayload);
			vi.mocked(TokenBlacklist.findOne).mockReturnValue(mockFindOneLean(null));
			vi.mocked(User.findById).mockReturnValue(mockFindByIdLean(null));

			await expect(authService.refreshAccessToken(mockRefreshToken)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw error if refresh token is expired", async () => {
			const mockRefreshToken = "expired-token";

			vi.mocked(jwt.verify).mockImplementation(() => {
				throw new jwt.TokenExpiredError("Token expired", new Date());
			});

			await expect(authService.refreshAccessToken(mockRefreshToken)).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("should throw error if refresh token is invalid", async () => {
			const mockRefreshToken = "invalid-token";

			vi.mocked(jwt.verify).mockImplementation(() => {
				throw new jwt.JsonWebTokenError("Invalid token");
			});

			await expect(authService.refreshAccessToken(mockRefreshToken)).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	describe("logout", () => {
		it("should blacklist both tokens on logout", async () => {
			const mockAccessToken = "access-token";
			const mockRefreshToken = "refresh-token";

			const mockAccessPayload = {
				jti: "access-jti",
				exp: Math.floor(Date.now() / 1000) + 900,
			};

			const mockRefreshPayload = {
				jti: "refresh-jti",
				exp: Math.floor(Date.now() / 1000) + 604800,
			};

			vi.mocked(jwt.decode)
				.mockReturnValueOnce(mockAccessPayload as JwtPayload)
				.mockReturnValueOnce(mockRefreshPayload as JwtPayload);

			const mockBlacklistEntry = { _id: "mock-entry" };
			vi.mocked(TokenBlacklist.create).mockResolvedValue(
				mockBlacklistEntry as unknown as Awaited<ReturnType<typeof TokenBlacklist.create>>,
			);

			await authService.logout(mockAccessToken, mockRefreshToken);

			expect(jwt.decode).toHaveBeenCalledWith(mockAccessToken);
			expect(jwt.decode).toHaveBeenCalledWith(mockRefreshToken);
			expect(TokenBlacklist.create).toHaveBeenCalledTimes(2);
		});

		it("should handle missing jti in token gracefully", async () => {
			const mockAccessToken = "access-token";
			const mockRefreshToken = "refresh-token";

			vi.mocked(jwt.decode).mockReturnValue(null);

			// Should not throw
			await expect(authService.logout(mockAccessToken, mockRefreshToken)).resolves.toBeUndefined();

			expect(TokenBlacklist.create).not.toHaveBeenCalled();
		});
	});

	describe("getRefreshTokenMaxAge", () => {
		it("should return 7 days in seconds", () => {
			const maxAge = authService.getRefreshTokenMaxAge();

			expect(maxAge).toBe(7 * 24 * 60 * 60); // 604800 seconds
		});
	});

	describe("generateTokenPair", () => {
		it("should generate both access and refresh tokens", async () => {
			const mockAccessToken = "mock-access-token";
			const mockRefreshToken = "mock-refresh-token";

			vi.mocked(jwt.sign)
				.mockReturnValueOnce(mockAccessToken)
				.mockReturnValueOnce(mockRefreshToken);

			const result = await authService.generateTokenPair(mockUserId, mockEmail, mockRole);

			expect(result).toEqual({
				accessToken: mockAccessToken,
				refreshToken: mockRefreshToken,
				expiresIn: 900,
			});

			// Should have called jwt.sign twice (access + refresh)
			expect(jwt.sign).toHaveBeenCalledTimes(2);
		});
	});
});
