import { z } from "zod";
import { statusObjectOf } from "../utils/status-types";
import { ObjectIdSchema } from "./common.schema";

/**
 * Valid entity types that can have custom fields
 */
export const CustomFieldEntityTypeSchema = z.enum([
	"work_request",
	"order",
	"asset",
	"user",
	"client",
]);
export type CustomFieldEntityType = z.infer<typeof CustomFieldEntityTypeSchema>;

/**
 * Supported data types for custom fields
 */
export const CustomFieldDataTypeSchema = z.enum(["text", "number", "boolean", "select", "date"]);
export type CustomFieldDataType = z.infer<typeof CustomFieldDataTypeSchema>;

/**
 * Validation rules for custom fields
 */
export const CustomFieldValidationSchema = z
	.object({
		required: z.boolean().default(false),
		min: z.number().optional(),
		max: z.number().optional(),
		pattern: z.string().optional(), // regex pattern for text
		errorMessage: z.string().optional(),
	})
	.strict();

export type CustomFieldValidation = z.infer<typeof CustomFieldValidationSchema>;

/**
 * Schema for defining a custom field (Admin level)
 */
export const CustomFieldDefinitionSchema = z
	.object({
		_id: z.string().optional(),
		entityType: CustomFieldEntityTypeSchema,
		name: z
			.string()
			.min(2)
			.max(50)
			.regex(/^[a-zA-Z0-9_]+$/, "Name must contain only letters, numbers, and underscores"),
		label: z.string().min(2).max(100),
		description: z.string().max(300).optional(),
		dataType: CustomFieldDataTypeSchema,
		options: z.array(z.string()).optional(), // Only for 'select' dataType
		validation: CustomFieldValidationSchema.default({ required: false }),
		isActive: z.boolean().default(true),
		order: z.number().default(0), // For UI sorting
		createdAt: z.string().datetime().optional(),
		updatedAt: z.string().datetime().optional(),
		createdBy: ObjectIdSchema.optional(),
		updatedBy: ObjectIdSchema.optional(),
		deletedAt: statusObjectOf(z.string().datetime()).optional(),
		deletedBy: statusObjectOf(ObjectIdSchema).optional(),
	})
	.strict();

export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;

/**
 * Schema for creating a new custom field definition
 */
export const CreateCustomFieldDefinitionDtoSchema = CustomFieldDefinitionSchema.omit({
	_id: true,
	createdAt: true,
	updatedAt: true,
	createdBy: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});

export type CreateCustomFieldDefinitionDto = z.infer<typeof CreateCustomFieldDefinitionDtoSchema>;

/**
 * Schema for updating an existing custom field definition
 */
export const UpdateCustomFieldDefinitionDtoSchema = CreateCustomFieldDefinitionDtoSchema.partial();

export type UpdateCustomFieldDefinitionDto = z.infer<typeof UpdateCustomFieldDefinitionDtoSchema>;

/**
 * Base schema for custom field values stored on entities
 * This is an open record since the keys are dynamic based on the definitions
 */
export const CustomFieldValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type CustomFieldValue = z.infer<typeof CustomFieldValueSchema>;

export const CustomFieldValuesSchema = z.record(z.string(), CustomFieldValueSchema).optional();

export type CustomFieldValues = z.infer<typeof CustomFieldValuesSchema>;
