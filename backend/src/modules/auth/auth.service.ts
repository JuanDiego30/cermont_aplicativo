import type { ChangePasswordInput } from "@cermont/shared-types";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
	AppError,
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { TokenBlacklist, User } from "../../models";

const log = createLogger("auth-service");

// ─── Constantes ──────────────────────────────────────────────────────────────

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";
const ACCESS_EXPIRES_IN = 900; // 15 min en segundos
const REFRESH_EXPIRES_IN = 7 * 24 * 3600; // 7 días en segundos

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface LoginResponse {
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

export interface RefreshResponse {
	accessToken: string;
}

// SECURITY FIX: RT-004 - Use JWT standard 'sub' claim instead of custom '_id' and 'email'
interface JwtPayload {
	sub?: string; // JWT standard - user identifier
	_id?: string; // Backward compatibility
	email?: string; // Deprecated - email removed from token
	role: string;
	jti: string;
}

interface DecodedToken {
	jti?: string;
	exp?: number;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

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

function signAccessToken(payload: Record<string, unknown>): string {
	return jwt.sign(payload, getJwtSecret(), { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(payload: Record<string, unknown>): string {
	return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: REFRESH_TOKEN_TTL });
}

function buildTokenPair(userId: string, _email: string, role: string): TokenPair {
	const jti = uuidv4();
	// SECURITY FIX: RT-004 - Remove email from JWT payload
	// Email is sensitive PII and should not be exposed in tokens
	// Use 'sub' (subject) claim for user identifier per JWT spec
	const base = { sub: userId, role, jti };
	return {
		accessToken: signAccessToken(base),
		refreshToken: signRefreshToken(base),
		expiresIn: ACCESS_EXPIRES_IN,
	};
}

function expiresAtFromPayload(decoded: DecodedToken, fallbackSeconds: number): Date {
	const ts = decoded.exp ?? Math.floor(Date.now() / 1000) + fallbackSeconds;
	return new Date(ts * 1000);
}

async function blacklistToken(
	decoded: DecodedToken | null,
	fallbackSeconds: number,
): Promise<void> {
	if (!decoded?.jti) {
		return;
	}
	await TokenBlacklist.create({
		jti: decoded.jti,
		expiresAt: expiresAtFromPayload(decoded, fallbackSeconds),
		reason: "logout",
	});
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Autentica un usuario con email + contraseña.
 * @throws UnauthorizedError si el usuario no existe, la cuenta está inactiva o la contraseña es incorrecta
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
	const user = await User.findOne({ email }).select("+password");

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

	const tokenPair = buildTokenPair(user._id.toString(), user.email, user.role);

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

/**
 * Cambia la contraseña del usuario autenticado.
 * @throws NotFoundError si el usuario no existe
 * @throws UnauthorizedError si la cuenta está desactivada o la contraseña actual es incorrecta
 * @throws BadRequestError si la nueva contraseña es igual a la actual
 */
export async function changePassword(userId: string, payload: ChangePasswordInput): Promise<void> {
	const user = await User.findById(userId).select("+password");

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
	await user.save();
}

/**
 * Renueva el access token a partir de un refresh token válido.
 * @throws UnauthorizedError si el token es inválido, expirado o fue revocado
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
	let payload: JwtPayload;

	try {
		payload = jwt.verify(refreshToken, getRefreshTokenSecret()) as JwtPayload;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			throw new UnauthorizedError("Refresh token expired");
		}
		if (err instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid refresh token");
		}
		throw new UnauthorizedError("Token refresh failed");
	}

	const blacklisted = await TokenBlacklist.findOne({ jti: payload.jti }).lean();
	if (blacklisted) {
		throw new UnauthorizedError("Refresh token has been revoked");
	}

	const userId = payload.sub ?? payload._id;
	if (!userId) {
		throw new UnauthorizedError("Invalid refresh token payload");
	}

	const user = await User.findById(userId).lean();
	if (!user?.isActive) {
		throw new UnauthorizedError("User not found or deactivated");
	}

	const { accessToken } = buildTokenPair(user._id.toString(), user.email, user.role);
	return { accessToken };
}

/**
 * Revoca ambos tokens añadiéndolos a la blacklist.
 * Los errores se loggean sin propagarse (logout siempre procede).
 */
export async function logout(accessToken: string, refreshToken: string): Promise<void> {
	try {
		const accessDecoded = jwt.decode(accessToken) as DecodedToken | null;
		const refreshDecoded = jwt.decode(refreshToken) as DecodedToken | null;

		await Promise.all([
			blacklistToken(accessDecoded, ACCESS_EXPIRES_IN),
			blacklistToken(refreshDecoded, REFRESH_EXPIRES_IN),
		]);
	} catch (err) {
		log.error("Failed to blacklist tokens on logout", { err: String(err) });
	}
}

/** Devuelve el Max-Age en segundos para la cookie del refresh token */
export function getRefreshTokenMaxAge(): number {
	return REFRESH_EXPIRES_IN;
}

/** Genera un par de tokens (usado en tests y flujos externos) */
export async function generateTokenPair(
	userId: string,
	_email: string,
	role: string,
): Promise<TokenPair> {
	return buildTokenPair(userId, _email, role);
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/**
 * Genera un token de reset de contraseña.
 * En producción, guardaría el token hasheado en la base de datos y enviaría email.
 * Para desarrollo: devolver el token directamente.
 */
export function generateResetToken(_email: string): string {
	// En producción: buscar usuario y generar token
	// Por ahora, devolver string vacío para indicar que necesita implementación
	return "";
}

/**
 * Restablece la contraseña usando el token de reset.
 * @throws BadRequestError si el token es inválido o expirado
 * @throws NotFoundError si el usuario no existe
 */
export async function resetPassword(_token: string, _newPassword: string): Promise<void> {
	// En producción: buscar usuario por token hasheado y verificar expiración
	// Por ahora, devolver error para indicar que necesita implementación
	throw new BadRequestError("Password reset requires database token validation. Implement user.resetPasswordToken field.");
}
