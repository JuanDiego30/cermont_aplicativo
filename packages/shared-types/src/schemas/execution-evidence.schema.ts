import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { ExecutionGpsPointSchema } from "./execution-gps.schema";

export const ExecutionEvidenceReferenceSchema = z
	.object({
		evidenceId: ObjectIdSchema,
		documentId: ObjectIdSchema.optional(),
		type: z.enum(["image", "video", "document"]),
		phase: z.enum(["before", "during", "after", "incident", "checklist"]).default("during"),
		description: z.string().max(500).optional(),
		fieldRef: z.string().max(120).optional(),
		incidentId: z.string().max(80).optional(),
		materialUsageId: z.string().max(80).optional(),
		gpsPoint: ExecutionGpsPointSchema.optional(),
		uploadedBy: ObjectIdSchema,
		uploadedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionEvidenceReference = z.infer<typeof ExecutionEvidenceReferenceSchema>;

export const ExecutionEvidenceSchema = ExecutionEvidenceReferenceSchema;
export type ExecutionEvidence = ExecutionEvidenceReference;

export const ExecutionDocumentReferenceSchema = z
	.object({
		documentImportId: ObjectIdSchema,
		documentId: ObjectIdSchema.optional(),
		name: z.string().min(1).max(240),
		mimeType: z.string().min(1).max(160),
		uploadedAt: z.string().datetime(),
	})
	.strict();
export type ExecutionDocumentReference = z.infer<typeof ExecutionDocumentReferenceSchema>;
