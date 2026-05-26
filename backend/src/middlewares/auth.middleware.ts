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
import type { AuthPayload } from "../common/utils/request";
import { env } from "../config/env";
import { TokenBlacklist, User } from "../models";

export type { AuthPayload } from "../common/utils/request";

declare global {
	namespace Express {
		interface Request {
			user?: AuthPayload;
		}
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
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("Missing or invalid Authorization header");
	}

	const token = authHeader.slice(7); // Remove "Bearer " prefix

	let payload: AuthPayload;

	const jwtSecret = env.JWT_SECRET;
	if (!jwtSecret) {
		throw new AppError("JWT_SECRET is not configured", 500, "CONFIG_ERROR");
	}

	try {
		payload = jwt.verify(token, jwtSecret) as AuthPayload;
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			throw new AppError("Access token expired", 401, "TOKEN_EXPIRED");
		}

		if (error instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid access token");
		}

		throw new UnauthorizedError("Authentication failed");
	}

	// SECURITY FIX: RT-004 - Handle 'sub' claim (JWT standard) instead of '_id'
	// For backward compatibility, check both 'sub' and '_id'
	const userId = (payload as unknown as { sub?: string }).sub || payload._id;
	if (!userId) {
		throw new UnauthorizedError("Invalid access token: missing subject");
	}

	const normalizedRole = normalizeUserRole(payload.role);
	if (!normalizedRole) {
		throw new UnauthorizedError("Invalid access token role");
	}

	// Update payload with normalized values and correct user ID
	payload = {
		...payload,
		_id: userId, // Ensure _id is set from 'sub' claim
		role: normalizedRole,
	};

	if (payload.jti) {
		const blacklisted = await TokenBlacklist.findOne({ jti: payload.jti }).lean();
		if (blacklisted) {
			throw new UnauthorizedError("Token has been revoked");
		}
	}

	// Use userId instead of payload._id for database lookup
	const user = await User.findById(userId).select("isActive").lean<{ isActive: boolean }>();
	if (!user?.isActive) {
		throw new UnauthorizedError("Account has been deactivated");
	}

	req.user = payload;
	next();
}
