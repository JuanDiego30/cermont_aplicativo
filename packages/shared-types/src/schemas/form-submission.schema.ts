import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const FormSubmissionValueSchema = z.union([z.string(), z.number(), z.boolean()]);

export const FormSubmissionPhotoAttachmentSchema = z
	.object({
		fieldKey: z.string().min(1),
		fileId: z.string().min(1),
		fileName: z.string().min(1),
		mimeType: z.string().min(1),
		sizeBytes: z.number().int().nonnegative(),
	})
	.strict();

export const CreateFormSubmissionSchema = z
	.object({
		templateId: z.string().min(1).max(100),
		stepCode: z.string().min(1).max(80),
		serviceCaseId: ObjectIdSchema.optional(),
		executionSessionId: ObjectIdSchema.optional(),
		values: z.record(z.string(), FormSubmissionValueSchema),
		photoAttachments: z.array(FormSubmissionPhotoAttachmentSchema).optional(),
		status: z.enum(["draft", "submitted"]).optional(),
	})
	.strict();

export type CreateFormSubmissionInput = z.infer<typeof CreateFormSubmissionSchema>;

export const FormSubmissionIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type FormSubmissionIdParams = z.infer<typeof FormSubmissionIdParamsSchema>;
