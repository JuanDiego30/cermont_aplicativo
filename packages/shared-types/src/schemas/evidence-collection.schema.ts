/**
 * Evidence Collection Schema — structured evidence attached to workflow entities
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const EvidenceCollectionEntityTypeEnum = z.enum([
	"workOrder",
	"planning",
	"execution",
	"kit",
	"tool",
	"templateResponse",
]);
export type EvidenceCollectionEntityType = z.infer<typeof EvidenceCollectionEntityTypeEnum>;

export const EvidenceCollectionItemTypeEnum = z.enum([
	"photo_before",
	"photo_during",
	"photo_after",
	"finding",
	"corrective_action",
	"signature",
	"document",
	"checklist",
]);
export type EvidenceCollectionItemType = z.infer<typeof EvidenceCollectionItemTypeEnum>;

export const EvidenceCollectionStageEnum = z.enum([
	"before",
	"during",
	"after",
	"finding",
	"corrective_action",
]);
export type EvidenceCollectionStage = z.infer<typeof EvidenceCollectionStageEnum>;

export const EvidenceCollectionLocationInputSchema = z
	.object({
		lat: z.number().min(-90).max(90),
		lng: z.number().min(-180).max(180),
		address: z.string().max(500).optional(),
	})
	.strict();
export type EvidenceCollectionLocationInput = z.infer<typeof EvidenceCollectionLocationInputSchema>;

export const EvidenceCollectionLocationSchema = z
	.object({
		latitude: z.number().min(-90).max(90).optional(),
		longitude: z.number().min(-180).max(180).optional(),
		address: z.string().optional(),
	})
	.strict();
export type EvidenceCollectionLocation = z.infer<typeof EvidenceCollectionLocationSchema>;

export const EvidenceCollectionItemSchema = z
	.object({
		itemId: z.string().min(1),
		type: EvidenceCollectionItemTypeEnum,
		stage: EvidenceCollectionStageEnum.optional(),
		component: z.string().max(200).optional(),
		description: z.string().max(1000).optional(),
		fileId: ObjectIdSchema.optional(),
		fileUrl: z.string().url().optional(),
		location: EvidenceCollectionLocationSchema.optional(),
		capturedAt: z.string().datetime(),
		capturedBy: ObjectIdSchema,
		linkedFieldKey: z.string().optional(),
		linkedChecklistItemId: z.string().optional(),
	})
	.strict();
export type EvidenceCollectionItem = z.infer<typeof EvidenceCollectionItemSchema>;

export const EvidenceCollectionSchema = z
	.object({
		_id: ObjectIdSchema,
		entityType: EvidenceCollectionEntityTypeEnum,
		entityId: ObjectIdSchema,
		title: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
		evidenceItems: z.array(EvidenceCollectionItemSchema).default([]),
		createdBy: ObjectIdSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type EvidenceCollection = z.infer<typeof EvidenceCollectionSchema>;

export const CreateEvidenceCollectionSchema = z
	.object({
		entityType: EvidenceCollectionEntityTypeEnum,
		entityId: ObjectIdSchema,
		title: z.string().min(1).max(200),
		description: z.string().max(1000).optional(),
	})
	.strict();
export type CreateEvidenceCollectionInput = z.infer<typeof CreateEvidenceCollectionSchema>;

export const AddEvidenceCollectionItemSchema = z
	.object({
		type: EvidenceCollectionItemTypeEnum,
		stage: EvidenceCollectionStageEnum.optional(),
		component: z.string().max(200).optional(),
		description: z.string().max(1000).optional(),
		fileId: ObjectIdSchema.optional(),
		url: z.string().url().optional(),
		location: EvidenceCollectionLocationInputSchema.optional(),
		capturedBy: ObjectIdSchema.optional(),
		linkedFieldKey: z.string().optional(),
		linkedChecklistItemId: z.string().optional(),
	})
	.strict();
export type AddEvidenceCollectionItemInput = z.infer<typeof AddEvidenceCollectionItemSchema>;

export const EvidenceCollectionIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
export type EvidenceCollectionIdParams = z.infer<typeof EvidenceCollectionIdParamsSchema>;

export const EvidenceCollectionItemParamsSchema = z
	.object({
		id: ObjectIdSchema,
		itemId: z.string().min(1),
	})
	.strict();
export type EvidenceCollectionItemParams = z.infer<typeof EvidenceCollectionItemParamsSchema>;

export const EvidenceCollectionByEntityParamsSchema = z
	.object({
		entityType: EvidenceCollectionEntityTypeEnum,
		entityId: ObjectIdSchema,
	})
	.strict();
export type EvidenceCollectionByEntityParams = z.infer<
	typeof EvidenceCollectionByEntityParamsSchema
>;

export const EvidenceCollectionListQuerySchema = z
	.object({
		entityType: EvidenceCollectionEntityTypeEnum.optional(),
		entityId: ObjectIdSchema.optional(),
		search: z.string().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();
export type EvidenceCollectionListQuery = z.infer<typeof EvidenceCollectionListQuerySchema>;
