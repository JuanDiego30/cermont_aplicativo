import { type Document, model, Schema, type Types } from "mongoose";

import {
	FILE_ASSET_CATEGORIES,
	FILE_ASSET_ENTITY_TYPES,
	FILE_ASSET_KINDS,
	FILE_ASSET_SOURCES,
	FILE_ASSET_STATUSES,
	FILE_ASSET_SYNC_STATUSES,
} from "./sub-schemas/FileAssetRefSchema";

/**
 * FileAsset Mongoose Model
 *
 * Canonical storage for file/image metadata in Cermont.
 *
 * Every uploaded file (kit images, tool images, evidence photos, delivery
 * record attachments, technical report attachments, signatures, CCTV photos,
 * life-line photos, planning attachments, checklist evidence, report covers)
 * is described by a FileAsset document.
 *
 * The actual binary is stored out-of-band (local disk in development,
 * S3/MinIO in production). This collection stores the metadata + a pointer
 * to the storage location (`storageKey` + `url`).
 *
 * Maps to `@cermont/shared-types/schemas/file-asset.schema.ts` →
 * `FileAssetRefSchema` (the embedded shape, without `_id`/timestamps).
 *
 * Reference: DOC-CANON-07 (Archivos, Evidencias y Almacenamiento)
 */

export interface IFileAssetDocument extends Document {
	_id: Types.ObjectId;
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
	uploadedBy: Types.ObjectId;
	uploadedByName?: string;
	uploadedAt: Date;
	entityType: (typeof FILE_ASSET_ENTITY_TYPES)[number];
	entityId: Types.ObjectId;
	category: (typeof FILE_ASSET_CATEGORIES)[number];
	description?: string;
	tags?: string[];
	offlineLocalId?: string;
	syncStatus: (typeof FILE_ASSET_SYNC_STATUSES)[number];
	kind: (typeof FILE_ASSET_KINDS)[number];
	source: (typeof FILE_ASSET_SOURCES)[number];
	status: (typeof FILE_ASSET_STATUSES)[number];
	isPrimary: boolean;
	metadata: Map<string, string | number | boolean> | Record<string, string | number | boolean>;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const FileAssetSchema = new Schema<IFileAssetDocument>(
	{
		id: { type: String, required: true, unique: true, index: true, maxlength: 64 },
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
		uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		uploadedByName: { type: String, maxlength: 200 },
		uploadedAt: { type: Date, required: true, default: () => new Date() },
		entityType: {
			type: String,
			enum: FILE_ASSET_ENTITY_TYPES,
			required: true,
			index: true,
		},
		entityId: {
			type: Schema.Types.ObjectId,
			required: true,
			index: true,
		},
		category: {
			type: String,
			enum: FILE_ASSET_CATEGORIES,
			required: true,
			index: true,
		},
		description: { type: String, maxlength: 500 },
		tags: { type: [String] },
		offlineLocalId: { type: String, maxlength: 128, index: true, sparse: true },
		syncStatus: {
			type: String,
			enum: FILE_ASSET_SYNC_STATUSES,
			default: "synced",
			index: true,
		},
		kind: { type: String, enum: FILE_ASSET_KINDS, required: true },
		source: { type: String, enum: FILE_ASSET_SOURCES, required: true },
		status: { type: String, enum: FILE_ASSET_STATUSES, default: "active", required: true },
		isPrimary: { type: Boolean, default: false, required: true },
		metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
		deletedAt: { type: Date, index: true },
	},
	{ timestamps: true, versionKey: false },
);

// Compound indexes for common query patterns
FileAssetSchema.index({ entityType: 1, entityId: 1, deletedAt: 1 });
FileAssetSchema.index({ entityType: 1, entityId: 1, category: 1 });
FileAssetSchema.index({ uploadedBy: 1, createdAt: -1 });
FileAssetSchema.index({ offlineLocalId: 1 }, { sparse: true });

FileAssetSchema.set("toJSON", {
	transform: (_doc, ret) => {
		const { __v, ...obj } = ret;
		return obj;
	},
});

export const FileAsset = model<IFileAssetDocument>("FileAsset", FileAssetSchema);
