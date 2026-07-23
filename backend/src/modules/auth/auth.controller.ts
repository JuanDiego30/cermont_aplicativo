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

import {
	ChangePasswordSchema,
	ForgotPasswordSchema,
	ResetPasswordSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../../common/errors/AppError";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { createLogger } from "../../common/utils/logger";
import * as UserService from "../user/user.service";
import * as AuthService from "./auth.service";
import { getRefreshTokenMaxAge } from "./auth.service";
import { sendResetPasswordEmail } from "../../services/auth-email.service";

const log = createLogger("auth-controller");

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

	// CRITICAL: clear stale cookies before throwing so the browser does not
	// loop on an invalid refreshToken indefinitely.  This covers three cases:
	//   1. Token was issued before the auth-service refactor (missing claims)
	//   2. Token was revoked (logout, password change, reuse detection)
	//   3. Token has expired
	// The try/catch is intentional — Express 5 auto-propagates unhandled async
	// rejections, but we need to clear the cookies BEFORE rethrowing so the
	// browser discards the stale cookie even when the error response is sent.
	let accessToken: string;
	let rotatedRefreshToken: string;
	try {
		({ accessToken, refreshToken: rotatedRefreshToken } =
			await AuthService.refreshAccessToken(refreshToken));
	} catch (error) {
		res.clearCookie("refreshToken", getRefreshTokenCookieOptions(req));
		res.clearCookie("userRole", getReadableRoleCookieOptions(req));
		throw error;
	}

	res.cookie("refreshToken", rotatedRefreshToken, {
		...getRefreshTokenCookieOptions(req),
		maxAge: getRefreshTokenMaxAge() * 1000,
	});

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

/**
 * POST /api/auth/forgot-password
 *
 * Solicita restablecimiento de contraseña.
 * Request body:
 *   { email: string }
 *
 * Response 200:
 *   { success: true, message: "If the email exists, a reset link has been sent" }
 *
 * Security: Siempre devuelve 200, no revela si el email existe o no.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
	const { email } = ForgotPasswordSchema.parse(req.body);

	// Generate reset token — always returns success (no email enumeration)
	// If email exists, a raw token is returned; send it via email
	const resetToken = await AuthService.generateResetToken(email);

	if (resetToken) {
		// Send email asynchronously — do not block the response
		sendResetPasswordEmail(email, resetToken).catch((err) => {
			log.error("Failed to send password reset email", {
				email,
				error: err instanceof Error ? err.message : String(err),
			});
		});
	}

	sendSuccess(res, { message: "If the email exists, a reset link has been sent" });
}

/**
 * POST /api/auth/reset-password
 *
 * Restablece la contraseña usando el token de reset.
 * Request body:
 *   { token: string, password: string }
 *
 * Response 200:
 *   { success: true, message: "Password reset successfully" }
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
	const { token, password } = ResetPasswordSchema.parse(req.body);

	await AuthService.resetPassword(token, password);

	sendSuccess(res, { message: "Password reset successfully" });
}
