/**
 * Document File Schema — Zod validation for uploaded document assets
 *
 * Phase 3: Document Files Management
 * SSOT for document file metadata, scan status and template linkage.
 */

import { z } from "zod";
import { type MongooseDocument, ObjectIdSchema } from "./common.schema";

export const DocumentFileKindSchema = z.enum(["xlsx", "xls", "pdf", "image", "manual"]);
export type DocumentFileKind = z.infer<typeof DocumentFileKindSchema>;

export const DocumentFileScanStatusSchema = z.enum([
	"pending",
	"scanning",
	"scanned",
	"failed",
	"quarantined",
]);
export type DocumentFileScanStatus = z.infer<typeof DocumentFileScanStatusSchema>;

export const DocumentFileIdSchema = z
	.object({
		id: ObjectIdSchema,
	})
	.strict();

export type DocumentFileId = z.infer<typeof DocumentFileIdSchema>;

export const DocumentFileListQuerySchema = z
	.object({
		templateId: z.union([ObjectIdSchema, z.literal("")]).optional(),
		scanStatus: z.union([DocumentFileScanStatusSchema, z.literal("")]).optional(),
		kind: z.union([DocumentFileKindSchema, z.literal("")]).optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(20),
	})
	.strict();

export type DocumentFileListQuery = z.infer<typeof DocumentFileListQuerySchema>;

export const CreateDocumentFileSchema = z
	.object({
		templateId: ObjectIdSchema.optional(),
		kind: DocumentFileKindSchema,
		title: z.string().min(1).max(200),
		description: z.string().max(2000).optional(),
		originalName: z.string().min(1).max(255),
		mimeType: z.string().min(1).max(100),
		sizeBytes: z.number().int().nonnegative(),
		hash: z.string().min(1).max(128),
		storageKey: z.string().min(1).max(512),
		scanStatus: DocumentFileScanStatusSchema.default("pending"),
	})
	.strict();

export type CreateDocumentFile = z.infer<typeof CreateDocumentFileSchema>;

export const UpdateDocumentFileSchema = z
	.object({
		title: z.string().min(1).max(200).optional(),
		description: z.string().max(2000).optional(),
		templateId: ObjectIdSchema.optional(),
		scanStatus: DocumentFileScanStatusSchema.optional(),
		mimetypeOverride: z.string().min(1).max(100).optional(),
	})
	.strict();

export type UpdateDocumentFile = z.infer<typeof UpdateDocumentFileSchema>;

export const DocumentFileSchema = z
	.object({
		_id: ObjectIdSchema,
		templateId: ObjectIdSchema.optional(),
		kind: DocumentFileKindSchema,
		title: z.string(),
		description: z.string().optional(),
		originalName: z.string(),
		mimeType: z.string(),
		sizeBytes: z.number().int().nonnegative(),
		hash: z.string(),
		storageKey: z.string(),
		scanStatus: DocumentFileScanStatusSchema,
		scanNotes: z.string().optional(),
		downloadUrl: z.string().optional(),
		createdAt: z.string().datetime(),
		updatedAt: z.string().datetime(),
		createdBy: ObjectIdSchema,
		updatedBy: ObjectIdSchema,
	})
	.strict();

export type DocumentFile = z.infer<typeof DocumentFileSchema>;

export interface DocumentFileDocument<TID = string> extends MongooseDocument<TID> {
	templateId?: TID;
	kind: DocumentFileKind;
	title: string;
	description?: string;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	hash: string;
	storageKey: string;
	scanStatus: DocumentFileScanStatus;
	scanNotes?: string;
	createdBy: TID;
	updatedBy: TID;
}
