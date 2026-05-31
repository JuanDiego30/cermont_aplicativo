import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const EvidenceTypeSchema = z.enum([
	"before",
	"during",
	"after",
	"defect",
	"safety",
	"signature",
]);

export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const EvidenceIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export const EvidenceOrderIdParamsSchema = z
	.object({
		orderId: ObjectIdSchema,
	})
	.strict();

export const EvidenceSchema = z
	.object({
		_id: ObjectIdSchema,
		orderId: ObjectIdSchema,
		type: EvidenceTypeSchema,
		filename: z.string(),
		url: z.string().url(),
		mimeType: z.string(),
		sizeBytes: z.number().int().positive(),
		description: z.string().max(500).optional(),
		gpsLocation: z
			.object({
				lat: z.number(),
				lng: z.number(),
				capturedAt: z.string().datetime(),
			})
			.optional(),
		capturedAt: z.string().datetime(),
		uploadedAt: z.string().datetime(),
		uploadedBy: ObjectIdSchema,
		deletedAt: z.string().datetime().nullable().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export const CreateEvidenceSchema = z
	.object({
		orderId: ObjectIdSchema,
		type: EvidenceTypeSchema,
		description: z.string().max(500).optional(),
		gpsLocation: z
			.object({
				lat: z.number(),
				lng: z.number(),
				capturedAt: z.string().datetime(),
			})
			.optional(),
		capturedAt: z.string().datetime(),
	})
	.strict();

export type EvidenceId = z.infer<typeof EvidenceIdSchema>;
export type EvidenceOrderIdParams = z.infer<typeof EvidenceOrderIdParamsSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
