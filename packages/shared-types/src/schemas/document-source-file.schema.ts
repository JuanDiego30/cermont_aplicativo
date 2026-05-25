/**
 * Document Source File Schema — Cross-cutting document ingestion entrypoint
 *
 * Represents the original file uploaded from any stage of the operational flow.
 * Evolves the legacy DocumentFile schema with linkedEntityType/linkedEntityId
 * and importStatus to support the unified ingestion pipeline.
 *
 * Phase 1: Cross-cutting Document Ingestion Layer
 */

import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

// ─── Source Kind ─────────────────────────────────────────────────────────────

export const DocumentSourceFileKindSchema = z.enum([
	"xlsx",
	"xls",
	"pdf",
	"docx",
	"image",
	"manual",
]);
export type DocumentSourceFileKind = z.infer<typeof DocumentSourceFileKindSchema>;

// ─── Linked Entity Type ──────────────────────────────────────────────────────

export const LinkedEntityTypeSchema = z.enum([
	"service_case",
	"work_request",
	"site_visit",
	"proposal",
	"work_order",
	"planning_packet",
	"execution_session",
	"technical_report",
	"delivery_record",
	"service_entry_sheet",
	"invoice",
	"asset",
	"maintenance_event",
	"template_library",
]);
export type LinkedEntityType = z.infer<typeof LinkedEntityTypeSchema>;

// ─── Scan Status ─────────────────────────────────────────────────────────────

export const DocumentSourceFileScanStatusSchema = z.enum([
	"pending",
	"clean",
	"infected",
	"failed",
	"skipped",
]);
export type DocumentSourceFileScanStatus = z.infer<typeof DocumentSourceFileScanStatusSchema>;

// ─── Import Status ────────────────────────────────────────────────────────────

export const DocumentSourceFileImportStatusSchema = z.enum([
	"not_started",
	"queued",
	"processing",
	"review_required",
	"approved",
	"rejected",
	"failed",
]);
export type DocumentSourceFileImportStatus = z.infer<typeof DocumentSourceFileImportStatusSchema>;

// ─── Create ──────────────────────────────────────────────────────────────────

export const CreateDocumentSourceFileSchema = z
	.object({
		originalName: z.string().min(1).max(255),
		mimeType: z.string().min(1).max(100),
		extension: z.string().min(1).max(20),
		sizeBytes: z.number().int().nonnegative(),
		hashSha256: z.string().min(1).max(128),
		storageKey: z.string().min(1).max(512),
		sourceKind: DocumentSourceFileKindSchema,
		linkedEntityType: LinkedEntityTypeSchema,
		linkedEntityId: ObjectIdSchema,
		scanStatus: DocumentSourceFileScanStatusSchema.default("pending"),
		importStatus: DocumentSourceFileImportStatusSchema.default("not_started"),
	})
	.strict();

export type CreateDocumentSourceFile = z.infer<typeof CreateDocumentSourceFileSchema>;

// ─── Update / Link ────────────────────────────────────────────────────────────

export const UpdateDocumentSourceFileSchema = z
	.object({
		linkedEntityType: LinkedEntityTypeSchema.optional(),
		linkedEntityId: ObjectIdSchema.optional(),
		scanStatus: DocumentSourceFileScanStatusSchema.optional(),
		importStatus: DocumentSourceFileImportStatusSchema.optional(),
		title: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
	})
	.strict();

export type UpdateDocumentSourceFile = z.infer<typeof UpdateDocumentSourceFileSchema>;

// ─── Archive ───────────────────────────────────────────────────────────────────

export const ArchiveDocumentSourceFileSchema = z
	.object({
		reason: z.string().min(1).max(1000),
	})
	.strict();

export type ArchiveDocumentSourceFile = z.infer<typeof ArchiveDocumentSourceFileSchema>;

// ─── Query ─────────────────────────────────────────────────────────────────────

export const DocumentSourceFileListQuerySchema = z
	.object({
		linkedEntityType: z.union([LinkedEntityTypeSchema, z.literal("")]).optional(),
		linkedEntityId: ObjectIdSchema.optional(),
		sourceKind: z.union([DocumentSourceFileKindSchema, z.literal("")]).optional(),
		scanStatus: z.union([DocumentSourceFileScanStatusSchema, z.literal("")]).optional(),
		importStatus: z.union([DocumentSourceFileImportStatusSchema, z.literal("")]).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();

export type DocumentSourceFileListQuery = z.infer<typeof DocumentSourceFileListQuerySchema>;

// ─── Full Record ─────────────────────────────────────────────────────────────

export const DocumentSourceFileSchema = z
	.object({
		_id: ObjectIdSchema,
		originalName: z.string(),
		mimeType: z.string(),
		extension: z.string(),
		sizeBytes: z.number().int().nonnegative(),
		hashSha256: z.string(),
		storageKey: z.string(),
		sourceKind: DocumentSourceFileKindSchema,
		uploadedBy: ObjectIdSchema,
		uploadedAt: z.string().datetime(),
		linkedEntityType: LinkedEntityTypeSchema,
		linkedEntityId: ObjectIdSchema,
		scanStatus: DocumentSourceFileScanStatusSchema,
		importStatus: DocumentSourceFileImportStatusSchema,
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
	})
	.strict();

export type DocumentSourceFile = z.infer<typeof DocumentSourceFileSchema>;

// ─── ID Params ─────────────────────────────────────────────────────────────────

export const DocumentSourceFileIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type DocumentSourceFileIdParams = z.infer<typeof DocumentSourceFileIdSchema>;
