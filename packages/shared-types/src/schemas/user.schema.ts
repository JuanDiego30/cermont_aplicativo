import { z } from "zod";
import { normalizeUserRole } from "../rbac";
import { ObjectIdSchema } from "./common.schema";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PASSWORD_MESSAGE =
	"Password must contain at least one uppercase letter, one lowercase letter, and one number";

const normalizeEmail = (value: unknown): unknown => {
	if (typeof value !== "string") {
		return value;
	}

	return value.trim().toLowerCase();
};

const normalizeRoleInput = (value: unknown): unknown => {
	if (typeof value !== "string") {
		return value;
	}

	const normalized = normalizeUserRole(value);
	return normalized || value;
};

// Roles RBAC (15 roles) — SSOT en @cermont/domain
// DOC-04 §4.2: valores canónicos en español y minúsculas.
const CanonicalUserRoleSchema = z.enum([
	"gerente",
	"residente",
	"hes",
	"coord_administrativo",
	"auxiliar_contable",
	"supervisor",
	"auxiliar_hes",
	"supervisor_electricista",
	"tecnico_electricista",
	"operador",
	"tecnico",
	"oficial_construccion",
	"administrativo",
	"pasante",
	"cliente",
]);
export const UserRoleSchema = z.preprocess(normalizeRoleInput, CanonicalUserRoleSchema);
export type UserRole = z.infer<typeof UserRoleSchema>;

const normalizeQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

const normalizeOptionalStringQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized !== "string") {
		return normalized;
	}

	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeOptionalBooleanQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized === "boolean") {
		return normalized;
	}

	if (typeof normalized !== "string") {
		return normalized;
	}

	const trimmed = normalized.trim().toLowerCase();

	if (trimmed === "true" || trimmed === "1") {
		return true;
	}
	if (trimmed === "false" || trimmed === "0") {
		return false;
	}

	return undefined;
};

// Schema base del usuario (sin password — nunca sale del backend)
export const UserSchema = z
	.object({
		_id: ObjectIdSchema,
		name: z.string().min(2).max(100),
		email: z.preprocess(normalizeEmail, z.email()),
		role: UserRoleSchema,
		isActive: z.boolean().default(true),
		phone: z.string().max(20).optional(),
		avatarUrl: z.string().url().optional(),
		certifications: z
			.array(
				z.object({
					name: z.string(),
					issuedAt: z.string().datetime(),
					expiresAt: z.string().datetime().optional(),
					certificationNumber: z.string().optional(),
					issuingBody: z.string().max(200).optional(),
				}),
			)
			.default([]),
		skills: z.array(z.string().min(1).max(100)).default([]),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type User = z.infer<typeof UserSchema>;

// Schema para crear un usuario (entrada desde API)
export const CreateUserSchema = z
	.object({
		name: z.string().min(2).max(100),
		email: z.preprocess(normalizeEmail, z.email()),
		password: z.string().min(8).max(72).regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
		role: UserRoleSchema,
		phone: z.string().max(20).optional(),
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

// ============================================================================
// Additional Types (missing and causing frontend errors)
// ============================================================================

/**
 * User certification for technical personnel
 */
export const UserCertificationSchema = z.object({
	name: z.string(),
	issuedAt: z.string().datetime(),
	expiresAt: z.string().datetime().optional(),
	certificationNumber: z.string().optional(),
	issuingBody: z.string().max(200).optional(),
});
export type UserCertification = z.infer<typeof UserCertificationSchema>;

/**
 * Add a certification to a user (personnel certification matrix)
 */
export const AddUserCertificationSchema = UserCertificationSchema.strict();
export type AddUserCertificationInput = z.infer<typeof AddUserCertificationSchema>;

/**
 * Replace the skills list of a user (skills matrix)
 */
export const UpdateUserSkillsSchema = z
	.object({
		skills: z.array(z.string().min(1).max(100)).max(50),
	})
	.strict();
export type UpdateUserSkillsInput = z.infer<typeof UpdateUserSkillsSchema>;

/**
 * Navigation badges for sidebar indicators
 */
export const NavigationBadgesSchema = z.record(z.string(), z.number());
export type NavigationBadges = z.infer<typeof NavigationBadgesSchema>;
