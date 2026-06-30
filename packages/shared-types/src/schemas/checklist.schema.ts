import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

const normalizeQueryValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value);

const normalizeOptionalStringQueryValue = (value: unknown): unknown => {
	const normalized = normalizeQueryValue(value);

	if (typeof normalized !== "string") {
		return normalized;
	}

	const trimmed = normalized.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

export const ChecklistItemCategorySchema = z.enum(["tool", "equipment", "ppe", "procedure"]);
export type ChecklistItemCategory = z.infer<typeof ChecklistItemCategorySchema>;

export const ChecklistStatusSchema = z.enum(["pending", "in_progress", "completed", "cancelled"]);
export type ChecklistStatus = z.infer<typeof ChecklistStatusSchema>;

export const ChecklistItemResultSchema = z.enum(["pending", "passed", "failed"]);
export type ChecklistItemResult = z.infer<typeof ChecklistItemResultSchema>;

export const ChecklistItemSchema = z
	.object({
		id: z.string().min(1),
		category: ChecklistItemCategorySchema,
		description: z.string().min(3).max(300),
		required: z.boolean().default(false),
		isBlocking: z.boolean().default(false),
		result: ChecklistItemResultSchema.default("pending"),
		completed: z.boolean().default(false),
		completedBy: z.string().min(1).optional(),
		completedAt: z.string().datetime().optional(),
		observation: z.string().max(500).optional(),
		requiresPhoto: z.boolean().default(false),
		requiresSignature: z.boolean().default(false),
		evidenceAssetIds: z.array(z.string().min(1)).default([]),
	})
	.strip();
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const ChecklistResponseSchema = z
	.object({
		_id: z.string(),
		orderId: ObjectIdSchema,
		templateName: z.string().optional(),
		templateVersion: z.number().int().positive().default(1),
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
		result: ChecklistItemResultSchema,
		observation: z.string().max(500).optional(),
	})
	.strip()
	.superRefine((value, context) => {
		if (value.result === "failed" && !value.observation?.trim()) {
			context.addIssue({
				code: "custom",
				path: ["observation"],
				message: "Debe registrar el hallazgo cuando el resultado es fallido",
			});
		}
	});
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
