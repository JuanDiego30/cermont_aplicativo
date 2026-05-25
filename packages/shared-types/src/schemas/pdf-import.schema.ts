/**
 * PDF Import Schemas
 * Phase 5: PDF Legacy Template Import
 */

import { z } from "zod";

// Enums
export const PdfImportStatusEnum = z.enum([
	"uploaded",
	"extracting",
	"analyzing",
	"analyzed",
	"mapping",
	"mapped",
	"creating_template",
	"template_created",
	"failed",
]);

export const PdfTextBlockTypeEnum = z.enum(["text", "heading", "label", "value", "placeholder"]);

export const PdfFieldConfidenceEnum = z.enum(["high", "medium", "low"]);

// Sub-schemas
export const PdfBoundingBoxSchema = z.object({
	x: z.number(),
	y: z.number(),
	width: z.number(),
	height: z.number(),
	page: z.number().int().nonnegative(),
});

export const PdfTextBlockSchema = z.object({
	id: z.string(),
	text: z.string(),
	type: PdfTextBlockTypeEnum,
	bbox: PdfBoundingBoxSchema,
	fontSize: z.number().optional(),
	fontFamily: z.string().optional(),
	isBold: z.boolean().default(false),
	isItalic: z.boolean().default(false),
	confidence: z.number().min(0).max(100),
});

export const PdfDetectedCheckboxSchema = z.object({
	id: z.string(),
	bbox: PdfBoundingBoxSchema,
	label: z.string(),
	labelBlockId: z.string(),
	confidence: PdfFieldConfidenceEnum,
	checkedByDefault: z.boolean().default(false),
});

export const PdfDetectedTableCellSchema = z.object({
	row: z.number().int(),
	col: z.number().int(),
	bbox: PdfBoundingBoxSchema,
	text: z.string(),
	isHeader: z.boolean().default(false),
});

export const PdfDetectedTableSchema = z.object({
	id: z.string(),
	name: z.string(),
	bbox: PdfBoundingBoxSchema,
	cells: z.array(PdfDetectedTableCellSchema),
	rows: z.number().int(),
	cols: z.number().int(),
	confidence: PdfFieldConfidenceEnum,
});

export const PdfDetectedImageRegionSchema = z.object({
	id: z.string(),
	type: z.enum(["photo_placeholder", "signature_placeholder", "logo", "unknown"]),
	bbox: PdfBoundingBoxSchema,
	description: z.string().optional(),
	confidence: PdfFieldConfidenceEnum,
});

export const PdfDetectedFieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	label: z.string(),
	labelBlockId: z.string(),
	valueBlockId: z.string().optional(),
	bbox: PdfBoundingBoxSchema,
	fieldType: z.enum([
		"text",
		"number",
		"date",
		"checkbox",
		"select",
		"multiselect",
		"photo",
		"signature",
		"calculated",
	]),
	required: z.boolean().default(false),
	confidence: PdfFieldConfidenceEnum,
	proposedTemplateField: z
		.object({
			key: z.string(),
			label: z.string(),
			type: z.string(),
			validation: z.record(z.string(), z.unknown()).optional(),
		})
		.optional(),
});

export const PdfPageMapSchema = z.object({
	pageIndex: z.number().int().nonnegative(),
	pageNumber: z.number().int().positive(),
	width: z.number(),
	height: z.number(),
	textBlocks: z.array(PdfTextBlockSchema).default([]),
	detectedFields: z.array(PdfDetectedFieldSchema).default([]),
	detectedCheckboxes: z.array(PdfDetectedCheckboxSchema).default([]),
	detectedTables: z.array(PdfDetectedTableSchema).default([]),
	imageRegions: z.array(PdfDetectedImageRegionSchema).default([]),
});

export const PdfFieldMappingSchema = z.object({
	fieldId: z.string(),
	templateFieldKey: z.string(),
	confirmed: z.boolean().default(false),
	manualAdjustment: z.boolean().default(false),
	notes: z.string().optional(),
});

// Main schemas
export const PdfDocumentImportIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const CreatePdfDocumentImportSchema = z.object({
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	ocrRequired: z.boolean().default(false),
	ocrEngine: z.enum(["tesseract", "google_vision", "azure_form", "manual"]).optional(),
	notes: z.string().optional(),
});

export const UpdatePdfDocumentImportSchema = z.object({
	status: PdfImportStatusEnum.optional(),
	pageMaps: z.array(PdfPageMapSchema).optional(),
	fieldMappings: z.array(PdfFieldMappingSchema).optional(),
	analysisResult: z.record(z.string(), z.unknown()).optional(),
	errorMessage: z.string().optional(),
	notes: z.string().optional(),
});

export const PdfDocumentImportSchema = z.object({
	_id: PdfDocumentImportIdSchema,
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	createdTemplateVersionId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	status: PdfImportStatusEnum,
	pageCount: z.number().int().nonnegative().default(0),
	pageMaps: z.array(PdfPageMapSchema).default([]),
	fieldMappings: z.array(PdfFieldMappingSchema).default([]),
	ocrRequired: z.boolean().default(false),
	ocrEngine: z.enum(["tesseract", "google_vision", "azure_form", "manual"]).optional(),
	ocrResult: z.record(z.string(), z.unknown()).optional(),
	analysisResult: z.record(z.string(), z.unknown()).optional(),
	confidence: z
		.object({
			overall: PdfFieldConfidenceEnum,
			fields: z.number().int().min(0).max(100),
			tables: z.number().int().min(0).max(100),
			checkboxes: z.number().int().min(0).max(100),
			images: z.number().int().min(0).max(100),
		})
		.optional(),
	errorMessage: z.string().optional(),
	createdBy: z.string().regex(/^[a-f\d]{24}$/i),
	updatedBy: z.string().regex(/^[a-f\d]{24}$/i),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// API request/response schemas
export const AnalyzePdfRequestSchema = z.object({
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	ocrRequired: z.boolean().default(false),
});

export const AnalyzePdfResponseSchema = z.object({
	success: z.boolean(),
	importId: PdfDocumentImportIdSchema,
	status: PdfImportStatusEnum,
	pageCount: z.number().int(),
	pageMaps: z.array(PdfPageMapSchema),
	ocrRequired: z.boolean(),
	ocrEngine: z.enum(["tesseract", "google_vision", "azure_form", "manual"]).optional(),
	confidence: z
		.object({
			overall: PdfFieldConfidenceEnum,
			fields: z.number().int().min(0).max(100),
			tables: z.number().int().min(0).max(100),
			checkboxes: z.number().int().min(0).max(100),
			images: z.number().int().min(0).max(100),
		})
		.optional(),
});

export const UpdatePdfMappingRequestSchema = z.object({
	fieldMappings: z.array(PdfFieldMappingSchema),
	confirmed: z.boolean().default(false),
});

export const CreateTemplateVersionFromPdfRequestSchema = z.object({
	confirmed: z.boolean(),
	versionNotes: z.string().optional(),
});

// Types
export type PdfImportStatus = z.infer<typeof PdfImportStatusEnum>;
export type PdfTextBlockType = z.infer<typeof PdfTextBlockTypeEnum>;
export type PdfFieldConfidence = z.infer<typeof PdfFieldConfidenceEnum>;
export type PdfBoundingBox = z.infer<typeof PdfBoundingBoxSchema>;
export type PdfTextBlock = z.infer<typeof PdfTextBlockSchema>;
export type PdfDetectedCheckbox = z.infer<typeof PdfDetectedCheckboxSchema>;
export type PdfDetectedTableCell = z.infer<typeof PdfDetectedTableCellSchema>;
export type PdfDetectedTable = z.infer<typeof PdfDetectedTableSchema>;
export type PdfDetectedImageRegion = z.infer<typeof PdfDetectedImageRegionSchema>;
export type PdfDetectedField = z.infer<typeof PdfDetectedFieldSchema>;
export type PdfPageMap = z.infer<typeof PdfPageMapSchema>;
export type PdfFieldMapping = z.infer<typeof PdfFieldMappingSchema>;
export type PdfDocumentImport = z.infer<typeof PdfDocumentImportSchema>;
export type CreatePdfDocumentImport = z.infer<typeof CreatePdfDocumentImportSchema>;
export type UpdatePdfDocumentImport = z.infer<typeof UpdatePdfDocumentImportSchema>;
export type AnalyzePdfRequest = z.infer<typeof AnalyzePdfRequestSchema>;
export type AnalyzePdfResponse = z.infer<typeof AnalyzePdfResponseSchema>;
export type UpdatePdfMappingRequest = z.infer<typeof UpdatePdfMappingRequestSchema>;
export type CreateTemplateVersionFromPdfRequest = z.infer<
	typeof CreateTemplateVersionFromPdfRequestSchema
>;
