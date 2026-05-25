import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const FormFieldTypeSchema = z.enum([
	"text",
	"textarea",
	"number",
	"select",
	"multiselect",
	"date",
	"datetime",
	"checkbox",
	"file",
	"signature",
	"gps",
]);
export type FormFieldType = z.infer<typeof FormFieldTypeSchema>;

export const DynamicSelectFieldOptionSchema = z
	.object({
		value: z.string().min(1),
		label: z.string().min(1),
	})
	.strict();
export type DynamicSelectFieldOption = z.infer<typeof DynamicSelectFieldOptionSchema>;

export const DynamicFormFieldSchema = z
	.object({
		key: z.string().min(1).max(100),
		label: z.string().min(1).max(200),
		type: FormFieldTypeSchema,
		required: z.boolean().default(false),
		placeholder: z.string().max(200).optional(),
		defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
		options: z.array(DynamicSelectFieldOptionSchema).optional(),
		allowCustomOption: z.boolean().default(false),
		customOptionLabel: z.string().default("Personalizado"),
		validation: z
			.object({
				minLength: z.number().int().positive().optional(),
				maxLength: z.number().int().positive().optional(),
				min: z.number().optional(),
				max: z.number().optional(),
				pattern: z.string().optional(),
			})
			.optional(),
	})
	.strict();
export type DynamicFormField = z.infer<typeof DynamicFormFieldSchema>;

export const DynamicFormTemplateSchema = z
	.object({
		_id: ObjectIdSchema,
		name: z.string().min(1).max(200),
		description: z.string().max(500).optional(),
		fields: z.array(DynamicFormFieldSchema).min(1),
		status: z.enum(["active", "draft", "archived"]).default("draft"),
		version: z.number().int().positive().default(1),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type DynamicFormTemplate = z.infer<typeof DynamicFormTemplateSchema>;

export const CreateDynamicFormTemplateSchema = z
	.object({
		name: z.string().min(1).max(200),
		description: z.string().max(500).optional(),
		fields: z.array(DynamicFormFieldSchema).min(1),
	})
	.strict();
export type CreateDynamicFormTemplateInput = z.infer<typeof CreateDynamicFormTemplateSchema>;

export const UpdateDynamicFormTemplateSchema = CreateDynamicFormTemplateSchema.partial();
export type UpdateDynamicFormTemplateInput = z.infer<typeof UpdateDynamicFormTemplateSchema>;
