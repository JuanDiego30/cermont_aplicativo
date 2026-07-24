import crypto from "node:crypto";
import type { ChangePasswordInput } from "@cermont/shared-types";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
	AppError,
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { RefreshToken, TokenBlacklist, User } from "../../models";
import { emailGateway } from "../../services/messaging/email.gateway";
import { createAuditLog } from "../audit/audit.service";

const log = createLogger("auth-service");

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const ACCESS_EXPIRES_IN = 15 * 60;
const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_RETENTION_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_TOKEN_BYTES = 32; // 256 bits
// const PASSWORD_RESET_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min — reserved for future use

// ─── Exported Interfaces ────────────────────────────────────────────────────

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

interface PersistableTokenPair extends TokenPair {
	accessJti: string;
	refreshJti: string;
	familyId: string;
	tokenVersion: number;
	refreshExpiresAt: Date;
}

export interface LoginContract {
	accessToken: string;
	refreshToken: string;
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
		isActive: boolean;
	};
}

export interface RefreshContract {
	accessToken: string;
	refreshToken: string;
}

export interface PasswordResetTokenResult {
	token: string;
	email: string;
}

// ─── Internal Types ─────────────────────────────────────────────────────────

interface JwtClaims extends JwtPayload {
	sub?: string;
	_id?: string;
	role?: string;
	jti?: string;
	tokenVersion?: number;
	familyId?: string;
	tokenType?: "access" | "refresh";
}

interface DecodedToken extends JwtPayload {
	sub?: string;
	_id?: string;
	jti?: string;
}

interface RefreshSessionRecord {
	jti: string;
	userId: Types.ObjectId;
	familyId: string;
	tokenHash: string;
	tokenVersion: number;
	expiresAt: Date;
	status: {
		state: "active" | "rotated" | "revoked" | "compromised";
		changedAt: Date;
		reason: "none" | "rotation" | "logout" | "password_change" | "reuse_detected" | "expired";
		replacedByJti: string;
	};
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getJwtSecret(): string {
	if (!env.JWT_SECRET) {
		throw new AppError("JWT_SECRET not configured", 500, "CONFIG_ERROR");
	}
	return env.JWT_SECRET;
}

function getRefreshTokenSecret(): string {
	if (!env.REFRESH_TOKEN_SECRET) {
		throw new AppError("REFRESH_TOKEN_SECRET not configured", 500, "CONFIG_ERROR");
	}
	return env.REFRESH_TOKEN_SECRET;
}

function signAccessToken(payload: JwtClaims): string {
	return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(payload: JwtClaims): string {
	return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

function buildTokenPair(
	userId: string,
	role: string,
	tokenVersion: number,
	familyId: string = uuidv4(),
): PersistableTokenPair {
	const accessJti = uuidv4();
	const refreshJti = uuidv4();
	const common = { sub: userId, role, tokenVersion };

	return {
		accessToken: signAccessToken({
			...common,
			jti: accessJti,
			tokenType: "access",
		}),
		refreshToken: signRefreshToken({
			...common,
			jti: refreshJti,
			familyId,
			tokenType: "refresh",
		}),
		expiresIn: ACCESS_EXPIRES_IN,
		accessJti,
		refreshJti,
		familyId,
		tokenVersion,
		refreshExpiresAt: new Date(Date.now() + REFRESH_EXPIRES_IN * 1000),
	};
}

function hashToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
	const bufA = Buffer.from(a, "hex");
	const bufB = Buffer.from(b, "hex");
	if (bufA.length !== bufB.length) {
		// Use timingSafeEqual even on mismatched lengths to avoid timing leaks
		const maxLen = Math.max(bufA.length, bufB.length);
		const paddedA = Buffer.alloc(maxLen);
		const paddedB = Buffer.alloc(maxLen);
		bufA.copy(paddedA);
		bufB.copy(paddedB);
		return crypto.timingSafeEqual(paddedA, paddedB);
	}
	return crypto.timingSafeEqual(bufA, bufB);
}

function buildRefreshDeleteAt(expiresAt: Date): Date {
	return new Date(expiresAt.getTime() + REFRESH_TOKEN_RETENTION_SECONDS * 1000);
}

// ─── Token Persistence ──────────────────────────────────────────────────────

async function persistRefreshToken(pair: PersistableTokenPair, userId: string): Promise<void> {
	await RefreshToken.create({
		jti: pair.refreshJti,
		userId: new Types.ObjectId(userId),
		familyId: pair.familyId,
		tokenHash: hashToken(pair.refreshToken),
		tokenVersion: pair.tokenVersion,
		expiresAt: pair.refreshExpiresAt,
		deleteAt: buildRefreshDeleteAt(pair.refreshExpiresAt),
		status: {
			state: "active",
			changedAt: new Date(),
			reason: "none",
			replacedByJti: "",
		},
	});
}

function expiresAtFromPayload(decoded: DecodedToken, fallbackSeconds: number): Date {
	const timestamp = decoded.exp ?? Math.floor(Date.now() / 1000) + fallbackSeconds;
	return new Date(timestamp * 1000);
}

async function blacklistToken(
	decoded: DecodedToken | null,
	fallbackSeconds: number,
): Promise<void> {
	if (!decoded?.jti) {
		return;
	}

	await TokenBlacklist.updateOne(
		{ jti: decoded.jti },
		{
			$setOnInsert: {
				jti: decoded.jti,
				expiresAt: expiresAtFromPayload(decoded, fallbackSeconds),
				reason: "logout",
			},
		},
		{ upsert: true },
	);
}

async function revokeRefreshFamily(
	userId: Types.ObjectId,
	familyId: string,
	reason: "password_change" | "reuse_detected",
): Promise<void> {
	await RefreshToken.updateMany(
		{ userId, familyId, "status.state": "active" },
		{
			$set: {
				status: {
					state: reason === "reuse_detected" ? "compromised" : "revoked",
					changedAt: new Date(),
					reason,
					replacedByJti: "",
				},
			},
		},
	);
}

async function handleRefreshTokenReuse(session: RefreshSessionRecord): Promise<void> {
	await Promise.all([
		revokeRefreshFamily(session.userId, session.familyId, "reuse_detected"),
		User.updateOne({ _id: session.userId }, { $inc: { tokenVersion: 1 } }),
	]);

	await createAuditLog({
		action: "REFRESH_TOKEN_REUSE_DETECTED",
		entity: "User",
		entityId: session.userId.toString(),
		userId: session.userId.toString(),
		metadata: { familyId: session.familyId, jti: session.jti },
	});
}

// ─── Token Parsing ──────────────────────────────────────────────────────────

function parseRefreshToken(refreshToken: string): JwtClaims {
	try {
		return jwt.verify(refreshToken, getRefreshTokenSecret()) as JwtClaims;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new UnauthorizedError("Refresh token expired");
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid refresh token");
		}
		throw new UnauthorizedError("Token refresh failed");
	}
}

// ─── Session Types ──────────────────────────────────────────────────────────

interface SessionUser {
	_id: Types.ObjectId;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	tokenVersion?: number;
}

// ─── Login / Session ────────────────────────────────────────────────────────

export async function issueLoginSession(
	user: SessionUser,
	loginMethod: "password" | "passkey" = "password",
): Promise<LoginContract> {
	const tokenVersion = user.tokenVersion ?? 0;
	const tokenPair = buildTokenPair(user._id.toString(), user.role, tokenVersion);
	await persistRefreshToken(tokenPair, user._id.toString());

	await createAuditLog({
		action: "LOGIN_SUCCESS",
		entity: "User",
		entityId: user._id.toString(),
		userId: user._id.toString(),
		userEmail: user.email,
		metadata: { role: user.role, loginMethod },
	});

	return {
		accessToken: tokenPair.accessToken,
		refreshToken: tokenPair.refreshToken,
		user: {
			_id: user._id.toString(),
			name: user.name,
			email: user.email,
			role: user.role,
			isActive: user.isActive,
		},
	};
}

export async function login(email: string, password: string): Promise<LoginContract> {
	const user = await User.findOne({ email }).select("+password +tokenVersion");

	if (!user) {
		throw new UnauthorizedError("Invalid email or password");
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const valid = await user.comparePassword(password);
	if (!valid) {
		throw new UnauthorizedError("Invalid email or password");
	}

	return issueLoginSession(user, "password");
}

export async function changePassword(userId: string, payload: ChangePasswordInput): Promise<void> {
	const user = await User.findById(userId).select("+password +tokenVersion");

	if (!user) {
		throw new NotFoundError("User", userId);
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const valid = await user.comparePassword(payload.currentPassword);
	if (!valid) {
		throw new UnauthorizedError("Current password is incorrect");
	}
	if (payload.currentPassword === payload.newPassword) {
		throw new BadRequestError("New password must be different from current password");
	}

	user.password = payload.newPassword;
	user.tokenVersion = (user.tokenVersion ?? 0) + 1;
	await user.save();
	await RefreshToken.updateMany(
		{ userId: user._id, "status.state": "active" },
		{
			$set: {
				status: {
					state: "revoked",
					changedAt: new Date(),
					reason: "password_change",
					replacedByJti: "",
				},
			},
		},
	);
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshContract> {
	const payload = parseRefreshToken(refreshToken);
	const isMissingNewClaims =
		payload.tokenType !== "refresh" ||
		!payload.jti ||
		!payload.familyId ||
		typeof payload.tokenVersion !== "number";
	if (isMissingNewClaims) {
		throw new AppError("Session expired — please log in again", 401, "SESSION_EXPIRED");
	}

	const blacklisted = await TokenBlacklist.findOne({ jti: payload.jti }).lean();
	if (blacklisted) {
		throw new UnauthorizedError("Refresh token has been revoked");
	}

	const session = await RefreshToken.findOne({ jti: payload.jti })
		.select("+tokenHash")
		.lean<RefreshSessionRecord>()
		.exec();
	if (!session || !timingSafeEqual(hashToken(refreshToken), session.tokenHash)) {
		throw new UnauthorizedError("Refresh token session not found");
	}

	if (session.status.state !== "active") {
		await handleRefreshTokenReuse(session);
		throw new UnauthorizedError("Refresh token reuse detected");
	}

	const now = new Date();
	if (session.expiresAt.getTime() <= now.getTime()) {
		await RefreshToken.updateOne(
			{ jti: session.jti, "status.state": "active" },
			{
				$set: {
					status: {
						state: "revoked",
						changedAt: now,
						reason: "expired",
						replacedByJti: "",
					},
				},
			},
		);
		throw new UnauthorizedError("Refresh token expired");
	}

	const userId = payload.sub ?? payload._id;
	if (!userId || session.userId.toString() !== userId || session.familyId !== payload.familyId) {
		await handleRefreshTokenReuse(session);
		throw new UnauthorizedError("Refresh token ownership mismatch");
	}

	const user = await User.findById(userId)
		.select("email role isActive +tokenVersion")
		.lean<{
			_id: Types.ObjectId;
			email: string;
			role: string;
			isActive: boolean;
			tokenVersion: number;
		}>()
		.exec();
	if (!user?.isActive) {
		throw new UnauthorizedError("User not found or deactivated");
	}

	const userTokenVersion = user.tokenVersion ?? 0;
	if (payload.tokenVersion !== userTokenVersion || session.tokenVersion !== userTokenVersion) {
		throw new UnauthorizedError("Refresh token version is no longer valid");
	}

	const nextPair = buildTokenPair(
		user._id.toString(),
		user.role,
		userTokenVersion,
		session.familyId,
	);
	const rotated = await RefreshToken.findOneAndUpdate(
		{
			jti: session.jti,
			tokenHash: session.tokenHash,
			"status.state": "active",
			expiresAt: { $gt: now },
		},
		{
			$set: {
				status: {
					state: "rotated",
					changedAt: now,
					reason: "rotation",
					replacedByJti: nextPair.refreshJti,
				},
			},
		},
		{ returnDocument: "after" },
	).exec();

	if (!rotated) {
		await handleRefreshTokenReuse(session);
		throw new UnauthorizedError("Refresh token reuse detected");
	}

	await persistRefreshToken(nextPair, user._id.toString());
	return {
		accessToken: nextPair.accessToken,
		refreshToken: nextPair.refreshToken,
	};
}

export async function logout(accessToken: string, refreshToken: string): Promise<void> {
	try {
		const accessDecoded = jwt.decode(accessToken) as DecodedToken | null;
		const refreshDecoded = jwt.decode(refreshToken) as DecodedToken | null;

		await Promise.all([
			blacklistToken(accessDecoded, ACCESS_EXPIRES_IN),
			blacklistToken(refreshDecoded, REFRESH_EXPIRES_IN),
			refreshDecoded?.jti
				? RefreshToken.updateOne(
						{ jti: refreshDecoded.jti, "status.state": "active" },
						{
							$set: {
								status: {
									state: "revoked",
									changedAt: new Date(),
									reason: "logout",
									replacedByJti: "",
								},
							},
						},
					)
				: Promise.resolve(),
		]);

		const userId = accessDecoded?.sub ?? accessDecoded?._id;
		if (userId) {
			await createAuditLog({
				action: "LOGOUT",
				entity: "User",
				entityId: userId,
				userId,
				metadata: {
					...(typeof accessDecoded?.exp === "number"
						? { tokenExpiry: accessDecoded.exp }
						: { tokenExpiryStatus: "not_available" }),
				},
			});
		}
	} catch (error) {
		log.error("Failed to revoke tokens on logout", { reason: String(error) });
	}
}

export function getRefreshTokenMaxAge(): number {
	return REFRESH_EXPIRES_IN;
}

export async function generateTokenPair(
	userId: string,
	_email: string,
	role: string,
): Promise<TokenPair> {
	const pair = buildTokenPair(userId, role, 0);
	return {
		accessToken: pair.accessToken,
		refreshToken: pair.refreshToken,
		expiresIn: pair.expiresIn,
	};
}

export async function cleanupExpiredRefreshTokens(now: Date = new Date()): Promise<number> {
	const cutoff = new Date(now.getTime() - REFRESH_TOKEN_RETENTION_SECONDS * 1000);
	const result = await RefreshToken.deleteMany({ expiresAt: { $lte: cutoff } });
	return result.deletedCount;
}

export function startRefreshTokenCleanupWorker(): () => void {
	const runCleanup = (): void => {
		void cleanupExpiredRefreshTokens().catch((error) => {
			log.error("Refresh token cleanup failed", { reason: String(error) });
		});
	};

	runCleanup();
	const timer = setInterval(runCleanup, REFRESH_CLEANUP_INTERVAL_MS);
	timer.unref();
	return () => clearInterval(timer);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD RESET — Implementación completa del ciclo de recuperación
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a cryptographically-secure password reset token.
 *
 * Steps:
 * 1. Find user by email (silent no-op if not found — anti-enumeration)
 * 2. Generate CSPRNG token (32 bytes → 64 hex chars)
 * 3. Hash the token with SHA-256
 * 4. Store hash + expiry in User document
 * 5. Invalidate each prior reset token (overwrite)
 *
 * @returns The raw token (NOT persisted) that must be included in the reset URL.
 *          Returns empty string if user not found (anti-enumeration).
 */
export async function generateResetToken(email: string): Promise<string> {
	const user = await User.findOne({ email, isActive: true }).select("_id");

	// Anti-enumeration: no-op if user doesn't exist
	if (!user) {
		log.info("Reset requested for non-existent or inactive user (anti-enumeration)", { email });
		return "";
	}

	// Generate CSPRNG token
	const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
	const tokenHash = hashToken(rawToken);
	const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

	// Persist hash only — never store raw token
	// This also invalidates each prior reset token by overwriting
	await User.updateOne(
		{ _id: user._id },
		{
			$set: {
				resetPasswordToken: tokenHash,
				resetPasswordExpires: expiresAt,
			},
		},
	);

	log.info("Password reset token generated", {
		userId: user._id.toString(),
		expiresAt: expiresAt.toISOString(),
	});

	await createAuditLog({
		action: "PASSWORD_RESET_REQUESTED",
		entity: "User",
		entityId: user._id.toString(),
		userId: user._id.toString(),
		metadata: { expiresAt: expiresAt.toISOString() },
	});

	return rawToken;
}

/**
 * Send password reset email using the configured provider.
 *
 * @returns delivery result from the email gateway
 */
export async function sendResetPasswordEmail(
	email: string,
	rawToken: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
	const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

	const result = await emailGateway.send({
		to: email,
		subject: "Restablece tu contraseña — Cermont S.A.S.",
		body: [
			"Has solicitado restablecer tu contraseña.",
			"",
			`Para continuar, abre este enlace: ${resetUrl}`,
			"",
			"Este enlace expira en 1 hora.",
			"",
			"Si no solicitaste este cambio, ignora este mensaje.",
			"",
			"— Cermont S.A.S.",
		].join("\n"),
		htmlBody: [
			"<!DOCTYPE html>",
			"<html><body style='font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto;'>",
			"<div style='background: #0F2C59; padding: 24px; border-radius: 8px; margin-bottom: 24px;'>",
			"<h1 style='color: #ffffff; margin: 0; font-size: 20px;'>Cermont S.A.S.</h1>",
			"</div>",
			"<p>Has solicitado restablecer tu contraseña.</p>",
			`<p style='margin: 24px 0;'><a href='${resetUrl}' style='background: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;'>Restablecer contraseña</a></p>`,
			"<p style='color: #666; font-size: 14px;'>Este enlace expira en 1 hora.</p>",
			"<p style='color: #666; font-size: 14px;'>Si no solicitaste este cambio, ignora este mensaje.</p>",
			"<hr style='border: none; border-top: 1px solid #eee; margin: 24px 0;' />",
			"<p style='color: #999; font-size: 12px;'>Cermont S.A.S. — Este es un mensaje automático.</p>",
			"</body></html>",
		].join("\n"),
	});

	if (!result.success) {
		log.error("Password reset email delivery failed", {
			email,
			error: result.error ?? "",
			provider: env.EMAIL_PROVIDER,
		});

		await createAuditLog({
			action: "PASSWORD_RESET_EMAIL_FAILED",
			entity: "User",
			entityId: email,
			userId: email,
			metadata: {
				error: result.error ?? "",
				provider: env.EMAIL_PROVIDER,
			},
		});

		return { success: false, error: result.error };
	}

	log.info("Password reset email sent", {
		email,
		messageId: result.messageId ?? "",
		provider: env.EMAIL_PROVIDER,
	});

	await createAuditLog({
		action: "PASSWORD_RESET_EMAIL_SENT",
		entity: "User",
		entityId: email,
		userId: email,
		metadata: {
			messageId: result.messageId ?? "",
			provider: env.EMAIL_PROVIDER,
		},
	});

	return { success: true, messageId: result.messageId };
}

/**
 * Validate a reset token and update the password.
 *
 * Steps:
 * 1. Find user by stored hash (search by token hash)
 * 2. Verify token hasn't expired
 * 3. Verify tokens match (timing-safe comparison)
 * 4. Update password + increment tokenVersion
 * 5. Clear reset token fields (prevent reuse)
 * 6. Revoke all active refresh tokens
 * 7. Audit log
 *
 * @throws BadRequestError if token is invalid, expired, or already used
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
	const tokenHash = hashToken(token);

	// Find user whose stored hash matches AND token hasn't expired
	// This is an atomic check — if the hash matches no user, fail
	const user = await User.findOne({
		resetPasswordToken: tokenHash,
		resetPasswordExpires: { $gt: new Date() },
	}).select("+resetPasswordToken +resetPasswordExpires +password +tokenVersion");

	if (!user) {
		// Check if token exists but is expired (for better error message)
		const expiredUser = await User.findOne({
			resetPasswordToken: tokenHash,
			resetPasswordExpires: { $lte: new Date() },
		}).select("+resetPasswordToken +resetPasswordExpires");

		if (expiredUser) {
			// Clear the expired token
			await User.updateOne(
				{ _id: expiredUser._id },
				{
					$unset: { resetPasswordToken: "", resetPasswordExpires: "" },
				},
			);

			await createAuditLog({
				action: "PASSWORD_RESET_TOKEN_EXPIRED",
				entity: "User",
				entityId: expiredUser._id.toString(),
				userId: expiredUser._id.toString(),
				metadata: {},
			});

			throw new BadRequestError(
				"El enlace de recuperación ha expirado",
				"PASSWORD_RESET_TOKEN_EXPIRED",
			);
		}

		// Token is completely invalid (never existed or already used)
		throw new BadRequestError(
			"El enlace de recuperación es inválido",
			"PASSWORD_RESET_TOKEN_INVALID",
		);
	}

	// Timing-safe comparison (redundant because MongoDB matched the exact hash,
	// but kept as defense-in-depth)
	if (!timingSafeEqual(tokenHash, user.resetPasswordToken ?? "")) {
		throw new BadRequestError(
			"El enlace de recuperación es inválido",
			"PASSWORD_RESET_TOKEN_INVALID",
		);
	}

	// Token is valid — update password and revoke sessions
	user.password = newPassword;
	user.tokenVersion = (user.tokenVersion ?? 0) + 1;
	// Clear reset token fields (prevent reuse)
	user.resetPasswordToken = void 0;
	user.resetPasswordExpires = void 0;
	await user.save();

	// Revoke all active refresh tokens for this user
	await RefreshToken.updateMany(
		{ userId: user._id, "status.state": "active" },
		{
			$set: {
				status: {
					state: "revoked",
					changedAt: new Date(),
					reason: "password_change",
					replacedByJti: "",
				},
			},
		},
	);

	log.info("Password reset successful", { userId: user._id.toString() });

	await createAuditLog({
		action: "PASSWORD_RESET_SUCCESS",
		entity: "User",
		entityId: user._id.toString(),
		userId: user._id.toString(),
		metadata: {},
	});
}

export { timingSafeEqual };
