import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../_shared/common/errors";
import { TokenBlacklist, User } from "../infrastructure/model";
import * as AuthService from "./service";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../infrastructure/model", () => ({
	User: { findOne: vi.fn(), findById: vi.fn() },
	TokenBlacklist: { findOne: vi.fn(), create: vi.fn() },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_ID = "507f1f77bcf86cd799439011";
const USER_EMAIL = "carlos@cermont.com";
const USER_ROLE = "tecnico";
const SECRETS = {
	access: "test-jwt-secret-for-testing-only",
	refresh: "test-refresh-secret-for-testing-only",
} as const;

function buildMockUser(overrides: Record<string, unknown> = {}) {
	return {
		_id: { toString: () => USER_ID },
		name: "Carlos Díaz",
		email: USER_EMAIL,
		role: USER_ROLE,
		isActive: true,
		password: "hashed-password-12345",
		comparePassword: vi.fn().mockResolvedValue(true),
		save: vi.fn().mockResolvedValue(undefined),
		...overrides,
	};
}

function buildSelectQuery<T>(result: T) {
	return {
		select: vi.fn().mockResolvedValue(result),
	};
}

function buildLeanQuery<T>(result: T) {
	return {
		lean: vi.fn().mockResolvedValue(result),
	};
}

function makeRefreshToken(jti = "uuid-test", overrides: jwt.SignOptions = {}) {
	return jwt.sign({ _id: USER_ID, email: USER_EMAIL, role: USER_ROLE, jti }, SECRETS.refresh, {
		expiresIn: "7d",
		...overrides,
	});
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe("AuthService", () => {
	beforeEach(() => vi.clearAllMocks());

	// ── login() ────────────────────────────────────────────────────────────────

	describe("login()", () => {
		it("devuelve accessToken y datos del usuario en login válido", async () => {
			vi.mocked(User.findOne).mockReturnValue(buildSelectQuery(buildMockUser()) as never);

			const result = await AuthService.login(USER_EMAIL, "Cermont2026!");

			expect(result.accessToken).toBeTypeOf("string");
			expect(result.user).toMatchObject({
				_id: USER_ID,
				name: "Carlos Díaz",
				email: USER_EMAIL,
				role: USER_ROLE,
				isActive: true,
			});
		});

		it("lanza UnauthorizedError con contraseña incorrecta", async () => {
			const user = buildMockUser({ comparePassword: vi.fn().mockResolvedValue(false) });
			vi.mocked(User.findOne).mockReturnValue(buildSelectQuery(user) as never);

			await expect(AuthService.login(USER_EMAIL, "wrong")).rejects.toThrow(UnauthorizedError);
		});

		it("lanza NotFoundError si el usuario no existe", async () => {
			vi.mocked(User.findOne).mockReturnValue(buildSelectQuery(null) as never);

			await expect(AuthService.login("noexiste@cermont.com", "pass")).rejects.toThrow(
				NotFoundError,
			);
		});

		it("lanza UnauthorizedError si la cuenta está desactivada", async () => {
			vi.mocked(User.findOne).mockReturnValue(
				buildSelectQuery(buildMockUser({ isActive: false })) as never,
			);

			await expect(AuthService.login(USER_EMAIL, "Cermont2026!")).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	// ── refreshAccessToken() ───────────────────────────────────────────────────

	describe("refreshAccessToken()", () => {
		it("retorna nuevo accessToken con refresh token válido", async () => {
			vi.mocked(TokenBlacklist.findOne).mockResolvedValue(null);
			vi.mocked(User.findById).mockReturnValue(buildLeanQuery(buildMockUser()) as never);

			const result = await AuthService.refreshAccessToken(makeRefreshToken());

			expect(result.accessToken).toBeTypeOf("string");
		});

		it("lanza UnauthorizedError con token expirado", async () => {
			const expired = makeRefreshToken("jti", { expiresIn: "-1h" as unknown as number });

			await expect(AuthService.refreshAccessToken(expired)).rejects.toThrow(UnauthorizedError);
		});

		it("lanza UnauthorizedError con token en blacklist", async () => {
			vi.mocked(TokenBlacklist.findOne).mockResolvedValue({ jti: "blacklisted" } as never);

			await expect(AuthService.refreshAccessToken(makeRefreshToken("blacklisted"))).rejects.toThrow(
				UnauthorizedError,
			);
		});

		it("lanza UnauthorizedError si el usuario no existe o está desactivado", async () => {
			vi.mocked(TokenBlacklist.findOne).mockResolvedValue(null);
			vi.mocked(User.findById).mockReturnValue(buildLeanQuery(null) as never);

			await expect(AuthService.refreshAccessToken(makeRefreshToken())).rejects.toThrow(
				UnauthorizedError,
			);
		});
	});

	// ── changePassword() ──────────────────────────────────────────────────────

	describe("changePassword()", () => {
		it("actualiza la contraseña con la contraseña actual correcta", async () => {
			const mockUser = buildMockUser();
			vi.mocked(User.findById).mockReturnValue(buildSelectQuery(mockUser) as never);

			await AuthService.changePassword(USER_ID, {
				currentPassword: "OldPass123!",
				newPassword: "NewPass123!",
			});

			expect(mockUser.comparePassword).toHaveBeenCalledWith("OldPass123!");
			expect(mockUser.password).toBe("NewPass123!");
			expect(mockUser.save).toHaveBeenCalledOnce();
		});

		it("lanza UnauthorizedError si la contraseña actual es incorrecta", async () => {
			const mockUser = buildMockUser({ comparePassword: vi.fn().mockResolvedValue(false) });
			vi.mocked(User.findById).mockReturnValue(buildSelectQuery(mockUser) as never);

			await expect(
				AuthService.changePassword(USER_ID, {
					currentPassword: "wrong-old",
					newPassword: "NewPass123!",
				}),
			).rejects.toThrow(UnauthorizedError);

			expect(mockUser.save).not.toHaveBeenCalled();
		});

		it("lanza BadRequestError si la nueva contraseña es igual a la actual", async () => {
			const mockUser = buildMockUser();
			vi.mocked(User.findById).mockReturnValue(buildSelectQuery(mockUser) as never);

			await expect(
				AuthService.changePassword(USER_ID, {
					currentPassword: "OldPass123!",
					newPassword: "OldPass123!",
				}),
			).rejects.toThrow(BadRequestError);

			expect(mockUser.save).not.toHaveBeenCalled();
		});
	});

	// ── logout() ───────────────────────────────────────────────────────────────

	describe("logout()", () => {
		it("llama a TokenBlacklist.create exactamente 2 veces con reason: logout", async () => {
			const create = vi.fn().mockResolvedValue({});
			vi.mocked(TokenBlacklist.create).mockImplementation(create as never);

			const accessToken = jwt.sign({ _id: "u1", jti: "a-jti" }, SECRETS.access, {
				expiresIn: "15m",
			});
			const refreshToken = jwt.sign({ _id: "u1", jti: "r-jti" }, SECRETS.refresh, {
				expiresIn: "7d",
			});

			await AuthService.logout(accessToken, refreshToken);

			expect(create).toHaveBeenCalledTimes(2);
			expect(create).toHaveBeenCalledWith(expect.objectContaining({ reason: "logout" }));
		});
	});

	// ── Tiempos de expiración ──────────────────────────────────────────────────

	describe("Expiración de tokens", () => {
		it("access token expira en exactamente 15 minutos (900 s)", async () => {
			const { accessToken } = await AuthService.generateTokenPair(USER_ID, USER_EMAIL, USER_ROLE);
			const decoded = jwt.decode(accessToken) as { exp: number; iat: number };

			expect(decoded.exp - decoded.iat).toBe(900);
		});

		it("getRefreshTokenMaxAge retorna 7 días en segundos", () => {
			expect(AuthService.getRefreshTokenMaxAge()).toBe(604_800);
		});
	});
});
