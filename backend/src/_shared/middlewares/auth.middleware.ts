/**
 * Authentication Middleware — JWT verification + blacklist check
 *
 * DOC-04 compliance:
 * - Verifies the JWT signature and expiration
 * - Checks TokenBlacklist for revoked tokens
 * - Verifies the active user still exists
 * - Attaches the authenticated payload to req.user
 */

import { normalizeUserRole } from "@cermont/shared-types/rbac";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TokenBlacklist, User } from "../../auth/infrastructure/model";
import { AppError, UnauthorizedError } from "../common/errors";
import type { AuthPayload } from "../common/utils/request";
import { parseAuthTokenPayload, toAuthPayload } from "../common/utils/request";
import { env } from "../config/env";

export type { AuthPayload } from "../common/utils/request";

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
	}
}

function verifyAccessTokenPayload(token: string) {
	try {
		return parseAuthTokenPayload(jwt.verify(token, env.JWT_SECRET));
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new AppError("Access token expired", 401, "TOKEN_EXPIRED");
		}

		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid access token");
		}

		if (error instanceof UnauthorizedError) {
			throw error;
		}

		throw new UnauthorizedError("Authentication failed");
	}
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
	// Check Authorization header first (Bearer token)
	let authHeader = req.headers.authorization;

	// Fallback: check cookies for access token
	if (!authHeader?.startsWith("Bearer ")) {
		const cookieHeader = req.headers.cookie;
		if (cookieHeader) {
			const match = cookieHeader.match(/accessToken=([^;]+)/);
			if (match) {
				authHeader = `Bearer ${match[1]}`;
			}
		}
	}

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("Missing or invalid Authorization header");
	}

	const token = authHeader.slice(7); // Remove "Bearer " prefix
	const tokenPayload = verifyAccessTokenPayload(token);

	const normalizedRole = normalizeUserRole(tokenPayload.role);
	if (!normalizedRole) {
		throw new UnauthorizedError("Invalid access token role");
	}

	const payload = toAuthPayload(tokenPayload, normalizedRole);

	if (payload.jti) {
		const blacklisted = await TokenBlacklist.findOne({ jti: payload.jti }).lean();
		if (blacklisted) {
			throw new UnauthorizedError("Token has been revoked");
		}
	}

	const user = await User.findById(payload._id).select("isActive").lean<{ isActive: boolean }>();
	if (!user?.isActive) {
		throw new UnauthorizedError("Account has been deactivated");
	}

	req.user = payload;
	next();
}
