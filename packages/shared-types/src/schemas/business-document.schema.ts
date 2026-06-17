/**
 * Business Document Schema — Zod validation for PDF/Excel business format digitization
 *
 * Phase 2: Document-Driven Template Engine
 * Each document type maps to a real PDF business format used in operations.
 */
import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const BusinessDocumentTypeEnum = z.enum([
	"work_planning",
	"cctv_maintenance",
	"lifeline_inspection",
	"sgsst_induction",
	"ladder_anchor_photo",
	"safety_control_hierarchy",
	"field_permit",
	"ast_safety_analysis",
]);

export type BusinessDocumentType = z.infer<typeof BusinessDocumentTypeEnum>;

export const DocumentFormatTypeEnum = z.enum(["pdf", "xlsx", "docx", "image", "hybrid"]);

export type DocumentFormatType = z.infer<typeof DocumentFormatTypeEnum>;

export const BusinessDocumentFieldMappingSchema = z.object({
	fieldName: z.string().min(1),
	fieldType: z.enum([
		"text",
		"number",
		"date",
		"signature",
		"photo",
		"checkbox",
		"select",
		"table",
		"textarea",
	]),
	xpath: z.string().optional(),
	required: z.boolean().default(false),
	validation: z.string().optional(),
});

export type BusinessDocumentFieldMapping = z.infer<typeof BusinessDocumentFieldMappingSchema>;

export const BusinessDocumentMetadataSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	businessUnit: z.array(z.string()).optional(),
	regulatoryBody: z.string().optional(),
});

export type BusinessDocumentMetadata = z.infer<typeof BusinessDocumentMetadataSchema>;

export const BusinessDocumentSchema = z.object({
	_id: ObjectIdSchema,
	documentType: BusinessDocumentTypeEnum,
	formatType: DocumentFormatTypeEnum,
	version: z.string(),
	sourceFile: z.string(),
	fieldMappings: z.array(BusinessDocumentFieldMappingSchema),
	metadata: BusinessDocumentMetadataSchema,
	lifecycleStatus: z.enum(["active", "deleted"]).default("active"),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

export type IBusinessDocument = z.infer<typeof BusinessDocumentSchema>;

export const CreateBusinessDocumentSchema = z.object({
	documentType: BusinessDocumentTypeEnum,
	formatType: DocumentFormatTypeEnum,
	version: z.string(),
	sourceFile: z.string(),
	fieldMappings: z.array(BusinessDocumentFieldMappingSchema).min(1),
	metadata: BusinessDocumentMetadataSchema,
});

export type CreateBusinessDocumentInput = z.infer<typeof CreateBusinessDocumentSchema>;

export const UpdateBusinessDocumentSchema = CreateBusinessDocumentSchema.partial();

export type UpdateBusinessDocumentInput = z.infer<typeof UpdateBusinessDocumentSchema>;

export const BusinessDocumentListQuerySchema = z.object({
	documentType: BusinessDocumentTypeEnum.optional(),
});

export type BusinessDocumentListQuery = z.infer<typeof BusinessDocumentListQuerySchema>;
