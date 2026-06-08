/**
 * Files Service — Business Logic Layer
 *
 * Manages FileAsset lifecycle:
 *  - createFromUpload: persist FileAsset metadata + append ref to parent document
 *  - getById: fetch single FileAsset (soft-delete aware)
 *  - listByEntity: list FileAssets owned by a specific entity
 *  - softDelete: mark deletedAt + remove ref from parent document
 *
 * The actual binary is written to disk by `processUploadedFile` middleware
 * (multer memoryStorage → sharp → fs.writeFile). This service only owns
 * the metadata (FileAsset) and the parent-document linkage.
 *
 * Maps to `@cermont/shared-types/schemas/file-asset.schema.ts`.
 */

import crypto from "node:crypto";
import path from "node:path";
import type { CreateFileAssetResult as CreateFileAssetOutcome } from "@cermont/shared-types";
import {
	ALLOWED_FILE_MIME_TYPES,
	type FileAssetCategory,
	type FileAssetEntityType,
	type FileAssetRef,
	FileAssetRefSchema,
	type FileAssetUploadInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import { BadRequestError, NotFoundError, UnprocessableError } from "../../common/errors/AppError";
import { createLogger } from "../../common/utils/logger";
import { env } from "../../config/env";
import { DeliveryRecord } from "../../models/DeliveryRecord";
import { Evidence } from "../../models/Evidence";
import { FileAsset, type IFileAssetDocument } from "../../models/FileAsset";
import { Kit } from "../../models/Kit";
import { Resource } from "../../models/Resource";
import { TechnicalReport } from "../../models/TechnicalReport";
import { createAuditLog } from "../audit/audit.service";

const log = createLogger("files-service");

// ─── Public DTOs ──────────────────────────────────────────────────────────────
//
// The create-file-asset outcome is exported from `@cermont/shared-types` as the
// SSOT contract for the service-layer return value of
// `createFileAssetFromUpload`. The input DTO below is the internal alias
// of the canonical `FileAssetUploadInput` (kept as a service-level alias
// for readability at call sites that are far from the route boundary).

export type CreateFileAssetInput = FileAssetUploadInput;

export interface ListFileAssetsQuery {
	entityType: FileAssetEntityType;
	entityId: string;
	category?: FileAssetCategory;
	includeDeleted?: boolean;
}

interface FileAssetListFilter {
	entityType: FileAssetEntityType;
	entityId: Types.ObjectId;
	deletedAt?: null;
	category?: FileAssetCategory;
}

// ─── Parent-document registry ─────────────────────────────────────────────────
//
// Maps each FileAssetEntityType to the Mongoose model that owns the
// `fileAssets: FileAssetRef[]` array. The service uses this map to:
//   1. Verify the parent document exists before persisting the FileAsset
//   2. Append the new ref to the parent document's `fileAssets` array
//   3. Remove the ref from the parent document on soft delete
//
// Keep in sync with `FileAssetEntityType` in @cermont/shared-types.

type ParentModel = {
	existsById: (id: Types.ObjectId) => Promise<boolean>;
	appendFileAsset: (id: Types.ObjectId, ref: FileAssetRef) => Promise<void>;
	removeFileAsset: (id: Types.ObjectId, fileAssetId: string) => Promise<void>;
};

function createParentModel(
	existsById: ParentModel["existsById"],
	appendFileAsset: ParentModel["appendFileAsset"],
	removeFileAsset: ParentModel["removeFileAsset"],
): ParentModel {
	return { existsById, appendFileAsset, removeFileAsset };
}

const resourceParentModel = createParentModel(
	async (id) => Boolean(await Resource.exists({ _id: id })),
	async (id, ref) => {
		await Resource.updateOne({ _id: id }, { $push: { fileAssets: ref } });
	},
	async (id, fileAssetId) => {
		await Resource.updateOne({ _id: id }, { $pull: { fileAssets: { id: fileAssetId } } });
	},
);

const PARENT_MODELS: Partial<Record<FileAssetEntityType, ParentModel>> = {
	kit: createParentModel(
		async (id) => Boolean(await Kit.exists({ _id: id })),
		async (id, ref) => {
			await Kit.updateOne({ _id: id }, { $push: { fileAssets: ref } });
		},
		async (id, fileAssetId) => {
			await Kit.updateOne({ _id: id }, { $pull: { fileAssets: { id: fileAssetId } } });
		},
	),
	tool: resourceParentModel,
	equipment: resourceParentModel,
	material: resourceParentModel,
	safety_item: resourceParentModel,
	evidence: createParentModel(
		async (id) => Boolean(await Evidence.exists({ _id: id })),
		async (id, ref) => {
			await Evidence.updateOne({ _id: id }, { $push: { fileAssets: ref } });
		},
		async (id, fileAssetId) => {
			await Evidence.updateOne({ _id: id }, { $pull: { fileAssets: { id: fileAssetId } } });
		},
	),
	delivery_record: createParentModel(
		async (id) => Boolean(await DeliveryRecord.exists({ _id: id })),
		async (id, ref) => {
			await DeliveryRecord.updateOne({ _id: id }, { $push: { fileAssets: ref } });
		},
		async (id, fileAssetId) => {
			await DeliveryRecord.updateOne({ _id: id }, { $pull: { fileAssets: { id: fileAssetId } } });
		},
	),
	technical_report: createParentModel(
		async (id) => Boolean(await TechnicalReport.exists({ _id: id })),
		async (id, ref) => {
			await TechnicalReport.updateOne({ _id: id }, { $push: { fileAssets: ref } });
		},
		async (id, fileAssetId) => {
			await TechnicalReport.updateOne({ _id: id }, { $pull: { fileAssets: { id: fileAssetId } } });
		},
	),
};

function getParentModel(entityType: FileAssetEntityType): ParentModel {
	const model = PARENT_MODELS[entityType];
	if (!model) {
		throw new BadRequestError(
			`File uploads for entity type '${entityType}' are not supported yet`,
			"ENTITY_TYPE_NOT_SUPPORTED",
		);
	}
	return model;
}

// ─── Validation helpers ──────────────────────────────────────────────────────

function isAllowedMime(mime: string): boolean {
	return (ALLOWED_FILE_MIME_TYPES as readonly string[]).includes(mime);
}

function toFileAssetRef(doc: IFileAssetDocument): FileAssetRef {
	return {
		id: doc.id,
		originalName: doc.originalName,
		storedName: doc.storedName,
		mimeType: doc.mimeType,
		sizeBytes: doc.sizeBytes,
		url: buildFileAssetContentUrl(doc.id),
		thumbnailUrl: doc.thumbnailUrl,
		storageKey: doc.storageKey,
		checksum: doc.checksum,
		width: doc.width,
		height: doc.height,
		uploadedBy: String(doc.uploadedBy),
		uploadedAt: doc.uploadedAt.toISOString(),
		entityType: doc.entityType,
		entityId: String(doc.entityId),
		category: doc.category,
		description: doc.description,
		tags: doc.tags,
		offlineLocalId: doc.offlineLocalId,
		syncStatus: doc.syncStatus,
	};
}

function buildFileAssetContentUrl(fileId: string): string {
	return `/api/files/${fileId}/content`;
}

function validateUploadedFile(file: Express.Multer.File): void {
	if (!file) {
		throw new BadRequestError("File is required", "FILE_REQUIRED");
	}

	if (!isAllowedMime(file.mimetype)) {
		throw new BadRequestError(
			`Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_FILE_MIME_TYPES.join(", ")}`,
			"INVALID_FILE_TYPE",
		);
	}
}

function validateFileAssetRef(ref: FileAssetRef, context: string): FileAssetRef {
	const refParse = FileAssetRefSchema.safeParse(ref);
	if (!refParse.success) {
		throw new UnprocessableError(
			`${context} file asset ref failed contract validation: ${refParse.error.message}`,
			"CONTRACT_VALIDATION_FAILED",
		);
	}

	return refParse.data;
}

async function findExistingOfflineUpload(
	offlineLocalId?: string,
): Promise<CreateFileAssetOutcome | false> {
	if (!offlineLocalId) {
		return false;
	}

	const existing = await FileAsset.findOne({
		offlineLocalId,
		deletedAt: null,
	});
	if (!existing) {
		return false;
	}

	const existingRef = validateFileAssetRef(toFileAssetRef(existing), "Existing");
	return {
		ref: existingRef,
		storedFilename: existing.storedName,
		publicUrl: existing.url,
	};
}

async function resolveParentDocument(input: CreateFileAssetInput): Promise<{
	parentModel: ParentModel;
	parentId: Types.ObjectId;
}> {
	if (!Types.ObjectId.isValid(input.entityId)) {
		throw new BadRequestError(
			`Invalid entityId: '${input.entityId}' is not a valid ObjectId`,
			"INVALID_ENTITY_ID",
		);
	}

	const parentModel = getParentModel(input.entityType);
	const parentId = new Types.ObjectId(input.entityId);
	const parentExists = await parentModel.existsById(parentId);
	if (!parentExists) {
		throw new NotFoundError(input.entityType, input.entityId);
	}

	return { parentModel, parentId };
}

async function readImageDimensions(file: Express.Multer.File): Promise<{
	width?: number;
	height?: number;
}> {
	if (!file.mimetype.startsWith("image/")) {
		return {};
	}

	try {
		const sharpMod = await import("sharp");
		const sharp = (sharpMod.default ?? sharpMod) as (buf: Buffer) => {
			metadata: () => Promise<{ width?: number; height?: number }>;
		};
		const meta = await sharp(file.buffer).metadata();
		return { width: meta.width, height: meta.height };
	} catch (error) {
		log.warn("Failed to read image dimensions", {
			error: error instanceof Error ? error.message : String(error),
			file: file.originalname,
		});
		return {};
	}
}

// ─── Service operations ──────────────────────────────────────────────────────

/**
 * Persist a FileAsset document and append its ref to the parent document.
 *
 * `file` is the Express.Multer.File object produced by `processUploadedFile`
 * middleware (multer memoryStorage + sharp processing + on-disk write).
 * The middleware also sets `file.storedPath` and `file.filename` to the
 * secure random name and absolute on-disk path.
 */
export async function createFileAssetFromUpload(
	input: CreateFileAssetInput,
	file: Express.Multer.File,
	userId: string,
	userName?: string,
): Promise<CreateFileAssetOutcome> {
	validateUploadedFile(file);

	const existingUpload = await findExistingOfflineUpload(input.offlineLocalId);
	if (existingUpload) {
		return existingUpload;
	}

	const { parentModel, parentId } = await resolveParentDocument(input);

	const id = crypto.randomUUID();
	const storedName = file.filename ?? path.basename(file.path ?? "");
	const publicUrl = buildFileAssetContentUrl(id);

	const { width, height } = await readImageDimensions(file);

	// Compute SHA-256 checksum for tamper detection
	const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");

	const fileAssetDoc = await FileAsset.create({
		id,
		originalName: file.originalname,
		storedName,
		mimeType: file.mimetype,
		sizeBytes: file.size,
		url: publicUrl,
		storageKey: storedName,
		checksum,
		width,
		height,
		uploadedBy: new Types.ObjectId(userId),
		uploadedByName: userName,
		uploadedAt: new Date(),
		entityType: input.entityType,
		entityId: new Types.ObjectId(input.entityId),
		category: input.category,
		description: input.description,
		tags: input.tags,
		offlineLocalId: input.offlineLocalId,
		syncStatus: "synced",
		deletedAt: null,
	});

	// Append a denormalized ref to the parent document
	const ref = toFileAssetRef(fileAssetDoc);
	let validatedRef: FileAssetRef;
	try {
		validatedRef = validateFileAssetRef(ref, "Generated");
	} catch (error) {
		// Rollback the FileAsset we just created
		await FileAsset.deleteOne({ _id: fileAssetDoc._id });
		throw error;
	}

	await parentModel.appendFileAsset(parentId, validatedRef);

	await createAuditLog({
		action: "FILE_ASSET_UPLOADED",
		entity: "FileAsset",
		userId,
		entityId: fileAssetDoc.id,
		metadata: {
			entityType: input.entityType,
			parentId: input.entityId,
			category: input.category,
			mimeType: file.mimetype,
			sizeBytes: file.size,
		},
	});

	log.info("FileAsset persisted", {
		id: fileAssetDoc.id,
		entityType: input.entityType,
		entityId: input.entityId,
		category: input.category,
		sizeBytes: file.size,
	});

	return { ref: validatedRef, storedFilename: storedName, publicUrl };
}

export interface FileAssetContent {
	absolutePath: string;
	mimeType: string;
	downloadName: string;
}

export async function resolveFileAssetContent(id: string): Promise<FileAssetContent> {
	const doc = await FileAsset.findOne({ id, deletedAt: null });
	if (!doc) {
		throw new NotFoundError("FileAsset", id);
	}

	const storageName = path.basename(doc.storageKey || doc.storedName);
	const absolutePath = path.resolve(env.UPLOAD_DIR, storageName);

	return {
		absolutePath,
		mimeType: doc.mimeType,
		downloadName: doc.originalName,
	};
}

/**
 * Fetch a single FileAsset by id, respecting soft-delete.
 */
export async function getFileAssetById(id: string): Promise<IFileAssetDocument> {
	const doc = await FileAsset.findOne({ id, deletedAt: null });
	if (!doc) {
		throw new NotFoundError("FileAsset", id);
	}
	return doc;
}

/**
 * List FileAssets owned by a specific entity, optionally filtered by category.
 * Excludes soft-deleted records by default.
 */
export async function listFileAssetsByEntity(
	query: ListFileAssetsQuery,
): Promise<IFileAssetDocument[]> {
	if (!Types.ObjectId.isValid(query.entityId)) {
		throw new BadRequestError(
			`Invalid entityId: '${query.entityId}' is not a valid ObjectId`,
			"INVALID_ENTITY_ID",
		);
	}

	const filter: FileAssetListFilter = {
		entityType: query.entityType,
		entityId: new Types.ObjectId(query.entityId),
	};
	if (!query.includeDeleted) {
		filter.deletedAt = null;
	}
	if (query.category) {
		filter.category = query.category;
	}

	return FileAsset.find(filter).sort({ uploadedAt: -1 });
}

/**
 * Soft-delete a FileAsset: set `deletedAt` and remove its ref from the
 * parent document's `fileAssets` array. Idempotent — calling on an
 * already-deleted asset is a no-op.
 */
export async function softDeleteFileAsset(id: string, userId: string): Promise<void> {
	const doc = await FileAsset.findOne({ id, deletedAt: null });
	if (!doc) {
		throw new NotFoundError("FileAsset", id);
	}

	const now = new Date();
	await FileAsset.updateOne({ _id: doc._id }, { $set: { deletedAt: now } });

	// Remove the ref from the parent document (best-effort: parent may
	// have been deleted, in which case we skip silently).
	const ParentModel = getParentModel(doc.entityType);
	await ParentModel.removeFileAsset(doc.entityId, doc.id);

	await createAuditLog({
		action: "FILE_ASSET_DELETED",
		entity: "FileAsset",
		userId,
		entityId: id,
		metadata: {
			entityType: doc.entityType,
			parentId: String(doc.entityId),
			category: doc.category,
		},
	});

	log.info("FileAsset soft-deleted", { id });
}
