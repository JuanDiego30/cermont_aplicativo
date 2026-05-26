/**
 * Resource Schema — Zod validation for resources (tools, vehicles, equipment)
 *
 * Extended for advanced tool management with certifications and documents.
 * Maps to backend model: apps/backend/src/models/Resource.ts
 * Reference: DOC-09 Section Diccionario de Datos
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { WorkflowStageSchema } from "./template-draft.schema";

/**
 * Resource type
 */
export const ResourceTypeEnum = z.enum(["tool", "vehicle", "equipment"]);
export type ResourceType = z.infer<typeof ResourceTypeEnum>;

/**
 * Extended resource status
 */
export const ResourceStatusEnum = z.enum([
	"available",
	"assigned",
	"maintenance",
	"expired",
	"inactive",
]);
export type ResourceStatus = z.infer<typeof ResourceStatusEnum>;

/**
 * Certification for tools/equipment
 */
export const CertificationSchema = z.object({
	id: z.string().optional(),
	type: z.enum(["calibration", "inspection", "safety", "training", "license", "other"]),
	name: z.string().min(1).max(200),
	issuedAt: z.string().datetime(),
	expiresAt: z.string().datetime(),
	status: z.enum(["valid", "expired", "pending", "revoked"]).default("valid"),
	issuer: z.string().max(200).optional(),
	documentId: ObjectIdSchema.optional(),
});
export type Certification = z.infer<typeof CertificationSchema>;

/**
 * Evidence requirement for resource
 */
export const ResourceEvidenceRequirementSchema = z.object({
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
export type ResourceEvidenceRequirement = z.infer<typeof ResourceEvidenceRequirementSchema>;

/**
 * File attachment for resource (for uploaded files, not document references)
 */
export const ResourceFileAttachmentSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1).max(200),
	fileId: ObjectIdSchema.optional(),
	fileUrl: z.string().url().optional(),
	mimeType: z.string().max(100).optional(),
	size: z.number().int().nonnegative().optional(),
	uploadedAt: z.string().datetime().optional(),
});
export type ResourceFileAttachment = z.infer<typeof ResourceFileAttachmentSchema>;

/**
 * Create a new resource
 */
export const CreateResourceSchema = z
	.object({
		name: z.string().min(1).max(200),
		type: ResourceTypeEnum,
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		brand: z.string().max(100).optional(),
		model: z.string().max(100).optional(),
		purchaseDate: z.string().datetime().optional(),
		category: z.string().max(100).optional(),
		certifications: z.array(CertificationSchema).default([]),
		documents: z.array(ResourceFileAttachmentSchema).default([]),
		evidenceRequirements: z.array(ResourceEvidenceRequirementSchema).default([]),
		dynamicForms: z.array(ObjectIdSchema).default([]),
	})
	.strict();

export type CreateResource = z.infer<typeof CreateResourceSchema>;

/**
 * Update a resource
 */
export const UpdateResourceSchema = z
	.object({
		name: z.string().min(1).max(200).optional(),
		type: ResourceTypeEnum.optional(),
		status: ResourceStatusEnum.optional(),
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		brand: z.string().max(100).optional(),
		model: z.string().max(100).optional(),
		purchaseDate: z.string().datetime().optional(),
		maintenanceDate: z.string().datetime().optional(),
		category: z.string().max(100).optional(),
		certifications: z.array(CertificationSchema).optional(),
		documents: z.array(ResourceFileAttachmentSchema).optional(),
		evidenceRequirements: z.array(ResourceEvidenceRequirementSchema).optional(),
		dynamicForms: z.array(ObjectIdSchema).optional(),
	})
	.strict();

export type UpdateResource = z.infer<typeof UpdateResourceSchema>;

export const ResourceIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type ResourceIdParams = z.infer<typeof ResourceIdSchema>;

export const UpdateResourceStatusSchema = z
	.object({
		status: ResourceStatusEnum,
	})
	.strict();

export type UpdateResourceStatus = z.infer<typeof UpdateResourceStatusSchema>;

/**
 * Add certification to resource
 */
export const AddCertificationSchema = z
	.object({
		type: z.enum(["calibration", "inspection", "safety", "training", "license", "other"]),
		name: z.string().min(1).max(200),
		issuedAt: z.string().datetime(),
		expiresAt: z.string().datetime(),
		issuer: z.string().max(200).optional(),
		documentId: ObjectIdSchema.optional(),
	})
	.strict();

export type AddCertificationInput = z.infer<typeof AddCertificationSchema>;

/**
 * Full resource record (response)
 */
export const ResourceOutputDtoSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		type: ResourceTypeEnum,
		status: ResourceStatusEnum,
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		brand: z.string().optional(),
		model: z.string().optional(),
		purchaseDate: z.string().datetime().optional(),
		maintenanceDate: z.string().datetime().optional(),
		category: z.string().optional(),
		certifications: z.array(CertificationSchema).default([]),
		documents: z.array(ResourceFileAttachmentSchema).default([]),
		evidenceRequirements: z.array(ResourceEvidenceRequirementSchema).default([]),
		dynamicForms: z.array(ObjectIdSchema).default([]),
		createdBy: z.string().optional(),
		updatedBy: z.string().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export const ResourceSchema = ResourceOutputDtoSchema;
export type Resource = z.infer<typeof ResourceOutputDtoSchema>;

/**
 * Resource list query
 */
export const ResourceListQuerySchema = z
	.object({
		type: ResourceTypeEnum.optional(),
		status: ResourceStatusEnum.optional(),
		category: z.string().optional(),
		search: z.string().optional(),
		expired: z.boolean().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();
export type ResourceListQuery = z.infer<typeof ResourceListQuerySchema>;
