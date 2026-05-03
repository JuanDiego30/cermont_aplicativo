import crypto from "node:crypto";
import type { ChangePasswordInput } from "@cermont/shared-types";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../_shared/common/errors";
import { ServiceUnavailableError } from "../../_shared/common/errors/AppError";
import { createLogger } from "../../_shared/common/utils";
import { container } from "../../_shared/config/container";
import { env } from "../../_shared/config/env";

const log = createLogger("auth-service");

// Database connection error detection
const isMongoError = (error: unknown): boolean => {
  const err = error as { name?: string; code?: string; message?: string };
  const message = err?.message ?? "";
  return (
    err?.name === "MongooseError" ||
    err?.name === "MongoError" ||
    err?.name === "MongoServerError" ||
    err?.code === "ECONNREFUSED" ||
    message.includes("ECONNREFUSED") ||
    message.includes("MongoNetworkError")
  );
};

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

function signAccessToken(payload: Record<string, unknown>): string {
	// biome-ignore lint/style/noNonNullAssertion: validated at startup
	return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(payload: Record<string, unknown>): string {
	// biome-ignore lint/style/noNonNullAssertion: validated at startup
	return jwt.sign(payload, env.REFRESH_TOKEN_SECRET!, { expiresIn: REFRESH_TOKEN_TTL });
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
	await container.tokenRepository.create({
		jti: decoded.jti,
		expiresAt: expiresAtFromPayload(decoded, fallbackSeconds),
		reason: "logout",
	});
}

// ─── API pública ─────────────────────────────────────────────────────────────

/**
 * Autentica un usuario con email + contraseña.
 * @throws NotFoundError si el usuario no existe
 * @throws UnauthorizedError si la cuenta está inactiva o la contraseña es incorrecta
 * @throws ServiceUnavailableError si la base de datos no está disponible
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  let user: Awaited<ReturnType<typeof container.userRepository.findByEmailWithPassword>> | undefined;
  try {
    user = await container.userRepository.findByEmailWithPassword(email);
  } catch (err) {
    if (isMongoError(err)) {
      log.error("Database connection failed during login", { error: String(err) });
      throw new ServiceUnavailableError("Authentication temporarily unavailable. Please try again later.");
    }
    throw err;
  }

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }
  if (!user.isActive) {
    throw new UnauthorizedError("User account is deactivated");
  }

  let valid: boolean;
  try {
    valid = await container.userRepository.verifyPassword(user, password);
  } catch (err) {
    if (isMongoError(err)) {
      log.error("Database connection failed during password verification", { error: String(err) });
      throw new ServiceUnavailableError("Authentication temporarily unavailable. Please try again later.");
    }
    throw err;
  }

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
	const user = await container.userRepository.findByIdWithPassword(userId);

	if (!user) {
		throw new NotFoundError("User", userId);
	}
	if (!user.isActive) {
		throw new UnauthorizedError("User account is deactivated");
	}

	const valid = await container.userRepository.verifyPassword(user, payload.currentPassword);
	if (!valid) {
		throw new UnauthorizedError("Current password is incorrect");
	}

	if (payload.currentPassword === payload.newPassword) {
		throw new BadRequestError("New password must be different from current password");
	}

	user.password = payload.newPassword;
	await container.userRepository.save(user);
}

/**
 * Renueva el access token a partir de un refresh token válido.
 * @throws UnauthorizedError si el token es inválido, expirado o fue revocado
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
	let payload: JwtPayload;

	try {
		// biome-ignore lint/style/noNonNullAssertion: validated at startup
		payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET!) as JwtPayload;
	} catch (err) {
		if (err instanceof jwt.TokenExpiredError) {
			throw new UnauthorizedError("Refresh token expired");
		}
		if (err instanceof jwt.JsonWebTokenError) {
			throw new UnauthorizedError("Invalid refresh token");
		}
		throw new UnauthorizedError("Token refresh failed");
	}

	const blacklisted = await container.tokenRepository.findByJti(payload.jti);
	if (blacklisted) {
		throw new UnauthorizedError("Refresh token has been revoked");
	}

	const userId = payload.sub ?? payload._id;
	if (!userId) {
		throw new UnauthorizedError("Invalid refresh token payload");
	}

	const user = await container.userRepository.findByIdLean(userId);
	if (!user?.isActive) {
		throw new UnauthorizedError("User not found or deactivated");
	}

	const { accessToken } = buildTokenPair(user._id.toString(), user.email, user.role);
	return { accessToken };
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export interface ForgotPasswordResponse {
	resetToken: string;
	message: string;
}

/**
 * Generates a password reset token for the given email.
 * @throws NotFoundError if the user does not exist
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
	const user = await container.userRepository.findByEmailWithPassword(email);

	if (!user) {
		throw new NotFoundError("User", email);
	}

	const resetToken = crypto.randomBytes(32).toString("hex");
	const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

	user.resetToken = resetToken;
	user.resetTokenExpires = resetTokenExpires;
	await container.userRepository.save(user);

	return { resetToken, message: "Reset token generated" };
}

/**
 * Resets the password using a valid reset token.
 * @throws BadRequestError if the token is invalid or expired
 * @throws NotFoundError if the user does not exist
 */
export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<{ message: string }> {
	const user = await container.userRepository.findByResetToken(token);

	if (!user) {
		throw new BadRequestError("Invalid or expired reset token");
	}

	user.password = newPassword;
	user.resetToken = "";
	user.resetTokenExpires = new Date(0);
	await container.userRepository.save(user);

	return { message: "Password reset successfully" };
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
		log.error("Failed to blacklist tokens on logout", { err });
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
