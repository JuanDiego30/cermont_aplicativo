/**
 * FileAsset Schema — Single Source of Truth for file/image metadata
 *
 * Every uploaded file in Cermont (kit images, tool images, evidence photos,
 * delivery record attachments, technical report attachments, signatures,
 * CCTV/life-line photos, planning attachments) is described by a
 * FileAssetRef.
 *
 * The actual binary is stored out-of-band (local disk in development,
 * S3/MinIO in production). This schema describes the metadata only.
 *
 * Reference: DOC-CANON-07 (Archivos, Evidencias y Almacenamiento)
 */

import { z } from "zod";

/**
 * Categories of files that can be uploaded. Use the most specific
 * category that applies; avoid generic "attachment" when a more
 * precise category exists.
 */
export const FileAssetCategory = z.enum([
	"kit_image",
	"tool_image",
	"vehicle_image",
	"equipment_image",
	"material_image",
	"safety_item_image",
	"evidence_photo",
	"before_photo",
	"after_photo",
	"signature_image",
	"signed_document",
	"delivery_record_attachment",
	"technical_report_attachment",
	"cctv_photo",
	"life_line_photo",
	"planning_attachment",
	"checklist_evidence",
	"report_cover",
]);
export type FileAssetCategory = z.infer<typeof FileAssetCategory>;

/**
 * Sync status for offline-first support. Persisted file refs use the
 * canonical three-state contract: pending while queued locally, synced
 * after backend persistence, and failed after retry exhaustion.
 */
export const FileAssetSyncStatus = z.enum(["synced", "pending", "failed"]);
export type FileAssetSyncStatus = z.infer<typeof FileAssetSyncStatus>;

export const FileAssetKind = z.enum(["image", "document"]);
export type FileAssetKind = z.infer<typeof FileAssetKind>;

export const FileAssetSource = z.enum(["upload", "offline_sync", "generated", "import"]);
export type FileAssetSource = z.infer<typeof FileAssetSource>;

export const FileAssetStatus = z.enum(["active", "quarantined", "failed"]);
export type FileAssetStatus = z.infer<typeof FileAssetStatus>;

export const FileAssetMetadataSchema = z.record(
	z.string().min(1).max(80),
	z.union([z.string().max(500), z.number(), z.boolean()]),
);
export type FileAssetMetadata = z.infer<typeof FileAssetMetadataSchema>;

/**
 * Entity types that can own a FileAsset. Mirrors the Mongoose model
 * names in the backend. Keep in sync with backend/src/models/.
 */
export const FileAssetEntityType = z.enum([
	"kit",
	"tool",
	"vehicle",
	"equipment",
	"material",
	"safety_item",
	"evidence",
	"delivery_record",
	"technical_report",
	"planning",
	"document",
	"checklist_item",
	"checklist_execution",
	"work_order",
	"service_case",
	"execution_session",
	"report",
]);
export type FileAssetEntityType = z.infer<typeof FileAssetEntityType>;

/**
 * FileAssetRef — the metadata contract for a stored file.
 *
 * This is what gets embedded in Kit, Tool, Evidence, DeliveryRecord,
 * and TechnicalRecord documents. The full FileAsset document (stored
 * in the `file_assets` Mongo collection) extends this with `_id`,
 * `createdAt`, and `updatedAt`.
 */
export const FileAssetRefSchema = z.object({
	id: z.string().min(1),
	originalName: z.string().min(1).max(255),
	storedName: z.string().min(1).max(255),
	mimeType: z.string().min(1).max(127),
	sizeBytes: z.number().int().nonnegative(),
	url: z.string().min(1),
	thumbnailUrl: z.string().min(1).optional(),
	storageKey: z.string().min(1),
	checksum: z.string().min(1).optional(),
	width: z.number().int().positive().optional(),
	height: z.number().int().positive().optional(),
	uploadedBy: z.string().min(1),
	uploadedAt: z.string().datetime(),
	entityType: FileAssetEntityType,
	entityId: z.string().min(1),
	category: FileAssetCategory,
	description: z.string().max(500).optional(),
	tags: z.array(z.string().min(1).max(50)).max(20).optional(),
	offlineLocalId: z.string().min(1).optional(),
	syncStatus: FileAssetSyncStatus.optional(),
	kind: FileAssetKind.optional(),
	source: FileAssetSource.optional(),
	status: FileAssetStatus.optional(),
	isPrimary: z.boolean().optional(),
	metadata: FileAssetMetadataSchema.optional(),
});
export type FileAssetRef = z.infer<typeof FileAssetRefSchema>;

/**
 * Input schema for uploading a new file. Omits server-generated fields
 * (id, storedName, storageKey, url, uploadedBy, uploadedAt) which are
 * filled in by the backend after the file is persisted.
 */
export const FileAssetUploadInputSchema = z.object({
	category: FileAssetCategory,
	entityType: FileAssetEntityType,
	entityId: z.string().min(1),
	description: z.string().max(500).optional(),
	tags: z.array(z.string().min(1).max(50)).max(20).optional(),
	offlineLocalId: z.string().min(1).optional(),
	kind: FileAssetKind.optional(),
	source: FileAssetSource.optional(),
	isPrimary: z.boolean().optional(),
	metadata: FileAssetMetadataSchema.optional(),
});
export type FileAssetUploadInput = z.infer<typeof FileAssetUploadInputSchema>;

/**
 * Response from POST /api/files/upload — the canonical envelope shape
 * used by the backend.
 */
export const FileAssetUploadResponseSchema = z.object({
	success: z.literal(true),
	data: FileAssetRefSchema,
});
export type FileAssetUploadResponse = z.infer<typeof FileAssetUploadResponseSchema>;

/**
 * Form-input variant of {@link FileAssetUploadInputSchema} for use as a
 * route-level `validateBody` middleware on `POST /api/files/upload`.
 *
 * The canonical schema expects `tags: z.array(z.string())`, but multipart
 * form data sends a single string when one value is posted and a
 * string array when several are posted. This schema:
 *  1. Accepts `tags` as `string | string[] | undefined`
 *  2. Coerces a single string to a one-element array
 *  3. Re-validates the resulting array against the canonical per-element
 *     and max-length constraints so contract guarantees are preserved
 *     before the controller runs.
 */
const FileAssetTagsFormFieldSchema = z
	.union([z.string(), z.array(z.string())])
	.optional()
	.transform((value) => {
		if (value === undefined) {
			return undefined;
		}
		return Array.isArray(value) ? value : [value];
	})
	.pipe(z.array(z.string().min(1).max(50)).max(20).optional());

export const FileAssetUploadInputFormSchema = z.object({
	category: FileAssetCategory,
	entityType: FileAssetEntityType,
	entityId: z.string().min(1),
	description: z.string().max(500).optional(),
	tags: FileAssetTagsFormFieldSchema,
	offlineLocalId: z.string().min(1).optional(),
	kind: FileAssetKind.optional(),
	source: FileAssetSource.optional(),
	isPrimary: z
		.union([z.boolean(), z.enum(["true", "false"])])
		.optional()
		.transform((value) => value === true || value === "true"),
	metadata: z
		.string()
		.optional()
		.transform((value, context) => {
			if (!value) {
				return {};
			}
			try {
				return FileAssetMetadataSchema.parse(JSON.parse(value));
			} catch {
				context.addIssue({
					code: "custom",
					message: "metadata must be a valid scalar JSON object",
				});
				return z.NEVER;
			}
		}),
});
export type FileAssetUploadInputForm = z.infer<typeof FileAssetUploadInputFormSchema>;

export const FileAssetListQuerySchema = z.object({
	entityType: FileAssetEntityType,
	entityId: z.string().min(1),
	category: FileAssetCategory.optional(),
	includeDeleted: z
		.enum(["true", "false"])
		.default("false")
		.transform((value) => value === "true"),
});
export type FileAssetListQuery = z.infer<typeof FileAssetListQuerySchema>;

/**
 * Internal service-layer result returned by the backend's `createFileAssetFromUpload`.
 * Wraps the canonical `FileAssetRef` (already contract-validated) with the
 * on-disk filename and public URL the backend generated. Lives in shared-types
 * so the contract guard can detect accidental duplication in the service layer.
 */
export const CreateFileAssetResultSchema = z.object({
	ref: FileAssetRefSchema,
	storedFilename: z.string().min(1).max(255),
	publicUrl: z.string().min(1).max(2048),
});
export type CreateFileAssetResult = z.infer<typeof CreateFileAssetResultSchema>;

/**
 * Allowed MIME types for upload. Enforced by the backend multipart
 * parser; the frontend must not offer file pickers that allow other
 * types.
 */
export const ALLOWED_FILE_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"application/pdf",
] as const;
export type AllowedFileMimeType = (typeof ALLOWED_FILE_MIME_TYPES)[number];

/**
 * Convenience helpers for the most common categories. Use these
 * instead of string literals at call sites to keep the category
 * taxonomy in one place.
 */
export const FileAssetCategoryPresets = {
	kit: "kit_image" as const,
	tool: "tool_image" as const,
	vehicle: "vehicle_image" as const,
	equipment: "equipment_image" as const,
	material: "material_image" as const,
	safetyItem: "safety_item_image" as const,
	evidence: "evidence_photo" as const,
	before: "before_photo" as const,
	after: "after_photo" as const,
	signature: "signature_image" as const,
	signedDocument: "signed_document" as const,
	delivery: "delivery_record_attachment" as const,
	report: "technical_report_attachment" as const,
	planning: "planning_attachment" as const,
	checklist: "checklist_evidence" as const,
};
