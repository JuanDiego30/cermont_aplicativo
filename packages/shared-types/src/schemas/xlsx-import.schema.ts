/**
 * XLSX Import Schemas
 * Phase 4: Excel-First Template Import
 */

import { z } from "zod";

// Enums
export const XlsxImportStatusEnum = z.enum([
	"uploaded",
	"analyzing",
	"analyzed",
	"mapping",
	"mapped",
	"creating_template",
	"template_created",
	"failed",
]);

export const XlsxCellTypeEnum = z.enum([
	"empty",
	"string",
	"number",
	"boolean",
	"date",
	"formula",
	"merged",
	"header",
	"label",
	"value",
]);

export const XlsxRegionTypeEnum = z.enum([
	"title",
	"subtitle",
	"header_section",
	"data_table",
	"checklist",
	"signature_area",
	"photo_area",
	"notes",
	"metadata",
	"unknown",
]);

export const XlsxFieldConfidenceEnum = z.enum(["high", "medium", "low"]);

// Sub-schemas
export const XlsxCellAddressSchema = z.object({
	row: z.number().int().nonnegative(),
	col: z.number().int().nonnegative(),
});

export const XlsxCellRangeSchema = z.object({
	start: XlsxCellAddressSchema,
	end: XlsxCellAddressSchema,
});

export const XlsxCellSchema = z.object({
	address: z.string(), // e.g., "A1", "B2"
	row: z.number().int().nonnegative(),
	col: z.number().int().nonnegative(),
	type: XlsxCellTypeEnum,
	value: z.union([z.string(), z.number(), z.boolean(), z.date(), z.null()]),
	formula: z.string().optional(),
	merged: z.boolean().default(false),
	mergeRange: XlsxCellRangeSchema.optional(),
	style: z
		.object({
			bold: z.boolean().optional(),
			italic: z.boolean().optional(),
			underline: z.boolean().optional(),
			fontSize: z.number().optional(),
			backgroundColor: z.string().optional(),
			foregroundColor: z.string().optional(),
			border: z.boolean().optional(),
			alignment: z.enum(["left", "center", "right"]).optional(),
		})
		.optional(),
});

export const XlsxSheetInfoSchema = z.object({
	name: z.string(),
	index: z.number().int().nonnegative(),
	rowCount: z.number().int().nonnegative(),
	colCount: z.number().int().nonnegative(),
	hasMergedCells: z.boolean().default(false),
});

export const XlsxCellRegionSchema = z.object({
	id: z.string(),
	name: z.string(),
	type: XlsxRegionTypeEnum,
	range: XlsxCellRangeSchema,
	confidence: XlsxFieldConfidenceEnum,
	cells: z.array(XlsxCellSchema),
	detectedFields: z.array(z.string()).optional(), // IDs of detected fields
});

export const XlsxDetectedTableSchema = z.object({
	id: z.string(),
	name: z.string(),
	range: XlsxCellRangeSchema,
	headers: z.array(
		z.object({
			col: z.number().int(),
			name: z.string(),
			confidence: XlsxFieldConfidenceEnum,
		}),
	),
	rows: z.number().int().nonnegative(),
	hasTotalsRow: z.boolean().default(false),
	isRepeating: z.boolean().default(false), // Can have multiple entries
	confidence: XlsxFieldConfidenceEnum,
});

export const XlsxDetectedFieldSchema = z.object({
	id: z.string(),
	name: z.string(),
	label: z.string(),
	labelCell: XlsxCellAddressSchema,
	valueCell: XlsxCellAddressSchema,
	fieldType: z.enum([
		"text",
		"number",
		"date",
		"checkbox",
		"select",
		"multiselect",
		"calculated",
		"photo",
		"signature",
	]),
	required: z.boolean().default(false),
	confidence: XlsxFieldConfidenceEnum,
	proposedTemplateField: z
		.object({
			key: z.string(),
			label: z.string(),
			type: z.string(),
			validation: z.record(z.string(), z.unknown()).optional(),
		})
		.optional(),
});

export const XlsxSheetMapSchema = z.object({
	sheetIndex: z.number().int().nonnegative(),
	sheetName: z.string(),
	selected: z.boolean().default(false),
	regions: z.array(XlsxCellRegionSchema).default([]),
	tables: z.array(XlsxDetectedTableSchema).default([]),
	fields: z.array(XlsxDetectedFieldSchema).default([]),
});

export const XlsxFieldMappingSchema = z.object({
	fieldId: z.string(),
	templateFieldKey: z.string(),
	confirmed: z.boolean().default(false),
	manualAdjustment: z.boolean().default(false),
	notes: z.string().optional(),
});

// Main schemas
export const XlsxWorkbookImportIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const CreateXlsxWorkbookImportSchema = z.object({
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	notes: z.string().optional(),
});

export const UpdateXlsxWorkbookImportSchema = z.object({
	status: XlsxImportStatusEnum.optional(),
	selectedSheetIndex: z.number().int().nonnegative().optional(),
	sheetMaps: z.array(XlsxSheetMapSchema).optional(),
	fieldMappings: z.array(XlsxFieldMappingSchema).optional(),
	analysisResult: z.record(z.string(), z.unknown()).optional(),
	errorMessage: z.string().optional(),
	notes: z.string().optional(),
});

export const XlsxWorkbookImportSchema = z.object({
	_id: XlsxWorkbookImportIdSchema,
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	createdTemplateVersionId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
	status: XlsxImportStatusEnum,
	sheets: z.array(XlsxSheetInfoSchema).default([]),
	selectedSheetIndex: z.number().int().nonnegative().optional(),
	sheetMaps: z.array(XlsxSheetMapSchema).default([]),
	fieldMappings: z.array(XlsxFieldMappingSchema).default([]),
	analysisResult: z.record(z.string(), z.unknown()).optional(),
	confidence: z
		.object({
			overall: XlsxFieldConfidenceEnum,
			fields: z.number().int().min(0).max(100),
			tables: z.number().int().min(0).max(100),
			regions: z.number().int().min(0).max(100),
		})
		.optional(),
	errorMessage: z.string().optional(),
	createdBy: z.string().regex(/^[a-f\d]{24}$/i),
	updatedBy: z.string().regex(/^[a-f\d]{24}$/i),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});

// API request/response schemas
export const AnalyzeXlsxRequestSchema = z.object({
	documentFileId: z.string().regex(/^[a-f\d]{24}$/i),
	templateId: z
		.string()
		.regex(/^[a-f\d]{24}$/i)
		.optional(),
});

export const AnalyzeXlsxResponseSchema = z.object({
	success: z.boolean(),
	importId: XlsxWorkbookImportIdSchema,
	status: XlsxImportStatusEnum,
	sheets: z.array(XlsxSheetInfoSchema),
	selectedSheetIndex: z.number().int().nonnegative().optional(),
	sheetMaps: z.array(XlsxSheetMapSchema),
	confidence: z
		.object({
			overall: XlsxFieldConfidenceEnum,
			fields: z.number().int().min(0).max(100),
			tables: z.number().int().min(0).max(100),
			regions: z.number().int().min(0).max(100),
		})
		.optional(),
});

export const UpdateXlsxMappingRequestSchema = z.object({
	selectedSheetIndex: z.number().int().nonnegative(),
	fieldMappings: z.array(XlsxFieldMappingSchema),
	confirmed: z.boolean().default(false),
});

export const CreateTemplateVersionFromXlsxRequestSchema = z.object({
	confirmed: z.boolean(),
	versionNotes: z.string().optional(),
});

// Types
export type XlsxImportStatus = z.infer<typeof XlsxImportStatusEnum>;
export type XlsxCellType = z.infer<typeof XlsxCellTypeEnum>;
export type XlsxRegionType = z.infer<typeof XlsxRegionTypeEnum>;
export type XlsxFieldConfidence = z.infer<typeof XlsxFieldConfidenceEnum>;
export type XlsxCellAddress = z.infer<typeof XlsxCellAddressSchema>;
export type XlsxCellRange = z.infer<typeof XlsxCellRangeSchema>;
export type XlsxCell = z.infer<typeof XlsxCellSchema>;
export type XlsxSheetInfo = z.infer<typeof XlsxSheetInfoSchema>;
export type XlsxCellRegion = z.infer<typeof XlsxCellRegionSchema>;
export type XlsxDetectedTable = z.infer<typeof XlsxDetectedTableSchema>;
export type XlsxDetectedField = z.infer<typeof XlsxDetectedFieldSchema>;
export type XlsxSheetMap = z.infer<typeof XlsxSheetMapSchema>;
export type XlsxFieldMapping = z.infer<typeof XlsxFieldMappingSchema>;
export type XlsxWorkbookImport = z.infer<typeof XlsxWorkbookImportSchema>;
export type CreateXlsxWorkbookImport = z.infer<typeof CreateXlsxWorkbookImportSchema>;
export type UpdateXlsxWorkbookImport = z.infer<typeof UpdateXlsxWorkbookImportSchema>;
export type AnalyzeXlsxRequest = z.infer<typeof AnalyzeXlsxRequestSchema>;
export type AnalyzeXlsxResponse = z.infer<typeof AnalyzeXlsxResponseSchema>;
export type UpdateXlsxMappingRequest = z.infer<typeof UpdateXlsxMappingRequestSchema>;
export type CreateTemplateVersionFromXlsxRequest = z.infer<
	typeof CreateTemplateVersionFromXlsxRequestSchema
>;
