/**
 * Auth Additional Schema — Zod validation for registration and password changes
 *
 * Reference: DOC-04 Section Authentication Flow
 */

import { z } from "zod";
import { EmailSchema, ObjectIdSchema, PASSWORD_MESSAGE, PASSWORD_REGEX } from "./common.schema";
import { UserRoleSchema } from "./user.schema";

/**
 * Login schema — email + password
 */
export const LoginSchema = z.object({
	email: EmailSchema,
	password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Register schema — name, email, password, optional role and phone
 */
export const RegisterSchema = z.object({
	name: z.string().min(2).max(100),
	email: EmailSchema,
	password: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
	role: UserRoleSchema.optional(),
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

export const ForgotPasswordSchema = z.object({
	email: EmailSchema,
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

const PasskeyCredentialResponseSchema = z
	.object({
		id: z.string().min(1),
		rawId: z.string().min(1),
		type: z.literal("public-key"),
		response: z.record(z.string(), z.unknown()),
		clientExtensionResults: z.record(z.string(), z.unknown()).optional(),
		authenticatorAttachment: z.string().optional(),
	})
	.passthrough();

export const PasskeyRegisterOptionsSchema = z
	.object({
		deviceLabel: z.string().trim().min(1).max(80).optional(),
	})
	.strict();
export type PasskeyRegisterOptionsInput = z.infer<typeof PasskeyRegisterOptionsSchema>;

export const PasskeyRegisterVerifySchema = z
	.object({
		deviceLabel: z.string().trim().min(1).max(80).optional(),
		credential: PasskeyCredentialResponseSchema,
	})
	.strict();
export type PasskeyRegisterVerifyInput = z.infer<typeof PasskeyRegisterVerifySchema>;

export const PasskeyLoginVerifySchema = z
	.object({
		credential: PasskeyCredentialResponseSchema,
	})
	.strict();
export type PasskeyLoginVerifyInput = z.infer<typeof PasskeyLoginVerifySchema>;

export const PasskeyCredentialParamsSchema = z
	.object({
		credentialId: z.string().min(1).max(512),
	})
	.strict();
export type PasskeyCredentialParams = z.infer<typeof PasskeyCredentialParamsSchema>;

export const AuthenticatedUserIdParamsSchema = z
	.object({
		userId: ObjectIdSchema,
	})
	.strict();
export type AuthenticatedUserIdParams = z.infer<typeof AuthenticatedUserIdParamsSchema>;
