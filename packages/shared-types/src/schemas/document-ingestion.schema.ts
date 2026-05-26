import { z } from "zod";
import { ALL_AUTHENTICATED_ROLES } from "../rbac";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { TemplateFieldTypeEnum } from "./document-template-version.schema";
import {
	type TemplateDraft as SharedTemplateDraft,
	type TemplateDraftExportHint as SharedTemplateDraftExportHint,
	TemplateDraftExportHintSchema as SharedTemplateDraftExportHintSchema,
	type TemplateDraftField as SharedTemplateDraftField,
	TemplateDraftFieldSchema as SharedTemplateDraftFieldSchema,
	type TemplateDraftRule as SharedTemplateDraftRule,
	TemplateDraftRuleSchema as SharedTemplateDraftRuleSchema,
	TemplateDraftSchema as SharedTemplateDraftSchema,
	type TemplateDraftSection as SharedTemplateDraftSection,
	TemplateDraftSectionSchema as SharedTemplateDraftSectionSchema,
	type TemplateDraftTable as SharedTemplateDraftTable,
	TemplateDraftTableSchema as SharedTemplateDraftTableSchema,
} from "./template-draft.schema";

export const DocumentSourceKindSchema = z.enum(["xlsx", "xls", "pdf", "docx", "image", "manual"]);
export type DocumentSourceKind = z.infer<typeof DocumentSourceKindSchema>;

export const DocumentSourceExtensionSchema = z.enum([
	".xlsx",
	".xls",
	".pdf",
	".docx",
	".png",
	".jpg",
	".jpeg",
	".webp",
	".heic",
	".heif",
	".tif",
	".tiff",
	".manual",
]);
export type DocumentSourceExtension = z.infer<typeof DocumentSourceExtensionSchema>;

export const DocumentPurposeSchema = z.enum([
	"library",
	"template_source",
	"closing_evidence",
	"support_document",
]);
export type DocumentPurpose = z.infer<typeof DocumentPurposeSchema>;

export const DocumentIngestionModeSchema = z.enum([
	"library",
	"convert_to_template",
	"closing_evidence",
	"support_document",
]);
export type DocumentIngestionMode = z.infer<typeof DocumentIngestionModeSchema>;

export const ClosingEvidenceKindSchema = z.enum([
	"acta_delivery",
	"client_signature",
	"ses_filing",
	"ses_approval",
	"invoice_sent",
	"invoice_approval",
	"payment_support",
	"other_support",
]);
export type ClosingEvidenceKind = z.infer<typeof ClosingEvidenceKindSchema>;

export const DocumentLinkedEntityTypeSchema = z.enum([
	"service_case",
	"work_request",
	"site_visit",
	"proposal",
	"purchase_order",
	"work_order",
	"planning_packet",
	"execution_session",
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"payment",
	"asset",
	"maintenance_event",
	"template_library",
	"order",
	"planning",
	"execution",
	"report",
	"ses",
	"maintenance",
]);
export type DocumentLinkedEntityType = z.infer<typeof DocumentLinkedEntityTypeSchema>;

export const DocumentScanStatusSchema = z.enum([
	"pending",
	"clean",
	"infected",
	"failed",
	"skipped",
]);
export type DocumentScanStatus = z.infer<typeof DocumentScanStatusSchema>;

export const DocumentImportStatusSchema = z.enum([
	"not_started",
	"queued",
	"processing",
	"review_required",
	"approved",
	"rejected",
	"failed",
]);
export type DocumentImportStatus = z.infer<typeof DocumentImportStatusSchema>;

export const DocumentExtractionAdapterSchema = z.enum([
	"sheetjs",
	"pdf_basic",
	"docling_sidecar",
	"paddleocr_sidecar",
	"unstructured_sidecar",
	"manual",
]);
export type DocumentExtractionAdapter = z.infer<typeof DocumentExtractionAdapterSchema>;

export const DocumentExtractionJobStatusSchema = z.enum([
	"queued",
	"processing",
	"completed",
	"failed",
	"cancelled",
]);
export type DocumentExtractionJobStatus = z.infer<typeof DocumentExtractionJobStatusSchema>;

export const TemplateStageSchema = z.enum([
	"work_request",
	"site_visit",
	"proposal",
	"purchase_order",
	"planning",
	"execution",
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"payment",
	"asset",
	"maintenance",
]);
export type TemplateStage = z.infer<typeof TemplateStageSchema>;

export const TemplateDraftStatusSchema = z.enum([
	"draft",
	"review_required",
	"approved",
	"rejected",
	"converted_to_template",
]);
export type TemplateDraftStatus = z.infer<typeof TemplateDraftStatusSchema>;

export const TemplateResponseOfflineStateSchema = z.enum([
	"online",
	"offline_draft",
	"queued",
	"syncing",
	"synced",
	"sync_failed",
	"conflict",
]);
export type TemplateResponseOfflineState = z.infer<typeof TemplateResponseOfflineStateSchema>;

export const TemplateResponseSyncStateSchema = z.enum([
	"idle",
	"queued",
	"syncing",
	"synced",
	"failed",
	"conflict",
]);
export type TemplateResponseSyncState = z.infer<typeof TemplateResponseSyncStateSchema>;

export const TemplateResponseValidationStateSchema = z.enum([
	"draft",
	"pending",
	"submitted",
	"approved",
	"rejected",
	"blocked",
]);
export type TemplateResponseValidationState = z.infer<typeof TemplateResponseValidationStateSchema>;

export const TemplateStageAllowedRoleSchema = z.enum(ALL_AUTHENTICATED_ROLES);
export type TemplateStageAllowedRole = z.infer<typeof TemplateStageAllowedRoleSchema>;

export const DocumentBoundingBoxSchema = z
	.object({
		x: z.number().nonnegative(),
		y: z.number().nonnegative(),
		width: z.number().nonnegative(),
		height: z.number().nonnegative(),
		page: z.number().int().nonnegative().optional(),
		sheet: z.string().min(1).optional(),
	})
	.strict();
export type DocumentBoundingBox = z.infer<typeof DocumentBoundingBoxSchema>;

export const DocumentOptionSchema = z
	.object({
		value: z.string().min(1),
		label: z.string().min(1),
		isDefault: z.boolean().default(false),
	})
	.strict();
export type DocumentOption = z.infer<typeof DocumentOptionSchema>;

export const DocumentValidationRuleSchema = z
	.object({
		kind: z.enum([
			"required_if",
			"min_length",
			"max_length",
			"min_value",
			"max_value",
			"pattern",
			"custom",
		]),
		value: z.string().min(1).optional(),
		message: z.string().min(1).optional(),
	})
	.strict();
export type DocumentValidationRule = z.infer<typeof DocumentValidationRuleSchema>;

export const DetectedFieldSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1),
		normalizedName: z.string().min(1),
		fieldKind: TemplateFieldTypeEnum,
		required: z.boolean().default(false),
		confidence: z.number().min(0).max(1),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		options: z.array(DocumentOptionSchema).default([]),
		validationRules: z.array(DocumentValidationRuleSchema).default([]),
		helpText: z.string().max(1000).optional(),
	})
	.strict();
export type DetectedField = z.infer<typeof DetectedFieldSchema>;

export const DetectedTableColumnSchema = z
	.object({
		id: z.string().min(1),
		name: z.string().min(1),
		normalizedName: z.string().min(1),
		order: z.number().int().nonnegative(),
	})
	.strict();
export type DetectedTableColumn = z.infer<typeof DetectedTableColumnSchema>;

export const DetectedTableSchema = z
	.object({
		id: z.string().min(1),
		title: z.string().min(1),
		columns: z.array(DetectedTableColumnSchema).min(1),
		rowSamples: z.array(z.array(z.string())).default([]),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DetectedTable = z.infer<typeof DetectedTableSchema>;

export const DocumentDetectedCheckboxSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
		checkedByDefault: z.boolean().default(false),
	})
	.strict();
export type DocumentDetectedCheckbox = z.infer<typeof DocumentDetectedCheckboxSchema>;

export const DocumentDetectedSignatureAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentDetectedSignatureArea = z.infer<typeof DocumentDetectedSignatureAreaSchema>;

export const DocumentDetectedPhotoAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentDetectedPhotoArea = z.infer<typeof DocumentDetectedPhotoAreaSchema>;

export const DocumentDetectedGpsAreaSchema = z
	.object({
		id: z.string().min(1),
		label: z.string().min(1),
		sourcePage: z.number().int().nonnegative().optional(),
		sourceSheet: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentDetectedGpsArea = z.infer<typeof DocumentDetectedGpsAreaSchema>;

export const DocumentLayoutPageSchema = z
	.object({
		pageNumber: z.number().int().nonnegative(),
		width: z.number().nonnegative(),
		height: z.number().nonnegative(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentLayoutPage = z.infer<typeof DocumentLayoutPageSchema>;

export const DocumentLayoutSheetSchema = z
	.object({
		sheetIndex: z.number().int().nonnegative(),
		sheetName: z.string().min(1),
		rowCount: z.number().int().nonnegative(),
		columnCount: z.number().int().nonnegative(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentLayoutSheet = z.infer<typeof DocumentLayoutSheetSchema>;

export const DocumentLayoutBlockSchema = z
	.object({
		id: z.string().min(1),
		type: z.enum(["text", "heading", "table", "checkbox", "signature", "photo", "gps", "note"]),
		text: z.string().min(1),
		pageNumber: z.number().int().nonnegative().optional(),
		sheetName: z.string().min(1).optional(),
		boundingBox: DocumentBoundingBoxSchema.optional(),
		confidence: z.number().min(0).max(1),
	})
	.strict();
export type DocumentLayoutBlock = z.infer<typeof DocumentLayoutBlockSchema>;

export const ExtractedDocumentLayoutSchema = z
	.object({
		id: ObjectIdSchema,
		documentSourceFileId: ObjectIdSchema,
		extractionJobId: ObjectIdSchema,
		pages: z.array(DocumentLayoutPageSchema).default([]),
		sheets: z.array(DocumentLayoutSheetSchema).default([]),
		blocks: z.array(DocumentLayoutBlockSchema).default([]),
		tables: z.array(DetectedTableSchema).default([]),
		detectedFields: z.array(DetectedFieldSchema).default([]),
		detectedCheckboxes: z.array(DocumentDetectedCheckboxSchema).default([]),
		detectedSignatures: z.array(DocumentDetectedSignatureAreaSchema).default([]),
		detectedPhotoAreas: z.array(DocumentDetectedPhotoAreaSchema).default([]),
		detectedGpsAreas: z.array(DocumentDetectedGpsAreaSchema).default([]),
		language: z.string().min(2).max(20),
		confidence: z.number().min(0).max(1),
		rawTextPreview: z.string().max(10000),
		normalizedMarkdown: z.string().max(50000),
		createdAt: z.string().datetime(),
	})
	.strict();
export type ExtractedDocumentLayout = z.infer<typeof ExtractedDocumentLayoutSchema>;

export const DocumentSourceFileSchema = z
	.object({
		id: ObjectIdSchema,
		originalName: z.string().min(1).max(255),
		mimeType: z.string().min(1).max(100),
		extension: DocumentSourceExtensionSchema,
		sizeBytes: z.number().int().nonnegative(),
		hashSha256: z.string().regex(/^[a-f0-9]{64}$/i),
		storageKey: z.string().min(1).max(512),
		sourceKind: DocumentSourceKindSchema,
		uploadedBy: ObjectIdSchema,
		uploadedAt: z.string().datetime(),
		linkedEntityType: DocumentLinkedEntityTypeSchema,
		linkedEntityId: ObjectIdSchema,
		scanStatus: DocumentScanStatusSchema,
		importStatus: DocumentImportStatusSchema,
		documentPurpose: DocumentPurposeSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type DocumentSourceFile = z.infer<typeof DocumentSourceFileSchema>;

export const DocumentExtractionJobSchema = z
	.object({
		id: ObjectIdSchema,
		documentSourceFileId: ObjectIdSchema,
		adapter: DocumentExtractionAdapterSchema,
		status: DocumentExtractionJobStatusSchema,
		startedAt: z.string().datetime().optional(),
		finishedAt: z.string().datetime().optional(),
		errorCode: z.string().min(1).optional(),
		errorMessage: z.string().max(5000).optional(),
		retryCount: z.number().int().nonnegative(),
		confidence: z.number().min(0).max(1).optional(),
		requiresHumanReview: z.boolean(),
		createdBy: ObjectIdSchema,
	})
	.strict();
export type DocumentExtractionJob = z.infer<typeof DocumentExtractionJobSchema>;

export const TemplateDraftSectionSchema = SharedTemplateDraftSectionSchema;
export type TemplateDraftSection = SharedTemplateDraftSection;

export const TemplateDraftFieldSchema = SharedTemplateDraftFieldSchema;
export type TemplateDraftField = SharedTemplateDraftField;

export const TemplateDraftTableSchema = SharedTemplateDraftTableSchema;
export type TemplateDraftTable = SharedTemplateDraftTable;

export const TemplateDraftRuleSchema = SharedTemplateDraftRuleSchema;
export type TemplateDraftRule = SharedTemplateDraftRule;

export const TemplateExportHintSchema = SharedTemplateDraftExportHintSchema;
export type TemplateExportHint = SharedTemplateDraftExportHint;

export const TemplateDraftSchema = SharedTemplateDraftSchema;
export type TemplateDraft = SharedTemplateDraft;

export const TemplateStageRequirementSchema = z
	.object({
		id: ObjectIdSchema,
		serviceType: z.string().min(1),
		stage: TemplateStageSchema,
		templateVersionId: ObjectIdSchema,
		required: z.boolean(),
		blocksTransition: z.boolean(),
		allowedRoles: z.array(TemplateStageAllowedRoleSchema).default([]),
		offlineRequired: z.boolean(),
		evidenceRequired: z.boolean(),
		signatureRequired: z.boolean(),
		gpsRequired: z.boolean(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();
export type TemplateStageRequirement = z.infer<typeof TemplateStageRequirementSchema>;

// ─── API Request Schemas ──────────────────────────────────────────────────────

export const IngestDocumentRequestSchema = z
	.object({
		purpose: DocumentPurposeSchema,
		mode: DocumentIngestionModeSchema.optional(),
		targetStepCode: CermontOperationalStepCodeSchema.optional(),
		closingEvidenceKind: ClosingEvidenceKindSchema.optional(),
		linkedEntityType: DocumentLinkedEntityTypeSchema.optional(),
		linkedEntityId: z.string().min(1).optional(),
		adapter: DocumentExtractionAdapterSchema.optional(),
	})
	.strict();

export type IngestDocumentRequest = z.infer<typeof IngestDocumentRequestSchema>;

export const BulkClosingEvidenceRequestSchema = z
	.object({
		documentIds: z.array(z.string().min(1)),
		serviceCaseId: z.string().min(1).optional(),
	})
	.strict();

export type BulkClosingEvidenceRequest = z.infer<typeof BulkClosingEvidenceRequestSchema>;

export * from "./document-extraction-job.schema";
// ─── Sub-schema Re-exports ───────────────────────────────────────────────────
export * from "./document-source-file.schema";
export * from "./document-template.schema";
export * from "./document-template-version.schema";
export * from "./extracted-document-layout.schema";
export * from "./template-draft.schema";
export * from "./template-stage-requirement.schema";
