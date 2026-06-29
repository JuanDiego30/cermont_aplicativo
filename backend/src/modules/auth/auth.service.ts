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
import { createAuditLog } from "../audit/audit.service";

const log = createLogger("auth-service");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const ACCESS_EXPIRES_IN = 15 * 60;
const REFRESH_EXPIRES_IN = 7 * 24 * 60 * 60;
const REFRESH_TOKEN_RETENTION_SECONDS = 7 * 24 * 60 * 60;
const REFRESH_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

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

function hashRefreshToken(token: string): string {
	return crypto.createHash("sha256").update(token).digest("hex");
}

function tokenHashesMatch(rawToken: string, expectedHash: string): boolean {
	const actual = Buffer.from(hashRefreshToken(rawToken), "hex");
	const expected = Buffer.from(expectedHash, "hex");
	return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function buildRefreshDeleteAt(expiresAt: Date): Date {
	return new Date(expiresAt.getTime() + REFRESH_TOKEN_RETENTION_SECONDS * 1000);
}

async function persistRefreshToken(pair: PersistableTokenPair, userId: string): Promise<void> {
	await RefreshToken.create({
		jti: pair.refreshJti,
		userId: new Types.ObjectId(userId),
		familyId: pair.familyId,
		tokenHash: hashRefreshToken(pair.refreshToken),
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

interface SessionUser {
	_id: Types.ObjectId;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	tokenVersion?: number;
}

/**
 * Issue a token pair + audit log for an already-verified user. Shared tail
 * for password login and passkey (WebAuthn) login — both authenticate the
 * user through different means but issue identical sessions.
 */
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
	// Tokens issued before the auth-service refactor lack tokenType / familyId /
	// tokenVersion. Treat them as session-expired so the client shows a clean
	// "please re-login" message rather than a generic auth error.
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
	if (!session || !tokenHashesMatch(refreshToken, session.tokenHash)) {
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

export function generateResetToken(_email: string): string {
	return "";
}

export async function resetPassword(_token: string, _newPassword: string): Promise<void> {
	throw new BadRequestError(
		"Password reset requires database token validation. Implement user.resetPasswordToken field.",
	);
}
