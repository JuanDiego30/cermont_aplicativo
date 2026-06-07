import { Schema, type Types } from "mongoose";

/**
 * FileAssetRef — reusable Mongoose sub-schema for embedding file references.
 *
 * This is the Mongoose counterpart of `FileAssetRefSchema` in
 * `@cermont/shared-types/schemas/file-asset.schema.ts`. Use this sub-schema
 * whenever a parent document (Kit, Tool, Evidence, DeliveryRecord,
 * TechnicalReport, MaintenanceKit, Resource, etc.) needs to reference one or
 * more uploaded files.
 *
 * The full file metadata lives in the `file_assets` Mongo collection
 * (see `backend/src/models/FileAsset.ts`). This sub-schema is a lightweight
 * denormalized copy used for fast parent-document reads without a join.
 *
 * KEEP IN SYNC with `@cermont/shared-types` `FileAssetRefSchema`. The shared
 * contract is the SSOT; the Mongoose sub-schema mirrors its shape.
 *
 * Reference: DOC-CANON-07 (Archivos, Evidencias y Almacenamiento)
 */

export const FILE_ASSET_ENTITY_TYPES = [
	"kit",
	"tool",
	"equipment",
	"material",
	"safety_item",
	"evidence",
	"delivery_record",
	"technical_report",
	"planning",
	"checklist_item",
	"work_order",
	"execution_session",
] as const;

export const FILE_ASSET_CATEGORIES = [
	"kit_image",
	"tool_image",
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
] as const;

export const FILE_ASSET_SYNC_STATUSES = ["synced", "pending", "failed"] as const;

export interface FileAssetRef {
	id: string;
	originalName: string;
	storedName: string;
	mimeType: string;
	sizeBytes: number;
	url: string;
	thumbnailUrl?: string;
	storageKey: string;
	checksum?: string;
	width?: number;
	height?: number;
	uploadedBy: string;
	uploadedAt: string;
	entityType: (typeof FILE_ASSET_ENTITY_TYPES)[number];
	entityId: string;
	category: (typeof FILE_ASSET_CATEGORIES)[number];
	description?: string;
	tags?: string[];
	offlineLocalId?: string;
	syncStatus?: (typeof FILE_ASSET_SYNC_STATUSES)[number];
}

export const FileAssetRefSchema = new Schema<FileAssetRef>(
	{
		id: { type: String, required: true, maxlength: 64 },
		originalName: { type: String, required: true, maxlength: 255 },
		storedName: { type: String, required: true, maxlength: 255 },
		mimeType: { type: String, required: true, maxlength: 127 },
		sizeBytes: { type: Number, required: true, min: 0 },
		url: { type: String, required: true, maxlength: 2048 },
		thumbnailUrl: { type: String, maxlength: 2048 },
		storageKey: { type: String, required: true, maxlength: 512 },
		checksum: { type: String, maxlength: 128 },
		width: { type: Number, min: 1 },
		height: { type: Number, min: 1 },
		uploadedBy: { type: String, required: true, maxlength: 64 },
		uploadedAt: { type: String, required: true },
		entityType: {
			type: String,
			enum: FILE_ASSET_ENTITY_TYPES,
			required: true,
		},
		entityId: { type: String, required: true, maxlength: 64 },
		category: {
			type: String,
			enum: FILE_ASSET_CATEGORIES,
			required: true,
		},
		description: { type: String, maxlength: 500 },
		tags: { type: [String], default: undefined },
		offlineLocalId: { type: String, maxlength: 128 },
		syncStatus: {
			type: String,
			enum: FILE_ASSET_SYNC_STATUSES,
		},
	},
	{ _id: false },
);

export type FileAssetRefDocument = Types.Subdocument & FileAssetRef;
