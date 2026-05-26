import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const FormFieldResponseSchema = z
	.object({
		fieldKey: z.string().min(1),
		value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
		isCustomOption: z.boolean().default(false),
		customValue: z.string().nullable().default(null),
		proposeForCatalog: z.boolean().default(false),
		fileUrl: z.string().url().optional(),
	})
	.strict();
export type FormFieldResponse = z.infer<typeof FormFieldResponseSchema>;

export const DynamicFormResponseSchema = z
	.object({
		_id: ObjectIdSchema,
		templateId: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		orderId: ObjectIdSchema.optional(),
		stepKey: z.string().min(1),
		responses: z.array(FormFieldResponseSchema),
		capturedBy: ObjectIdSchema,
		capturedAt: z.string().datetime(),
		clientMutationId: z.string().optional(),
		isOfflineSync: z.boolean().default(false),
		syncStatus: z.enum(["synced", "pending", "failed"]).default("synced"),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type DynamicFormResponse = z.infer<typeof DynamicFormResponseSchema>;

export const SubmitDynamicFormResponseSchema = z
	.object({
		templateId: ObjectIdSchema,
		serviceCaseId: ObjectIdSchema,
		orderId: ObjectIdSchema.optional(),
		stepKey: z.string().min(1),
		responses: z.array(FormFieldResponseSchema).min(1),
		clientMutationId: z.string().optional(),
	})
	.strict();
export type SubmitDynamicFormResponseInput = z.infer<typeof SubmitDynamicFormResponseSchema>;
