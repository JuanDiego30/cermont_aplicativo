import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const PrivacyRequestTypeSchema = z.enum([
	"access",
	"rectification",
	"erasure",
	"restriction",
	"portability",
]);

export const CreatePrivacyRequestSchema = z
	.object({
		type: PrivacyRequestTypeSchema,
		description: z.string().min(1).max(2000),
	})
	.strict();

export type CreatePrivacyRequestInput = z.infer<typeof CreatePrivacyRequestSchema>;

export const PrivacyRequestIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
