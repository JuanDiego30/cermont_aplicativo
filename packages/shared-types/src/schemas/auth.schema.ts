/**
 * Auth Additional Schema — Zod validation for registration and password changes
 *
 * Reference: DOC-04 Section Authentication Flow
 */

import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PASSWORD_MESSAGE =
	"Password must contain at least one uppercase letter, one lowercase letter, and one number";

const normalizeEmail = (value: unknown): unknown => {
	if (typeof value !== "string") {
		return value;
	}

	return value.trim().toLowerCase();
};

/**
 * Login schema — email + password
 */
export const LoginSchema = z.object({
	email: z.preprocess(normalizeEmail, z.string().email()),
	password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Register schema — name, email, password, optional role and phone
 */
export const RegisterSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.preprocess(normalizeEmail, z.string().email("Invalid email address")),
	password: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
	role: z
		.enum([
			"gerente",
			"residente",
			"hes",
			"supervisor",
			"operador",
			"tecnico",
			"administrativo",
			"cliente",
		])
		.optional(),
	phone: z.string().max(20).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

/**
 * Refresh token schema — for token refresh endpoint
 */
export const RefreshTokenSchema = z.object({
	refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

/**
 * Change password schema — current password + new password
 */
export const ChangePasswordSchema = z.object({
	currentPassword: z.string().min(1),
	newPassword: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
