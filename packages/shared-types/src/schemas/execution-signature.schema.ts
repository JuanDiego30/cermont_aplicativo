import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ExecutionSignatureSchema = z
	.object({
		signatureId: z.string().min(1).max(80),
		signedBy: ObjectIdSchema,
		signedByName: z.string().min(1).max(200),
		role: z.string().min(1).max(80),
		signatureType: z.enum(["technician", "supervisor", "client", "hes"]),
		imageDocumentId: ObjectIdSchema.optional(),
		signatureUrl: z.string().url().optional(),
		signedAt: z.string().datetime(),
		confirmed: z.boolean().default(false),
	})
	.strict();
export type ExecutionSignature = z.infer<typeof ExecutionSignatureSchema>;

export const FieldSignatureSchema = ExecutionSignatureSchema;
export type FieldSignature = ExecutionSignature;
