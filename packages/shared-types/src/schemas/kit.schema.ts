/**
 * Kit Schema — Zod validation for kit templates and items
 *
 * Extended for dynamic kit system with items, documents, forms, evidence requirements, and rules.
 * Maps to backend model: apps/backend/src/models/Kit.ts
 * Reference: DOC-09 Section Diccionario de Datos, DOC-07 Section Kit Típico
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { FileAssetRefSchema } from "./file-asset.schema";
import { ServiceTypeSchema, WorkflowStageSchema } from "./template-draft.schema";

/**
 * Item type within a kit template
 */
export const KitItemTypeEnum = z.enum(["tool", "equipment", "material", "ppe", "document", "form"]);
export type KitItemType = z.infer<typeof KitItemTypeEnum>;

/**
 * Item within a kit template
 */
export const KitItemSchema = z.object({
	id: z.string().optional(), // for existing items
	type: KitItemTypeEnum,
	name: z.string().min(1).max(200),
	code: z.string().max(50).optional(),
	description: z.string().max(500).optional(),
	quantity: z.number().int().min(1),
	unit: z.string().min(1),
	unitCost: z.number().nonnegative().optional(),
	required: z.boolean().default(false),
	critical: z.boolean().default(false),
	// Image support for items
	image: FileAssetRefSchema.optional(),
});
export type KitItem = z.infer<typeof KitItemSchema>;

/**
 * File attachment within a kit (for uploaded files, not document references)
 */
export const KitFileAttachmentSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	fileId: ObjectIdSchema.optional(),
	fileUrl: z.string().url().optional(),
	mimeType: z.string().max(100).optional(),
	size: z.number().int().nonnegative().optional(),
	uploadedAt: z.string().datetime().optional(),
});
export type KitFileAttachment = z.infer<typeof KitFileAttachmentSchema>;

/**
 * Rule for kit validation
 */
export const KitRuleSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	condition: z.string().max(2000), // JSON condition or simple expression
	action: z.enum(["warn", "block", "require_evidence"]),
	message: z.string().max(1000),
	severity: z.enum(["low", "medium", "high"]),
	active: z.boolean().default(true),
});
export type KitRule = z.infer<typeof KitRuleSchema>;

/**
 * Form binding - template associated with kit
 */
export const KitFormBindingSchema = z.object({
	id: z.string().optional(),
	templateId: ObjectIdSchema,
	templateName: z.string().min(1).max(200),
	required: z.boolean().default(false),
	stage: WorkflowStageSchema.optional(),
});
export type KitFormBinding = z.infer<typeof KitFormBindingSchema>;

/**
 * Evidence requirement for kit
 */
export const EvidenceRequirementSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000).optional(),
	type: z.enum([
		"photo_before",
		"photo_during",
		"photo_after",
		"signature",
		"document",
		"gps",
		"checklist",
	]),
	required: z.boolean().default(false),
	stage: WorkflowStageSchema.optional(),
	component: z.string().max(200).optional(),
});
export type EvidenceRequirement = z.infer<typeof EvidenceRequirementSchema>;

/**
 * Kit template categories
 */
export const KitCategoryEnum = z.enum([
	"electrico",
	"mecanico",
	"civil",
	"instrumentacion",
	"general",
]);
export type KitCategory = z.infer<typeof KitCategoryEnum>;

/**
 * Kit status
 */
export const KitStatusEnum = z.enum(["draft", "published", "archived"]);
export type KitStatus = z.infer<typeof KitStatusEnum>;

/**
 * Full kit template record (response)
 */
export const KitTemplateSchema = z.object({
	_id: z.string(),
	name: z.string().min(1).max(200),
	description: z.string().max(500).optional(),
	category: KitCategoryEnum,
	version: z.number().int().min(1).default(1),
	status: KitStatusEnum.default("draft"),
	serviceTypeIds: z.array(ServiceTypeSchema).default([]),
	items: z.array(KitItemSchema).default([]),
	documents: z.array(KitFileAttachmentSchema).default([]),
	forms: z.array(KitFormBindingSchema).default([]),
	evidenceRequirements: z.array(EvidenceRequirementSchema).default([]),
	rules: z.array(KitRuleSchema).default([]),
	isActive: z.boolean().default(true),
	createdBy: z.string().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type KitTemplate = z.infer<typeof KitTemplateSchema>;

/**
 * Create a new kit template
 */
export const CreateKitSchema = KitTemplateSchema.omit({
	_id: true,
	version: true,
	createdAt: true,
	updatedAt: true,
}).extend({
	items: z.array(KitItemSchema).min(1), // items required on create
});
export type CreateKitInput = z.infer<typeof CreateKitSchema>;

/**
 * Update an existing kit template
 */
export const UpdateKitSchema = CreateKitSchema.partial();
export type UpdateKitInput = z.infer<typeof UpdateKitSchema>;

/**
 * Kit ID params
 */
export const KitIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
export type KitIdParams = z.infer<typeof KitIdParamsSchema>;

export const KitByServiceTypeParamsSchema = z
	.object({
		serviceTypeId: ServiceTypeSchema,
	})
	.strict();
export type KitByServiceTypeParams = z.infer<typeof KitByServiceTypeParamsSchema>;

/**
 * Kit list query
 */
export const KitListQuerySchema = z
	.object({
		status: KitStatusEnum.optional(),
		category: KitCategoryEnum.optional(),
		serviceType: ServiceTypeSchema.optional(),
		search: z.string().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();
export type KitListQuery = z.infer<typeof KitListQuerySchema>;

/**
 * Publish kit request
 */
export const PublishKitSchema = z.object({}).strict();
export type PublishKitInput = z.infer<typeof PublishKitSchema>;

/**
 * Archive kit request
 */
export const ArchiveKitSchema = z.object({}).strict();
export type ArchiveKitInput = z.infer<typeof ArchiveKitSchema>;
