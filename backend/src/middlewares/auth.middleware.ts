/**
 * Authentication Middleware — JWT verification + blacklist check
 *
 * DOC-04 compliance:
 * - Verifies the JWT signature and expiration
 * - Checks TokenBlacklist for revoked tokens
 * - Verifies the active user still exists
 * - Attaches the authenticated payload to req.user
 */

import { normalizeUserRole } from "@cermont/domain";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError, UnauthorizedError } from "../common/errors";
import type { AuthClaims } from "../common/utils/request";
import { env } from "../config/env";
import { TokenBlacklist, User } from "../models";

export type { AuthClaims } from "../common/utils/request";

declare global {
	namespace Express {
		interface Request {
			user?: AuthClaims;
		}
	}
}

interface AccessTokenPayload {
	sub?: string;
	_id?: string;
	role?: string;
	jti?: string;
	tokenVersion?: number;
	tokenType?: "access" | "refresh";
}

interface AccessTokenCacheEntry {
	payload: AccessTokenPayload;
	expiresAt: number;
}

const accessTokenCache = new Map<string, AccessTokenCacheEntry>();
const ACCESS_TOKEN_CACHE_TTL = 30_000;
const ACCESS_TOKEN_CACHE_LIMIT = 500;

function cleanupAccessTokenCache(now: number): void {
	for (const [token, entry] of accessTokenCache) {
		if (entry.expiresAt <= now) {
			accessTokenCache.delete(token);
		}
	}
}

function verifyAccessToken(token: string, jwtSecret: string): AccessTokenPayload {
	try {
		return jwt.verify(token, jwtSecret) as AccessTokenPayload;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new AppError("Access token expired", 401, "TOKEN_EXPIRED");
		}
		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid access token");
		}
		throw new UnauthorizedError("Authentication failed");
	}
}

function verifyAccessTokenCached(token: string, jwtSecret: string): AccessTokenPayload {
	const now = Date.now();
	const cached = accessTokenCache.get(token);
	if (cached && cached.expiresAt > now) {
		return cached.payload;
	}

	cleanupAccessTokenCache(now);
	const payload = verifyAccessToken(token, jwtSecret);
	if (accessTokenCache.size >= ACCESS_TOKEN_CACHE_LIMIT) {
		const oldestToken = accessTokenCache.keys().next().value;
		if (oldestToken) {
			accessTokenCache.delete(oldestToken);
		}
	}
	accessTokenCache.set(token, { payload, expiresAt: now + ACCESS_TOKEN_CACHE_TTL });
	return payload;
}

function normalizeAccessClaims(verifiedPayload: AccessTokenPayload): AuthClaims {
	const userId = verifiedPayload.sub ?? verifiedPayload._id;
	if (!userId) {
		throw new UnauthorizedError("Invalid access token: missing subject");
	}

	const normalizedRole = normalizeUserRole(verifiedPayload.role);
	if (!normalizedRole) {
		throw new UnauthorizedError("Invalid access token role");
	}
	if (verifiedPayload.tokenType && verifiedPayload.tokenType !== "access") {
		throw new UnauthorizedError("Refresh tokens cannot access protected resources");
	}

	return {
		_id: userId,
		sub: verifiedPayload.sub,
		role: normalizedRole,
		jti: verifiedPayload.jti,
		tokenVersion: verifiedPayload.tokenVersion ?? 0,
	};
}

/**
 * Middleware: Authenticate (verify JWT + check blacklist)
 * Throws UnauthorizedError on failure — Express 5 propagates to error handler
 *
 * INTEGRATION: This is now async and includes blacklist check per DOC-04 §13
 */
export async function authenticate(
	req: Request,
	_res: Response,
	next: NextFunction,
): Promise<void> {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("Missing or invalid Authorization header");
	}

	const token = authHeader.slice(7); // Remove "Bearer " prefix

	const jwtSecret = env.JWT_SECRET;
	if (!jwtSecret) {
		throw new AppError("JWT_SECRET is not configured", 500, "CONFIG_ERROR");
	}

	const payload = normalizeAccessClaims(verifyAccessTokenCached(token, jwtSecret));

	if (payload.jti) {
		const blacklisted = await TokenBlacklist.findOne({ jti: payload.jti }).lean();
		if (blacklisted) {
			throw new UnauthorizedError("Token has been revoked");
		}
	}

	// Use userId instead of payload._id for database lookup
	const user = await User.findById(payload._id)
		.select("isActive +tokenVersion")
		.lean<{ isActive: boolean; tokenVersion: number }>();
	if (!user?.isActive) {
		throw new UnauthorizedError("Account has been deactivated");
	}
	if ((user.tokenVersion ?? 0) !== payload.tokenVersion) {
		throw new UnauthorizedError("Session has been invalidated");
	}

	req.user = payload;
	next();
}
