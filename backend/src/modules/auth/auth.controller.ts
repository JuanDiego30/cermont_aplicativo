/**
 * Authentication Controller
 *
 * DOC-04 + DOC-11 compliance:
 * - NO try/catch blocks — Express 5 propagates promises natively
 * - Receives request → calls service → returns response
 * - All validation happens BEFORE controller (via middleware)
 * - Sets HttpOnly cookies for refresh token
 *
 * Flow:
 *   1. Middleware validates request body (Zod)
 *   2. Controller calls service
 *   3. Service throws AppError on failure
 *   4. Global error handler catches it (no try/catch needed)
 *   5. Response sent with correct status code
 */

import { ChangePasswordSchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as AuthService from "./auth.service";
import { getRefreshTokenMaxAge } from "./auth.service";
import * as UserService from "../user/user.service";

const COOKIE_SAME_SITE = "lax" as const;

function forwardedProto(req: Request): string {
	const value = req.headers["x-forwarded-proto"];
	return Array.isArray(value) ? value.join(",") : typeof value === "string" ? value : "";
}

function isHttpsRequest(req: Request): boolean {
	return (
		req.secure ||
		req.protocol === "https" ||
		forwardedProto(req)
			.split(",")
			.some((proto) => proto.trim() === "https")
	);
}

function getRefreshTokenCookieOptions(req: Request) {
	return {
		httpOnly: true,
		secure: isHttpsRequest(req),
		sameSite: COOKIE_SAME_SITE,
		path: "/",
	};
}

function getReadableRoleCookieOptions(req: Request) {
	return {
		httpOnly: false,
		secure: isHttpsRequest(req),
		sameSite: COOKIE_SAME_SITE,
		path: "/",
	};
}

/**
 * POST /api/auth/login
 *
 * Request body (validated by middleware):
 *   { email: string, password: string }
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: {
 *       accessToken: "eyJhbGci...",
 *       user: { _id, name, email, role, isActive }
 *     }
 *   }
 *
 * Response 401:
 *   {
 *     success: false,
 *     error: { code: "UNAUTHORIZED", message: "Invalid email or password" }
 *   }
 */
export async function login(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;

	// Service throws if credentials invalid
	const { accessToken, refreshToken, user } = await AuthService.login(email, password);

	// Set HttpOnly secure refresh token cookie (cannot be accessed by JavaScript)
	res.cookie("refreshToken", refreshToken, {
		...getRefreshTokenCookieOptions(req),
		maxAge: getRefreshTokenMaxAge() * 1000, // in ms
	});
	res.cookie("userRole", user.role, {
		...getReadableRoleCookieOptions(req),
		maxAge: getRefreshTokenMaxAge() * 1000,
	});

	res.status(200).json({
		success: true,
		data: {
			accessToken,
			user,
		},
	});
}

/**
 * POST /api/auth/refresh
 *
 * No request body. Reads refreshToken from HttpOnly cookie automatically.
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: { accessToken: "eyJhbGci..." }
 *   }
 *
 * Response 401:
 *   {
 *     success: false,
 *     error: { code: "UNAUTHORIZED", message: "Refresh token expired" }
 *   }
 */
export async function refresh(req: Request, res: Response): Promise<void> {
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		throw new UnauthorizedError("Refresh token not found in cookies");
	}

	// Service throws if token invalid/expired
	const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

	res.status(200).json({
		success: true,
		data: { accessToken },
	});
}

/**
 * POST /api/auth/logout
 *
 * Requires authentication (Bearer token in Authorization header).
 * Revokes both access and refresh tokens.
 *
 * Response 200:
 *   { success: true, message: "Logout successful" }
 */
export async function logout(req: Request, res: Response): Promise<void> {
	const authHeader = req.headers.authorization;
	const refreshToken = req.cookies?.refreshToken;

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("No access token provided");
	}

	const accessToken = authHeader.slice(7);

	// Revoke tokens (no error thrown if this fails — logout succeeds anyway)
	if (accessToken && refreshToken) {
		await AuthService.logout(accessToken, refreshToken);
	}

	// Clear cookie
	res.clearCookie("refreshToken", getRefreshTokenCookieOptions(req));
	res.clearCookie("userRole", getReadableRoleCookieOptions(req));

	res.status(200).json({
		success: true,
		message: "Logout successful",
	});
}

/**
 * GET /api/auth/me
 *
 * Returns authenticated user's own profile.
 * Requires authentication.
 *
 * FIX (ISSUE-034): Use UserService.getUserById() instead of direct User.findById()
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: { _id, name, email, role, isActive, phone, avatarUrl }
 *   }
 */
export async function getMe(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);

	// Use UserService instead of direct User model access per ISSUE-034
	const user = await UserService.getUserById(userContext._id);

	res.status(200).json({
		success: true,
		data: user,
	});
}

/**
 * PATCH /api/auth/change-password
 *
 * Cambia la contraseña del usuario autenticado.
 * Request body:
 *   { currentPassword: string, newPassword: string }
 *
 * Response 200:
 *   { success: true, data: { message: "Password updated successfully" } }
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const payload = ChangePasswordSchema.parse(req.body);

	await AuthService.changePassword(userContext._id, payload);

	const authHeader = req.headers.authorization;
	const refreshToken = req.cookies?.refreshToken;

	if (authHeader?.startsWith("Bearer ") && refreshToken) {
		const accessToken = authHeader.slice(7);
		await AuthService.logout(accessToken, refreshToken);
	}

	res.clearCookie("refreshToken", getRefreshTokenCookieOptions(req));
	res.clearCookie("userRole", getReadableRoleCookieOptions(req));
	sendSuccess(res, { message: "Password updated successfully" });
}
