/**
 * Authentication Controller
 *
 * DOC-04 + DOC-11 compliance:
 * - NO try/catch blocks — Express 5 propagates promises natively
 * - Receives request → calls service → returns response
 * - All validation happens BEFORE controller (via middleware)
 * - Sets HttpOnly cookies for refresh token
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
import * as UserService from "../user/user.service";
import * as AuthService from "./auth.service";
import { getRefreshTokenMaxAge } from "./auth.service";

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
 */
export async function login(req: Request, res: Response): Promise<void> {
	const { email, password } = req.body;
	const { accessToken, refreshToken, user } = await AuthService.login(email, password);

	res.cookie("refreshToken", refreshToken, {
		...getRefreshTokenCookieOptions(req),
		maxAge: getRefreshTokenMaxAge() * 1000,
	});
	res.cookie("userRole", user.role, {
		...getReadableRoleCookieOptions(req),
		maxAge: getRefreshTokenMaxAge() * 1000,
	});

	res.status(200).json({
		success: true,
		data: { accessToken, user },
	});
}

/**
 * POST /api/auth/refresh
 */
export async function refresh(req: Request, res: Response): Promise<void> {
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		throw new UnauthorizedError("Refresh token not found in cookies");
	}

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
 */
export async function logout(req: Request, res: Response): Promise<void> {
	const authHeader = req.headers.authorization;
	const refreshToken = req.cookies?.refreshToken;

	if (!authHeader?.startsWith("Bearer ")) {
		throw new UnauthorizedError("No access token provided");
	}

	const accessToken = authHeader.slice(7);

	if (accessToken && refreshToken) {
		await AuthService.logout(accessToken, refreshToken);
	}

	res.clearCookie("refreshToken", getRefreshTokenCookieOptions(req));
	res.clearCookie("userRole", getReadableRoleCookieOptions(req));

	res.status(200).json({
		success: true,
		message: "Logout successful",
	});
}

/**
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const user = await UserService.getUserById(userContext._id);

	res.status(200).json({
		success: true,
		data: user,
	});
}

/**
 * PATCH /api/auth/change-password
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
 *
 * Security: Siempre devuelve 200, no revela si el email existe o no.
 * Internally: genera token CSPRNG, persiste hash, envía email vía gateway,
 * registra resultado de entrega.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
	const { email } = ForgotPasswordSchema.parse(req.body);

	// Generar token — anti-enumeration: devuelve "" si usuario no existe
	const rawToken = await AuthService.generateResetToken(email);

	if (rawToken) {
		// Enviar email — registrar resultado pero no exponerlo al cliente
		const deliveryResult = await AuthService.sendResetPasswordEmail(email, rawToken);
		if (!deliveryResult.success) {
			// Log ya hecho en service. Respondemos igual para no filtrar info.
			// El fallo queda registrado en auditoría.
		}
	}

	// Siempre responder igual — anti-enumeration
	sendSuccess(res, {
		message:
			"Si la cuenta existe y está habilitada, recibirás instrucciones para restablecer la contraseña.",
	});
}

/**
 * POST /api/auth/reset-password
 *
 * Restablece la contraseña usando el token de reset.
 * Valida token (timing-safe), verifica expiración, actualiza password,
 * revoca sesiones, invalida token.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
	const { token, password } = ResetPasswordSchema.parse(req.body);

	await AuthService.resetPassword(token, password);

	sendSuccess(res, { message: "Contraseña restablecida exitosamente" });
}
