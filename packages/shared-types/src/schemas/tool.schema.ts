/**
 * Tool Schema — Zod validation for tool, equipment, and resource management
 *
 * Extended with image/galley support for tools, equipment, and materials.
 * Maps to backend model: backend/src/models/Tool.ts
 * Reference: DOC-09 Section Diccionario de Datos
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";
import { FileAssetRefSchema } from "./file-asset.schema";

export const ToolStatusEnum = z.enum([
	"available",
	"assigned",
	"maintenance",
	"expired",
	"inactive",
]);
export type ToolStatus = z.infer<typeof ToolStatusEnum>;

export const ToolCertificationTypeEnum = z.enum([
	"calibration",
	"inspection",
	"safety",
	"training",
	"license",
	"other",
]);
export type ToolCertificationType = z.infer<typeof ToolCertificationTypeEnum>;

export const ToolCertificationStatusEnum = z.enum(["valid", "expired", "pending", "revoked"]);
export type ToolCertificationStatus = z.infer<typeof ToolCertificationStatusEnum>;

export const ToolDocumentSchema = z
	.object({
		documentId: z.string().min(1),
		name: z.string().min(1).max(200),
		type: z.string().min(1).max(100),
		fileId: ObjectIdSchema.optional(),
		url: z.string().url().optional(),
		mimeType: z.string().max(100).optional(),
		size: z.number().int().nonnegative().optional(),
		uploadedAt: z.string().datetime().optional(),
	})
	.strict();
export type ToolDocument = z.infer<typeof ToolDocumentSchema>;

export const ToolEvidenceRequirementSchema = z
	.object({
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
		stage: z.string().max(100).optional(),
		component: z.string().max(200).optional(),
	})
	.strict();
export type ToolEvidenceRequirement = z.infer<typeof ToolEvidenceRequirementSchema>;

export const ToolCertificationSchema = z
	.object({
		certificationId: z.string().min(1),
		type: ToolCertificationTypeEnum,
		name: z.string().min(1).max(200),
		issuedAt: z.string().datetime(),
		expiresAt: z.string().datetime(),
		status: ToolCertificationStatusEnum,
		issuer: z.string().max(200).optional(),
		documentId: ObjectIdSchema.optional(),
	})
	.strict();
export type ToolCertification = z.infer<typeof ToolCertificationSchema>;

export const ToolSchema = z
	.object({
		_id: ObjectIdSchema,
		name: z.string().min(1).max(200),
		type: z.literal("tool"),
		status: ToolStatusEnum,
		description: z.string().optional(),
		serialNumber: z.string().optional(),
		brand: z.string().optional(),
		modelName: z.string().optional(),
		category: z.string().optional(),
		image: FileAssetRefSchema.optional(),
		gallery: z.array(FileAssetRefSchema).default([]),
		certifications: z.array(ToolCertificationSchema).default([]),
		documents: z.array(ToolDocumentSchema).default([]),
		evidenceRequirements: z.array(ToolEvidenceRequirementSchema).default([]),
		dynamicForms: z.array(ObjectIdSchema).default([]),
		createdBy: ObjectIdSchema.optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type Tool = z.infer<typeof ToolSchema>;

export const CreateToolSchema = z
	.object({
		name: z.string().min(1).max(200),
		category: z.string().max(100).optional(),
		description: z.string().max(1000).optional(),
		serialNumber: z.string().max(200).optional(),
		brand: z.string().max(100).optional(),
		modelName: z.string().max(100).optional(),
		status: ToolStatusEnum.optional(),
		documents: z.array(ToolDocumentSchema.omit({ documentId: true, uploadedAt: true })).default([]),
		certifications: z
			.array(
				ToolCertificationSchema.omit({
					certificationId: true,
				}),
			)
			.default([]),
		evidenceRequirements: z.array(ToolEvidenceRequirementSchema).default([]),
		dynamicForms: z.array(ObjectIdSchema).default([]),
	})
	.strict();
export type CreateToolInput = z.infer<typeof CreateToolSchema>;

export const UpdateToolSchema = CreateToolSchema.partial();
export type UpdateToolInput = z.infer<typeof UpdateToolSchema>;

export const AddToolCertificationSchema = z
	.object({
		type: ToolCertificationTypeEnum,
		name: z.string().min(1).max(200),
		issuedAt: z.string().datetime(),
		expiresAt: z.string().datetime(),
		status: ToolCertificationStatusEnum.optional(),
		issuer: z.string().max(200).optional(),
		documentId: ObjectIdSchema.optional(),
	})
	.strict();
export type AddToolCertificationInput = z.infer<typeof AddToolCertificationSchema>;

export const AddToolDocumentSchema = z
	.object({
		name: z.string().min(1).max(200),
		type: z.string().min(1).max(100),
		fileId: ObjectIdSchema.optional(),
		url: z.string().url().optional(),
	})
	.strict();
export type AddToolDocumentInput = z.infer<typeof AddToolDocumentSchema>;

export const ToolIdParamsSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();
export type ToolIdParams = z.infer<typeof ToolIdParamsSchema>;

export const ToolCertificationParamsSchema = z
	.object({
		id: ObjectIdSchema,
		certId: z.string().min(1),
	})
	.strict();
export type ToolCertificationParams = z.infer<typeof ToolCertificationParamsSchema>;

export const ToolDocumentParamsSchema = z
	.object({
		id: ObjectIdSchema,
		docId: z.string().min(1),
	})
	.strict();
export type ToolDocumentParams = z.infer<typeof ToolDocumentParamsSchema>;

export const RecordCalibrationSchema = z
	.object({
		calibratedAt: z.string().datetime(),
		nextCalibrationAt: z.string().datetime(),
		certificateId: ObjectIdSchema.optional(),
		issuer: z.string().max(200).optional(),
		notes: z.string().max(500).optional(),
	})
	.strict();
export type RecordCalibrationInput = z.infer<typeof RecordCalibrationSchema>;

export const ToolUsageSchema = z
	.object({
		orderId: ObjectIdSchema,
		orderCode: z.string().max(100).optional(),
		usedBy: ObjectIdSchema.optional(),
	})
	.strict();
export type ToolUsageInput = z.infer<typeof ToolUsageSchema>;

export const CalibrationsDueQuerySchema = z
	.object({
		daysAhead: z.coerce.number().int().min(1).max(365).default(30),
	})
	.strict();
export type CalibrationsDueQuery = z.infer<typeof CalibrationsDueQuerySchema>;

export const ToolListQuerySchema = z
	.object({
		status: ToolStatusEnum.optional(),
		category: z.string().optional(),
		brand: z.string().optional(),
		search: z.string().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();
export type ToolListQuery = z.infer<typeof ToolListQuerySchema>;
