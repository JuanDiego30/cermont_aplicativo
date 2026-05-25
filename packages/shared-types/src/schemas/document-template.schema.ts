/**
 * Document Template Schema — Zod validation for document template inventory
 *
 * Phase 1: Document-Driven Contractor Platform
 * Maps to backend model: backend/src/document-templates/infrastructure/model.ts
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const DocumentTemplateSourceTypeEnum = z.enum([
	"xlsx",
	"xls",
	"pdf",
	"docx",
	"image",
	"manual",
]);

export type DocumentTemplateSourceType = z.infer<typeof DocumentTemplateSourceTypeEnum>;

export const DocumentTemplateStatusEnum = z.enum([
	"draft",
	"classified",
	"ready_for_import",
	"archived",
]);

export type DocumentTemplateStatus = z.infer<typeof DocumentTemplateStatusEnum>;

/**
 * Create a new document template inventory entry
 */
export const CreateDocumentTemplateSchema = z
	.object({
		templateName: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		serviceType: z.string().max(100).optional(),
		businessUnit: z.string().max(100).optional(),
		sourceType: DocumentTemplateSourceTypeEnum,
		frequencyOfUse: z.string().max(100).optional(),
		billingCriticality: z.string().max(100).optional(),
		layoutStability: z.string().max(100).optional(),
		requiresSignature: z.boolean().optional(),
		requiresPhotos: z.boolean().optional(),
		requiresGps: z.boolean().optional(),
		requiresOffline: z.boolean().optional(),
		status: DocumentTemplateStatusEnum.optional(),
	})
	.strict();

export type CreateDocumentTemplate = z.infer<typeof CreateDocumentTemplateSchema>;

/**
 * Update a document template
 */
export const UpdateDocumentTemplateSchema = z
	.object({
		templateName: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		serviceType: z.string().max(100).optional(),
		businessUnit: z.string().max(100).optional(),
		sourceType: DocumentTemplateSourceTypeEnum.optional(),
		frequencyOfUse: z.string().max(100).optional(),
		billingCriticality: z.string().max(100).optional(),
		layoutStability: z.string().max(100).optional(),
		requiresSignature: z.boolean().optional(),
		requiresPhotos: z.boolean().optional(),
		requiresGps: z.boolean().optional(),
		requiresOffline: z.boolean().optional(),
		status: DocumentTemplateStatusEnum.optional(),
	})
	.strict();

export type UpdateDocumentTemplate = z.infer<typeof UpdateDocumentTemplateSchema>;

/**
 * Patch classification fields only
 */
export const UpdateDocumentTemplateClassificationSchema = z
	.object({
		serviceType: z.string().max(100).optional(),
		businessUnit: z.string().max(100).optional(),
		frequencyOfUse: z.string().max(100).optional(),
		billingCriticality: z.string().max(100).optional(),
		layoutStability: z.string().max(100).optional(),
		requiresSignature: z.boolean().optional(),
		requiresPhotos: z.boolean().optional(),
		requiresGps: z.boolean().optional(),
		requiresOffline: z.boolean().optional(),
		status: DocumentTemplateStatusEnum.optional(),
	})
	.strict();

export type UpdateDocumentTemplateClassification = z.infer<
	typeof UpdateDocumentTemplateClassificationSchema
>;

export const DocumentTemplateIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type DocumentTemplateIdParams = z.infer<typeof DocumentTemplateIdSchema>;

/**
 * Full document template record (response)
 */
export const DocumentTemplateOutputDtoSchema = z
	.object({
		_id: z.string(),
		templateName: z.string(),
		description: z.string().optional(),
		serviceType: z.string().optional(),
		businessUnit: z.string().optional(),
		sourceType: DocumentTemplateSourceTypeEnum,
		frequencyOfUse: z.string().optional(),
		billingCriticality: z.string().optional(),
		layoutStability: z.string().optional(),
		requiresSignature: z.boolean(),
		requiresPhotos: z.boolean(),
		requiresGps: z.boolean(),
		requiresOffline: z.boolean(),
		status: DocumentTemplateStatusEnum,
		createdBy: z.string().optional(),
		updatedBy: z.string().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strip();

export const DocumentTemplateSchema = DocumentTemplateOutputDtoSchema;
export type DocumentTemplate = z.infer<typeof DocumentTemplateOutputDtoSchema>;

/**
 * Mongoose Document representation for DocumentTemplate.
 * Uses string types for API response format.
 */
export interface DocumentTemplateDocument<TID = string> {
	_id: TID;
	templateName: string;
	description?: string;
	serviceType?: string;
	businessUnit?: string;
	sourceType: DocumentTemplateSourceType;
	frequencyOfUse?: string;
	billingCriticality?: string;
	layoutStability?: string;
	requiresSignature: boolean;
	requiresPhotos: boolean;
	requiresGps: boolean;
	requiresOffline: boolean;
	status: DocumentTemplateStatus;
	createdBy?: TID;
	updatedBy?: TID;
	createdAt: string;
	updatedAt: string;
}
