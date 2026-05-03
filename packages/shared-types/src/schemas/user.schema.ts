import { z } from "zod";
import { ALL_AUTHENTICATED_ROLES, normalizeUserRole, type UserRole } from "../rbac";
import { normalizeOptionalBooleanQueryValue, normalizeOptionalStringQueryValue } from "../utils";
import {
	EmailSchema,
	type MongooseDocument,
	ObjectIdSchema,
	PASSWORD_MESSAGE,
	PASSWORD_REGEX,
} from "./common.schema";

export const CanonicalUserRoleSchema = z.enum(ALL_AUTHENTICATED_ROLES);
export const UserRoleSchema = z.preprocess((value) => {
	if (typeof value !== "string") {
		return value;
	}
	return normalizeUserRole(value) || value;
}, CanonicalUserRoleSchema);

export const UserCertificationSchema = z
	.object({
		name: z.string().min(1),
		issuedAt: z.string().datetime().optional(),
		expiresAt: z.string().datetime().optional(),
		status: z.enum(["active", "expired", "na"]).default("na"),
		documentUrl: z.string().url().optional(),
	})
	.strip();
export type UserCertification = z.infer<typeof UserCertificationSchema>;

// Schema base del usuario (sin password — nunca sale del backend)
export const UserSchema = z
	.object({
		_id: ObjectIdSchema,
		name: z.string().min(2).max(100),
		email: EmailSchema,
		role: UserRoleSchema,
		isActive: z.boolean().default(true),
		phone: z.string().max(20).optional(),
		avatarUrl: z.string().url().optional(),
		certifications: z.array(UserCertificationSchema).default([]),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type User = z.infer<typeof UserSchema>;

// Schema para crear un usuario (entrada desde API)
export const CreateUserSchema = z
	.object({
		name: z.string().min(2).max(100),
		email: EmailSchema,
		password: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
		role: UserRoleSchema,
		phone: z.string().max(20).optional(),
		certifications: z.array(UserCertificationSchema).optional(),
	})
	.strict();
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Schema para actualizar (todos los campos opcionales)
export const UpdateUserSchema = CreateUserSchema.omit({
	password: true,
})
	.partial()
	.extend({
		avatarUrl: z.string().url().optional(),
	})
	.strict();
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UserIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;

export const UserRoleParamsSchema = z
	.object({
		role: UserRoleSchema,
	})
	.strict();

export type UserRoleParams = z.infer<typeof UserRoleParamsSchema>;

export const ListUsersQuerySchema = z
	.object({
		page: z
			.preprocess(normalizeOptionalStringQueryValue, z.coerce.number().int().min(1))
			.default(1),
		limit: z
			.preprocess(normalizeOptionalStringQueryValue, z.coerce.number().int().min(1).max(100))
			.default(50),
		role: z.preprocess(normalizeOptionalStringQueryValue, UserRoleSchema.optional()),
		isActive: z.preprocess(normalizeOptionalBooleanQueryValue, z.boolean().optional()),
	})
	.strict();

export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;

/**
 * Mongoose Document representation for User.
 * Used for type safety in backend services and repositories.
 */
export interface UserDocument<TID = string> extends MongooseDocument<TID> {
	name: string;
	email: string;
	password?: string;
	role: UserRole;
	isActive: boolean;
	phone?: string;
	avatarUrl?: string;
	certifications: Array<{
		name: string;
		issuedAt?: Date;
		expiresAt?: Date;
		status: "active" | "expired" | "na";
		documentUrl?: string;
	}>;
	resetToken?: string;
	resetTokenExpires?: Date;
	webAuthnCredentials?: WebAuthnCredentialDocument[];
}

export interface WebAuthnCredentialDocument {
	credentialId: string;
	publicKey: Uint8Array<ArrayBufferLike>;
	counter: number;
	transports?: string[];
	deviceLabel?: string;
	createdAt: Date;
	lastUsedAt?: Date;
}
