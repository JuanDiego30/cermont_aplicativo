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
import { UnauthorizedError } from "../../_shared/common/errors";
import { sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import { env } from "../../_shared/config/env";
import * as AuthService from "../application/service";
import { getRefreshTokenMaxAge } from "../application/service";
import * as UserService from "../application/user.service";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: env.NODE_ENV === "production",
	sameSite: "strict" as const,
	path: "/",
	// maxAge will be set explicitly when issuing, in ms
};

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
	res.cookie("refreshToken", refreshToken, {
		...REFRESH_TOKEN_COOKIE_OPTIONS,
		maxAge: getRefreshTokenMaxAge() * 1000,
	});
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
	setRefreshTokenCookie(res, refreshToken);

	// Include expiresIn for frontend compatibility
	sendSuccess(res, { accessToken, user, expiresIn: 900 }); // 15 min
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

	sendSuccess(res, { accessToken });
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
	res.clearCookie("refreshToken", {
		...REFRESH_TOKEN_COOKIE_OPTIONS,
		maxAge: 0,
	});

	sendSuccess(res, { message: "Logout successful" });
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

	sendSuccess(res, user);
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

	res.clearCookie("refreshToken", {
		...REFRESH_TOKEN_COOKIE_OPTIONS,
		maxAge: 0,
	});
	sendSuccess(res, { message: "Password updated successfully" });
}

/**
 * POST /api/auth/forgot-password
 *
 * Generates a password reset token for the given email.
 *
 * Request body:
 *   { email: string }
 *
 * Response 200:
 *   { success: true, data: { resetToken: string, message: string } }
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
	const { email } = req.body;
	const result = await AuthService.forgotPassword(email);
	sendSuccess(res, result);
}

/**
 * POST /api/auth/reset-password
 *
 * Resets the password using a valid reset token.
 *
 * Request body:
 *   { token: string, password: string }
 *
 * Response 200:
 *   { success: true, data: { message: string } }
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
	const { token, password } = req.body;
	const result = await AuthService.resetPassword(token, password);
	sendSuccess(res, result);
}
