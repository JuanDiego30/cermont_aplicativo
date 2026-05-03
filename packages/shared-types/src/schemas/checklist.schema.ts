import { z } from "zod";
import { normalizeOptionalStringQueryValue, normalizeQueryValue } from "../utils";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

export const ChecklistItemCategorySchema = z.enum(["tool", "equipment", "ppe", "procedure"]);
export type ChecklistItemCategory = z.infer<typeof ChecklistItemCategorySchema>;

export const ChecklistStatusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export type ChecklistStatus = z.infer<typeof ChecklistStatusSchema>;

export const ChecklistFieldTypeSchema = z.enum([
	"boolean",
	"text",
	"long_text",
	"number",
	"select",
	"multi_select",
	"photo",
	"signature",
]);
export type ChecklistFieldType = z.infer<typeof ChecklistFieldTypeSchema>;

export const ChecklistItemSchema = z
	.object({
		id: z.string().min(1),
		category: ChecklistItemCategorySchema,
		type: ChecklistFieldTypeSchema.default("boolean"),
		description: z.string().min(3).max(300),
		required: z.boolean().default(false),
		options: z.array(z.string()).optional(), // For select/multi_select
		completed: z.boolean().default(false),
		value: z.unknown().optional(), // Stores the actual response (string, number, etc.)
		completedBy: z.string().min(1).optional(),
		completedAt: z.string().datetime().optional(),
		observation: z.string().max(500).optional(),
	})
	.strip();
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistTemplateSchema = z
	.object({
		_id: z.string(),
		name: z.string().min(3).max(100),
		description: z.string().max(500).optional(),
		category: z.string().optional(),
		items: z.array(ChecklistItemSchema).default([]),
		version: z.string().default("1.0.0"),
		isActive: z.boolean().default(true),
		createdBy: z.string(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type ChecklistTemplate = z.infer<typeof ChecklistTemplateSchema>;

export const CreateChecklistTemplateSchema = ChecklistTemplateSchema.omit({
	_id: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	items: z.array(
		ChecklistItemSchema.omit({
			completed: true,
			value: true,
			completedBy: true,
			completedAt: true,
			observation: true,
		}),
	),
});
export type CreateChecklistTemplateInput = z.infer<typeof CreateChecklistTemplateSchema>;

export const UpdateChecklistTemplateSchema = CreateChecklistTemplateSchema.partial();
export type UpdateChecklistTemplateInput = z.infer<typeof UpdateChecklistTemplateSchema>;

export const ChecklistResponseSchema = z
	.object({
		_id: z.string(),
		orderId: ObjectIdSchema,
		templateName: z.string().optional(),
		status: ChecklistStatusSchema,
		items: z.array(ChecklistItemSchema).default([]),
		completedBy: z.string().min(1).optional(),
		completedAt: z.string().datetime().optional(),
		signature: z.string().min(1).optional(),
		observations: z.string().max(2000).optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();
export type ChecklistResponse = z.infer<typeof ChecklistResponseSchema>;
export type Checklist = ChecklistResponse;

export const CreateChecklistSchema = z
	.object({
		orderId: ObjectIdSchema,
	})
	.strip();
export type CreateChecklistInput = z.infer<typeof CreateChecklistSchema>;

export const UpdateChecklistItemSchema = z
	.object({
		completed: z.boolean().optional(),
		value: z.unknown().optional(),
		observation: z.string().max(500).optional(),
	})
	.strip();
export type UpdateChecklistItemInput = z.infer<typeof UpdateChecklistItemSchema>;

export const CompleteChecklistSchema = z
	.object({
		signature: z.string().min(1),
		observations: z.string().max(2000).optional(),
	})
	.strip();
export type CompleteChecklistInput = z.infer<typeof CompleteChecklistSchema>;

export const ListChecklistsQuerySchema = z
	.object({
		orderId: z.preprocess(normalizeOptionalStringQueryValue, ObjectIdSchema.optional()),
		status: z.preprocess(normalizeOptionalStringQueryValue, ChecklistStatusSchema.optional()),
		page: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1)).default(1),
		limit: z.preprocess(normalizeQueryValue, z.coerce.number().int().min(1).max(100)).default(20),
	})
	.strip();
export type ListChecklistsQuery = z.infer<typeof ListChecklistsQuerySchema>;

export const ChecklistOrderIdParamsSchema = z
	.object({
		orderId: ObjectIdSchema,
	})
	.strip();

export type ChecklistOrderIdParams = z.infer<typeof ChecklistOrderIdParamsSchema>;

export const ChecklistIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strip();

export type ChecklistIdParams = z.infer<typeof ChecklistIdParamsSchema>;

export const ChecklistItemParamsSchema = z
	.object({
		id: ObjectIdSchema,
		itemId: z.string().min(1),
	})
	.strip();

export type ChecklistItemParams = z.infer<typeof ChecklistItemParamsSchema>;

// Backwards-compatible alias used by older imports.
export const ChecklistSchema = ChecklistResponseSchema;

export interface ChecklistItemDocument<TID = string> {
	id: string;
	category: ChecklistItemCategory;
	type: ChecklistFieldType;
	description: string;
	required: boolean;
	options?: string[];
	completed: boolean;
	value?: unknown;
	completedBy?: TID;
	completedAt?: Date;
	observation?: string;
}

export interface ChecklistTemplateDocument<TID = string> extends MongooseDocument<TID> {
	name: string;
	description?: string;
	category?: string;
	items: {
		id: string;
		category: ChecklistItemCategory;
		type: ChecklistFieldType;
		description: string;
		required: boolean;
		options?: string[];
	}[];
	version: string;
	isActive: boolean;
	createdBy: TID;
}

/**
 * Mongoose Document representation for Checklist.
 * Used for type safety in backend services and repositories.
 */
export interface ChecklistDocument<TID = string> extends MongooseDocument<TID> {
	orderId: TID;
	templateId?: TID;
	templateName?: string;
	status: ChecklistStatus;
	items: ChecklistItemDocument<TID>[];
	completedBy?: TID;
	completedAt?: Date;
	signature?: string;
	observations?: string;
	idempotencyKey?: string;
}
