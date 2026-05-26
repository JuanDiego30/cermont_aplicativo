/**
 * DocumentAttachment Schema — Association between documents and entities
 *
 * PROMPT 17/19 compliance: Kits, tools, resources with attached documentation.
 * Each attachment links a document to a business entity (kit, tool, resource, etc.)
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const DocumentAttachmentTypeEnum = z.enum([
	"manual",
	"datasheet",
	"certificate",
	"procedure",
	"checklist",
	"format",
	"safety",
	"technical_sheet",
	"calibration_certificate",
	"other",
]);

export type DocumentAttachmentType = z.infer<typeof DocumentAttachmentTypeEnum>;

export const DocumentAttachmentEntityTypeEnum = z.enum([
	"kit",
	"tool",
	"resource",
	"equipment",
	"maintenance",
	"planning",
	"order",
]);

export type DocumentAttachmentEntityType = z.infer<typeof DocumentAttachmentEntityTypeEnum>;

/**
 * DocumentAttachment represents a link between a document and an entity
 */
export const DocumentAttachmentSchema = z
	.object({
		_id: z.string().optional(),
		documentId: z.string().min(1),
		entityType: DocumentAttachmentEntityTypeEnum,
		entityId: z.string().min(1),
		label: z.string().min(1).max(200),
		type: DocumentAttachmentTypeEnum,
		required: z.boolean().default(false),
		notes: z.string().max(1000).optional(),
		createdAt: z.string().datetime().optional(),
		createdBy: z.string().min(1).optional(),
	})
	.strict();

export type DocumentAttachment = z.infer<typeof DocumentAttachmentSchema>;

/**
 * Create document attachment
 */
export const CreateDocumentAttachmentSchema = z
	.object({
		documentId: z.string().min(1),
		entityType: DocumentAttachmentEntityTypeEnum,
		entityId: z.string().min(1),
		label: z.string().min(1).max(200),
		type: DocumentAttachmentTypeEnum,
		required: z.boolean().default(false),
		notes: z.string().max(1000).optional(),
	})
	.strict();

export type CreateDocumentAttachment = z.infer<typeof CreateDocumentAttachmentSchema>;

/**
 * Params for entity document operations
 */
export const EntityDocumentParamsSchema = z
	.object({
		entityId: ObjectIdSchema,
		documentId: ObjectIdSchema.optional(),
	})
	.strict();

export type EntityDocumentParams = z.infer<typeof EntityDocumentParamsSchema>;
