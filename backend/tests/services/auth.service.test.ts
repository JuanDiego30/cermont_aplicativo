import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestError, UnauthorizedError } from "../../src/common/errors/AppError";
import { RefreshToken, TokenBlacklist, User } from "../../src/models";
import * as authService from "../../src/modules/auth/auth.service";

vi.mock("jsonwebtoken");
vi.mock("uuid", () => ({
	v4: vi
		.fn()
		.mockReturnValueOnce("family-id")
		.mockReturnValueOnce("access-jti")
		.mockReturnValueOnce("refresh-jti")
		.mockReturnValue("next-jti"),
}));
vi.mock("../../src/models", () => ({
	User: {
		findOne: vi.fn(),
		findById: vi.fn(),
		updateOne: vi.fn(),
	},
	TokenBlacklist: {
		findOne: vi.fn(),
		updateOne: vi.fn(),
	},
	RefreshToken: {
		create: vi.fn(),
		findOne: vi.fn(),
		findOneAndUpdate: vi.fn(),
		updateMany: vi.fn(),
		updateOne: vi.fn(),
		deleteMany: vi.fn(),
	},
}));
vi.mock("../../src/modules/audit/audit.service", () => ({
	createAuditLog: vi.fn(),
}));
vi.mock("../../src/common/utils/logger", () => ({
	createLogger: vi.fn().mockReturnValue({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
}));

function hashToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}

function mockFindOneSelect<T>(value: T) {
	return { select: vi.fn().mockResolvedValue(value) };
}

function mockFindOneLean<T>(value: T) {
	return { lean: vi.fn().mockResolvedValue(value) };
}

function mockRefreshSessionQuery<T>(value: T) {
	return {
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockReturnValue({
				exec: vi.fn().mockResolvedValue(value),
			}),
		}),
	};
}

function mockUserRefreshQuery<T>(value: T) {
	return {
		select: vi.fn().mockReturnValue({
			lean: vi.fn().mockReturnValue({
				exec: vi.fn().mockResolvedValue(value),
			}),
		}),
	};
}

function mockExec<T>(value: T) {
	return { exec: vi.fn().mockResolvedValue(value) };
}

describe("AuthService refresh token rotation", () => {
	const mockUserId = "507f1f77bcf86cd799439011";
	const userObjectId = new Types.ObjectId(mockUserId);
	const mockEmail = "test@cermont.com";
	const mockName = "Test User";
	const mockPassword = "SecurePass123!";
	const mockRole = "gerente";
	const currentRefreshToken = "current-refresh-token";

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(jwt.sign)
			.mockReturnValueOnce("new-access-token")
			.mockReturnValueOnce("new-refresh-token");
		vi.mocked(TokenBlacklist.findOne).mockReturnValue(mockFindOneLean(false));
		vi.mocked(TokenBlacklist.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
		vi.mocked(RefreshToken.create).mockResolvedValue(
			{} as Awaited<ReturnType<typeof RefreshToken.create>>,
		);
		vi.mocked(RefreshToken.updateMany).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
		vi.mocked(RefreshToken.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
	});

	it("persists a hashed refresh session on successful login", async () => {
		const mockUser = {
			_id: userObjectId,
			name: mockName,
			email: mockEmail,
			role: mockRole,
			isActive: true,
			tokenVersion: 0,
			comparePassword: vi.fn().mockResolvedValue(true),
		};
		vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

		const result = await authService.login(mockEmail, mockPassword);

		expect(result.accessToken).toBe("new-access-token");
		expect(result.refreshToken).toBe("new-refresh-token");
		expect(RefreshToken.create).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: userObjectId,
				tokenHash: hashToken("new-refresh-token"),
				tokenVersion: 0,
				status: expect.objectContaining({ state: "active" }),
			}),
		);
		expect(mockUser.comparePassword).toHaveBeenCalledWith(mockPassword);
	});

	it("rejects invalid credentials without creating a refresh session", async () => {
		vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(false));

		await expect(authService.login(mockEmail, mockPassword)).rejects.toThrow(UnauthorizedError);
		expect(RefreshToken.create).not.toHaveBeenCalled();
	});

	it("rotates the refresh token atomically and persists the replacement", async () => {
		const payload = {
			sub: mockUserId,
			role: mockRole,
			jti: "old-refresh-jti",
			familyId: "family-1",
			tokenVersion: 2,
			tokenType: "refresh",
		} satisfies JwtPayload;
		const session = {
			jti: "old-refresh-jti",
			userId: userObjectId,
			familyId: "family-1",
			tokenHash: hashToken(currentRefreshToken),
			tokenVersion: 2,
			expiresAt: new Date(Date.now() + 60_000),
			status: {
				state: "active",
				changedAt: new Date(),
				reason: "none",
				replacedByJti: "",
			},
		} as const;
		const user = {
			_id: userObjectId,
			email: mockEmail,
			role: mockRole,
			isActive: true,
			tokenVersion: 2,
		};

		vi.mocked(jwt.verify).mockReturnValue(payload);
		vi.mocked(RefreshToken.findOne).mockReturnValue(mockRefreshSessionQuery(session));
		vi.mocked(User.findById).mockReturnValue(mockUserRefreshQuery(user));
		vi.mocked(RefreshToken.findOneAndUpdate).mockReturnValue(mockExec({ rotated: true }));

		const result = await authService.refreshAccessToken(currentRefreshToken);

		expect(result).toEqual({
			accessToken: "new-access-token",
			refreshToken: "new-refresh-token",
		});
		expect(RefreshToken.findOneAndUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				jti: "old-refresh-jti",
				"status.state": "active",
			}),
			expect.objectContaining({
				$set: {
					status: expect.objectContaining({
						state: "rotated",
						reason: "rotation",
					}),
				},
			}),
			{ returnDocument: "after" },
		);
		expect(RefreshToken.create).toHaveBeenCalledTimes(1);
	});

	it("detects reuse of a rotated token and invalidates the whole family", async () => {
		const payload = {
			sub: mockUserId,
			role: mockRole,
			jti: "reused-jti",
			familyId: "family-1",
			tokenVersion: 2,
			tokenType: "refresh",
		} satisfies JwtPayload;
		const session = {
			jti: "reused-jti",
			userId: userObjectId,
			familyId: "family-1",
			tokenHash: hashToken(currentRefreshToken),
			tokenVersion: 2,
			expiresAt: new Date(Date.now() + 60_000),
			status: {
				state: "rotated",
				changedAt: new Date(),
				reason: "rotation",
				replacedByJti: "replacement-jti",
			},
		} as const;

		vi.mocked(jwt.verify).mockReturnValue(payload);
		vi.mocked(RefreshToken.findOne).mockReturnValue(mockRefreshSessionQuery(session));

		await expect(authService.refreshAccessToken(currentRefreshToken)).rejects.toThrow(
			/refresh token reuse/i,
		);
		expect(RefreshToken.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ familyId: "family-1" }),
			expect.objectContaining({
				$set: {
					status: expect.objectContaining({
						state: "compromised",
						reason: "reuse_detected",
					}),
				},
			}),
		);
		expect(User.updateOne).toHaveBeenCalledWith(
			{ _id: userObjectId },
			{ $inc: { tokenVersion: 1 } },
		);
	});

	it("rejects a refresh token whose version no longer matches the user", async () => {
		const payload = {
			sub: mockUserId,
			role: mockRole,
			jti: "old-version-jti",
			familyId: "family-1",
			tokenVersion: 1,
			tokenType: "refresh",
		} satisfies JwtPayload;
		const session = {
			jti: "old-version-jti",
			userId: userObjectId,
			familyId: "family-1",
			tokenHash: hashToken(currentRefreshToken),
			tokenVersion: 1,
			expiresAt: new Date(Date.now() + 60_000),
			status: {
				state: "active",
				changedAt: new Date(),
				reason: "none",
				replacedByJti: "",
			},
		} as const;

		vi.mocked(jwt.verify).mockReturnValue(payload);
		vi.mocked(RefreshToken.findOne).mockReturnValue(mockRefreshSessionQuery(session));
		vi.mocked(User.findById).mockReturnValue(
			mockUserRefreshQuery({
				_id: userObjectId,
				email: mockEmail,
				role: mockRole,
				isActive: true,
				tokenVersion: 2,
			}),
		);

		await expect(authService.refreshAccessToken(currentRefreshToken)).rejects.toThrow(
			/token version/i,
		);
		expect(RefreshToken.findOneAndUpdate).not.toHaveBeenCalled();
	});

	it("revokes access and refresh identifiers on logout", async () => {
		vi.mocked(jwt.decode)
			.mockReturnValueOnce({
				sub: mockUserId,
				jti: "access-jti",
				exp: Math.floor(Date.now() / 1000) + 900,
			})
			.mockReturnValueOnce({
				sub: mockUserId,
				jti: "refresh-jti",
				exp: Math.floor(Date.now() / 1000) + 604_800,
			});

		await authService.logout("access-token", "refresh-token");

		expect(TokenBlacklist.updateOne).toHaveBeenCalledTimes(2);
		expect(RefreshToken.updateOne).toHaveBeenCalledWith(
			{ jti: "refresh-jti", "status.state": "active" },
			expect.objectContaining({
				$set: {
					status: expect.objectContaining({ state: "revoked", reason: "logout" }),
				},
			}),
		);
	});

	it("removes refresh sessions retained more than seven days after expiration", async () => {
		vi.mocked(RefreshToken.deleteMany).mockResolvedValue({
			acknowledged: true,
			deletedCount: 3,
		});
		const now = new Date("2026-06-11T12:00:00.000Z");

		const deleted = await authService.cleanupExpiredRefreshTokens(now);

		expect(deleted).toBe(3);
		expect(RefreshToken.deleteMany).toHaveBeenCalledWith({
			expiresAt: { $lte: new Date("2026-06-04T12:00:00.000Z") },
		});
	});

	it("keeps access tokens at fifteen minutes and refresh cookies at seven days", async () => {
		vi.mocked(jwt.sign).mockReturnValueOnce("access-token").mockReturnValueOnce("refresh-token");

		const pair = await authService.generateTokenPair(mockUserId, mockEmail, mockRole);

		expect(pair.expiresIn).toBe(15 * 60);
		expect(authService.getRefreshTokenMaxAge()).toBe(7 * 24 * 60 * 60);
		expect(jwt.sign).toHaveBeenNthCalledWith(
			1,
			expect.objectContaining({ tokenType: "access" }),
			expect.any(String),
			{ expiresIn: "15m" },
		);
		expect(jwt.sign).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ tokenType: "refresh" }),
			expect.any(String),
			{ expiresIn: "7d" },
		);
	});

	describe("generateResetToken", () => {
		it("generates a reset token and stores SHA-256 hash on user", async () => {
			const mockUser = {
				_id: userObjectId,
				email: mockEmail,
			};
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

			const rawToken = await authService.generateResetToken(mockEmail);

			expect(rawToken).toBeTruthy();
			expect(typeof rawToken).toBe("string");
			expect(rawToken.length).toBe(64); // 32 bytes hex

			expect(User.updateOne).toHaveBeenCalledWith(
				{ _id: userObjectId },
				expect.objectContaining({
					$set: expect.objectContaining({
						resetPasswordToken: expect.stringMatching(/^[a-f0-9]{64}$/),
						resetPasswordExpires: expect.any(Date),
					}),
				}),
			);
		});

		it("returns empty string for non-existent user (anti-enumeration)", async () => {
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null));

			const rawToken = await authService.generateResetToken("nonexistent@test.com");

			expect(rawToken).toBe("");
			expect(User.updateOne).not.toHaveBeenCalled();
		});

		it("returns empty string for inactive user (anti-enumeration)", async () => {
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null));

			const rawToken = await authService.generateResetToken("inactive@test.com");

			expect(rawToken).toBe("");
		});
	});

	describe("resetPassword", () => {
		it("resets password with valid token and revokes sessions", async () => {
			const rawToken = crypto.randomBytes(32).toString("hex");
			const tokenHash = hashToken(rawToken);

			const mockUser = {
				_id: userObjectId,
				email: mockEmail,
				role: mockRole,
				isActive: true,
				tokenVersion: 0,
				password: "old-hashed-password",
				resetPasswordToken: tokenHash,
				resetPasswordExpires: new Date(Date.now() + 3600_000),
				save: vi.fn().mockResolvedValue({}),
			};
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(mockUser));

			await authService.resetPassword(rawToken, "NewSecurePass1!");

			expect(mockUser.password).toBe("NewSecurePass1!");
			expect(mockUser.tokenVersion).toBe(1);
			expect(mockUser.resetPasswordToken).toBeUndefined();
			expect(mockUser.resetPasswordExpires).toBeUndefined();
			expect(mockUser.save).toHaveBeenCalled();
			expect(RefreshToken.updateMany).toHaveBeenCalledWith(
				{ userId: userObjectId, "status.state": "active" },
				expect.objectContaining({
					$set: expect.objectContaining({
						status: expect.objectContaining({
							state: "revoked",
							reason: "password_change",
						}),
					}),
				}),
			);
		});

		it("rejects invalid token", async () => {
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null));

			await expect(authService.resetPassword("invalid-token", "NewSecurePass1!")).rejects.toThrow(
				BadRequestError,
			);
		});

		it("rejects expired token", async () => {
			const rawToken = crypto.randomBytes(32).toString("hex");
			const tokenHash = hashToken(rawToken);

			const mockUser = {
				_id: userObjectId,
				email: mockEmail,
				password: "old-hashed-password",
				tokenVersion: 0,
				resetPasswordToken: tokenHash,
				resetPasswordExpires: new Date(Date.now() - 3600_000), // expired 1 hour ago
				save: vi.fn().mockResolvedValue({}),
			};
			vi.mocked(User.findOne).mockReturnValue(mockFindOneSelect(null));

			await expect(authService.resetPassword(rawToken, "NewSecurePass1!")).rejects.toThrow(
				BadRequestError,
			);
		});

		it("rejects empty token", async () => {
			await expect(authService.resetPassword("", "NewSecurePass1!")).rejects.toThrow(
				BadRequestError,
			);
		});
	});
});
