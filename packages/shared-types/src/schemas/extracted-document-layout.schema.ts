/**
 * Extracted Document Layout Schema — Normalized extraction output
 *
 * Represents the structured output of an extraction job, normalized
 * across all adapters (SheetJS, PDF, sidecars, manual).
 *
 * Phase 1: Cross-cutting Document Ingestion Layer
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Bounding Box ──────────────────────────────────────────────────────────────

export const BoundingBoxSchema = z
	.object({
		x: z.number(),
		y: z.number(),
		width: z.number(),
		height: z.number(),
		page: z.number().int().min(0).optional(),
		sheet: z.string().optional(),
	})
	.strict();

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

// ─── Field Kind ────────────────────────────────────────────────────────────────

export const DetectedFieldKindSchema = z.enum([
	"text",
	"textarea",
	"number",
	"currency",
	"date",
	"datetime",
	"boolean",
	"select",
	"multi_select",
	"checkbox",
	"radio",
	"photo",
	"signature",
	"gps",
	"file",
	"table",
	"checklist",
	"calculated",
	"section",
	"repeatable_group",
	"evidence_block",
]);
export type DetectedFieldKind = z.infer<typeof DetectedFieldKindSchema>;

// ─── Validation Rule ───────────────────────────────────────────────────────────

export const ValidationRuleSchema = z
	.object({
		ruleType: z.enum(["min", "max", "minLength", "maxLength", "pattern", "required", "email"]),
		value: z.union([z.string(), z.number()]).optional(),
		message: z.string().optional(),
	})
	.strict();

export type ValidationRule = z.infer<typeof ValidationRuleSchema>;

// ─── Detected Field ────────────────────────────────────────────────────────────

export const DetectedFieldSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1).max(500),
		normalizedName: z.string().min(1).max(200),
		fieldKind: DetectedFieldKindSchema,
		required: z.boolean().default(false),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().min(0).optional(),
		sourceSheet: z.string().optional(),
		boundingBox: BoundingBoxSchema.optional(),
		options: z.array(z.string()).optional(),
		validationRules: z.array(ValidationRuleSchema).optional().default([]),
		helpText: z.string().max(1000).optional(),
	})
	.strict();

export type DetectedField = z.infer<typeof DetectedFieldSchema>;

// ─── Detected Table Column ─────────────────────────────────────────────────────

export const DetectedTableColumnSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1).max(200),
		fieldKind: DetectedFieldKindSchema,
		required: z.boolean().default(false),
		options: z.array(z.string()).optional(),
	})
	.strict();

export type DetectedTableColumn = z.infer<typeof DetectedTableColumnSchema>;

// ─── Detected Table ────────────────────────────────────────────────────────────

export const DetectedTableSchema = z
	.object({
		id: z.string().min(1),
		title: z.string().min(1).max(200),
		columns: z.array(DetectedTableColumnSchema).min(1),
		rowSamples: z.array(z.record(z.string(), z.string())).max(5).optional().default([]),
		sourcePage: z.number().int().min(0).optional(),
		sourceSheet: z.string().optional(),
		boundingBox: BoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();

export type DetectedTable = z.infer<typeof DetectedTableSchema>;

// ─── Detected Checkbox ───────────────────────────────────────────────────────────

export const DetectedCheckboxSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1).max(500),
		checkedByDefault: z.boolean().default(false),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().min(0).optional(),
		boundingBox: BoundingBoxSchema.optional(),
	})
	.strict();

export type DetectedCheckbox = z.infer<typeof DetectedCheckboxSchema>;

// ─── Detected Signature Area ─────────────────────────────────────────────────────

export const DetectedSignatureAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1).max(200),
		roleHint: z.string().max(100).optional(),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().min(0).optional(),
		boundingBox: BoundingBoxSchema.optional(),
	})
	.strict();

export type DetectedSignatureArea = z.infer<typeof DetectedSignatureAreaSchema>;

// ─── Detected Photo Area ─────────────────────────────────────────────────────────

export const DetectedPhotoAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1).max(200),
		description: z.string().max(500).optional(),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().min(0).optional(),
		boundingBox: BoundingBoxSchema.optional(),
	})
	.strict();

export type DetectedPhotoArea = z.infer<typeof DetectedPhotoAreaSchema>;

// ─── Detected GPS Area ───────────────────────────────────────────────────────────

export const DetectedGpsAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1).max(200),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().min(0).optional(),
		boundingBox: BoundingBoxSchema.optional(),
	})
	.strict();

export type DetectedGpsArea = z.infer<typeof DetectedGpsAreaSchema>;

// ─── Extracted Page (PDF) ────────────────────────────────────────────────────────

export const ExtractedPageSchema = z
	.object({
		pageIndex: z.number().int().min(0),
		pageNumber: z.number().int().min(1),
		width: z.number().optional(),
		height: z.number().optional(),
		rawText: z.string().max(50000).optional(),
	})
	.strict();

export type ExtractedPage = z.infer<typeof ExtractedPageSchema>;

// ─── Extracted Sheet (Excel) ─────────────────────────────────────────────────────

export const ExtractedSheetSchema = z
	.object({
		sheetIndex: z.number().int().min(0),
		sheetName: z.string().min(1),
		rowCount: z.number().int().min(0),
		colCount: z.number().int().min(0),
	})
	.strict();

export type ExtractedSheet = z.infer<typeof ExtractedSheetSchema>;

// ─── Extracted Block ─────────────────────────────────────────────────────────────

export const ExtractedBlockSchema = z
	.object({
		id: z.string().min(1),
		type: z.enum(["title", "subtitle", "header", "paragraph", "list", "unknown"]),
		text: z.string().max(5000),
		page: z.number().int().min(0).optional(),
		sheet: z.string().optional(),
		order: z.number().int().min(0),
	})
	.strict();

export type ExtractedBlock = z.infer<typeof ExtractedBlockSchema>;

// ─── Full Extracted Layout ───────────────────────────────────────────────────────

export const ExtractedDocumentLayoutSchema = z
	.object({
		_id: ObjectIdSchema,
		documentSourceFileId: ObjectIdSchema,
		extractionJobId: ObjectIdSchema,
		pages: z.array(ExtractedPageSchema).default([]),
		sheets: z.array(ExtractedSheetSchema).default([]),
		blocks: z.array(ExtractedBlockSchema).default([]),
		tables: z.array(DetectedTableSchema).default([]),
		detectedFields: z.array(DetectedFieldSchema).default([]),
		detectedCheckboxes: z.array(DetectedCheckboxSchema).default([]),
		detectedSignatures: z.array(DetectedSignatureAreaSchema).default([]),
		detectedPhotoAreas: z.array(DetectedPhotoAreaSchema).default([]),
		detectedGpsAreas: z.array(DetectedGpsAreaSchema).default([]),
		language: z.string().max(10).optional(),
		confidence: z.number().min(0).max(1).optional(),
		rawTextPreview: z.string().max(10000).optional(),
		normalizedMarkdown: z.string().max(50000).optional(),
		createdAt: z.string().datetime(),
	})
	.strict();

export type ExtractedDocumentLayout = z.infer<typeof ExtractedDocumentLayoutSchema>;
