import crypto from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "../../src/common/errors/AppError";
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
function mockFindOneSelectable<T>(value: T) {
	return vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(value) });
}

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
vi.mock("../../src/services/messaging/email.gateway", () => ({
	emailGateway: {
		channel: "email",
		send: vi.fn(),
	},
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
});

describe("AuthService password recovery", () => {
	const mockUserId = "507f1f77bcf86cd799439011";
	const userObjectId = new Types.ObjectId(mockUserId);
	const mockEmail = "test@cermont.com";
	const mockRawToken = crypto.randomBytes(32).toString("hex");
	const mockNewPassword = "NewSecurePass123!";

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(User.updateOne).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
		vi.mocked(RefreshToken.updateMany).mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null,
		});
	});

	describe("generateResetToken", () => {
		it("generates a reset token and stores SHA-256 hash on user", async () => {
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue({
					_id: userObjectId,
				}),
			});

			const rawToken = await authService.generateResetToken(mockEmail);

			expect(rawToken).toBeTruthy();
			expect(typeof rawToken).toBe("string");
			expect(rawToken.length).toBe(64); // 32 bytes = 64 hex chars
			expect(User.updateOne).toHaveBeenCalledWith(
				{ _id: userObjectId },
				expect.objectContaining({
					$set: expect.objectContaining({
						resetPasswordToken: hashToken(rawToken),
						resetPasswordExpires: expect.any(Date),
					}),
				}),
			);
		});

		it("returns empty string for non-existent user (anti-enumeration)", async () => {
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue(null),
			});

			const result = await authService.generateResetToken("nonexistent@test.com");

			expect(result).toBe("");
			expect(User.updateOne).not.toHaveBeenCalled();
		});

		it("returns empty string for inactive user (anti-enumeration)", async () => {
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue(null),
			});

			const result = await authService.generateResetToken("inactive@test.com");

			expect(result).toBe("");
		});
	});

	describe("sendResetPasswordEmail", () => {
		it("sends email via gateway and returns success", async () => {
			const { emailGateway } = await import("../../src/services/messaging/email.gateway");
			vi.mocked(emailGateway.send).mockResolvedValue({
				success: true,
				messageId: "test-msg-123",
				sentAt: new Date(),
			});

			const result = await authService.sendResetPasswordEmail(mockEmail, mockRawToken);

			expect(result.success).toBe(true);
			expect(result.messageId).toBe("test-msg-123");
			expect(emailGateway.send).toHaveBeenCalledWith(
				expect.objectContaining({
					to: mockEmail,
					subject: expect.stringContaining("Restablece tu contraseña"),
				}),
			);
		});

		it("returns failure when gateway fails", async () => {
			const { emailGateway } = await import("../../src/services/messaging/email.gateway");
			vi.mocked(emailGateway.send).mockResolvedValue({
				success: false,
				error: "Connection refused",
				sentAt: new Date(),
			});

			const result = await authService.sendResetPasswordEmail(mockEmail, mockRawToken);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Connection refused");
		});
	});

	describe("resetPassword", () => {
		it("resets password with valid token and revokes sessions", async () => {
			const tokenHash = hashToken(mockRawToken);
			const mockUser = {
				_id: userObjectId,
				resetPasswordToken: tokenHash,
				resetPasswordExpires: new Date(Date.now() + 3600000),
				password: "old-hashed-password",
				tokenVersion: 0,
				save: vi.fn().mockResolvedValue(undefined),
			};
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue(mockUser),
			});

			await authService.resetPassword(mockRawToken, mockNewPassword);

			expect(mockUser.password).toBe(mockNewPassword);
			expect(mockUser.tokenVersion).toBe(1);
			expect(mockUser.resetPasswordToken).toBeUndefined();
			expect(mockUser.resetPasswordExpires).toBeUndefined();
			expect(mockUser.save).toHaveBeenCalled();
			expect(RefreshToken.updateMany).toHaveBeenCalledWith(
				{ userId: userObjectId, "status.state": "active" },
				expect.objectContaining({
					$set: expect.objectContaining({
						status: expect.objectContaining({ state: "revoked", reason: "password_change" }),
					}),
				}),
			);
		});

		it("rejects invalid token", async () => {
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue(null),
			});

			await expect(
				authService.resetPassword("invalid-token", mockNewPassword),
			).rejects.toThrow("inválido");
		});

		it("rejects expired token", async () => {
			const tokenHash = hashToken(mockRawToken);
			const mockExpiredUser = {
				_id: userObjectId,
				resetPasswordToken: tokenHash,
				resetPasswordExpires: new Date(Date.now() - 3600000),
			};
			vi.mocked(User.findOne)
				.mockReturnValueOnce({
					select: vi.fn().mockResolvedValueOnce(null), // First query (valid + non-expired) returns null
				})
				.mockReturnValueOnce({
					select: vi.fn().mockResolvedValueOnce(mockExpiredUser), // Second query (check expired) returns user
				});

			await expect(
				authService.resetPassword(mockRawToken, mockNewPassword),
			).rejects.toThrow("expirado");
		});

		it("rejects empty token", async () => {
			vi.mocked(User.findOne).mockReturnValue({
				select: vi.fn().mockResolvedValue(null),
			});

			await expect(authService.resetPassword("", mockNewPassword)).rejects.toThrow();
		});
	});
});
