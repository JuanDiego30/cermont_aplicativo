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

export async function getMe(req: Request, res: Response): Promise<void> {
	const userContext = requireUser(req);
	const user = await UserService.getUserById(userContext._id);

	res.status(200).json({
		success: true,
		data: user,
	});
}

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

export async function forgotPassword(req: Request, res: Response): Promise<void> {
	const { email } = ForgotPasswordSchema.parse(req.body);

	const rawToken = await AuthService.generateResetToken(email);

	if (rawToken) {
		const deliveryResult = await AuthService.sendResetPasswordEmail(email, rawToken);
		if (!deliveryResult.success) {
			// log already done in service, respond generically
		}
	}

	sendSuccess(res, {
		message:
			"Si la cuenta existe y esta habilitada, recibiras instrucciones para restablecer la contrasena.",
	});
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
	const { token, password } = ResetPasswordSchema.parse(req.body);

	await AuthService.resetPassword(token, password);

	sendSuccess(res, { message: "Contrasena restablecida exitosamente" });
}
