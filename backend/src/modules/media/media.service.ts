import type {
	FileAssetCategory,
	FileAssetEntityType,
	FileAssetSyncStatus,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { createAuditLog } from "../audit/audit.service";
import {
	createFileAssetFromUpload,
	getFileAssetById,
	listFileAssetsByEntity,
	softDeleteFileAsset,
} from "../files/files.service";
import type {
	CreateMediaAssetInput,
	ListMediaQuery,
	MediaAssetListResult,
	MediaAssetRecord,
	UpdateMediaAssetInput,
} from "./media.schema";

function toMediaAssetRecord(asset: {
	id: string;
	entityType: FileAssetEntityType;
	entityId: string;
	category: FileAssetCategory;
	description?: string;
	tags?: string[];
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
	offlineLocalId?: string;
	syncStatus?: FileAssetSyncStatus;
}): MediaAssetRecord {
	return {
		id: asset.id,
		ownerType: asset.entityType,
		ownerId: asset.entityId,
		category: asset.category,
		description: asset.description,
		tags: asset.tags,
		fileAssets: [asset],
		createdAt: new Date(asset.uploadedAt),
		updatedAt: new Date(asset.uploadedAt),
	};
}

export async function getMediaAssets(
	ownerType: FileAssetEntityType,
	ownerId: string,
	query: ListMediaQuery,
): Promise<MediaAssetListResult> {
	const allAssets = await listFileAssetsByEntity({
		entityType: ownerType,
		entityId: ownerId,
	});

	const filtered = query.category
		? allAssets.filter((asset) => asset.category === query.category)
		: allAssets;

	const start = (query.page - 1) * query.limit;
	const paginated = filtered.slice(start, start + query.limit);

	return {
		data: paginated.map((asset) =>
			toMediaAssetRecord({
				id: asset.id,
				entityType: asset.entityType as FileAssetEntityType,
				entityId: `${asset.entityId}`,
				category: asset.category as FileAssetCategory,
				description: asset.description,
				tags: asset.tags,
				originalName: asset.originalName,
				storedName: asset.storedName,
				mimeType: asset.mimeType,
				sizeBytes: asset.sizeBytes,
				url: asset.url,
				thumbnailUrl: asset.thumbnailUrl,
				storageKey: asset.storageKey,
				checksum: asset.checksum,
				width: asset.width,
				height: asset.height,
				uploadedBy: String(asset.uploadedBy),
				uploadedAt: asset.uploadedAt.toISOString(),
				offlineLocalId: asset.offlineLocalId,
				syncStatus: asset.syncStatus as FileAssetSyncStatus | undefined,
			}),
		),
		pagination: {
			page: query.page,
			limit: query.limit,
			total: filtered.length,
			totalPages: Math.ceil(filtered.length / query.limit),
		},
	};
}

export async function getMediaAssetById(id: string): Promise<MediaAssetRecord> {
	const asset = await getFileAssetById(id);
	if (!asset) {
		throw new AppError("Media asset not found", 404, "MEDIA_ASSET_NOT_FOUND");
	}

	const entityIdStr = `${asset.entityId}`;

	return toMediaAssetRecord({
		id: asset.id,
		entityType: asset.entityType as FileAssetEntityType,
		entityId: entityIdStr,
		category: asset.category as FileAssetCategory,
		description: asset.description,
		tags: asset.tags,
		originalName: asset.originalName,
		storedName: asset.storedName,
		mimeType: asset.mimeType,
		sizeBytes: asset.sizeBytes,
		url: asset.url,
		thumbnailUrl: asset.thumbnailUrl,
		storageKey: asset.storageKey,
		checksum: asset.checksum,
		width: asset.width,
		height: asset.height,
		uploadedBy: String(asset.uploadedBy),
		uploadedAt: asset.uploadedAt.toISOString(),
		offlineLocalId: asset.offlineLocalId,
		syncStatus: asset.syncStatus as FileAssetSyncStatus | undefined,
	});
}

export async function updateMediaAsset(
	id: string,
	input: UpdateMediaAssetInput,
	userId: string,
): Promise<MediaAssetRecord> {
	const existing = await getFileAssetById(id);
	if (!existing) {
		throw new AppError("Media asset not found", 404, "MEDIA_ASSET_NOT_FOUND");
	}

	const result = await createFileAssetFromUpload(
		{
			entityType: existing.entityType,
			entityId: `${existing.entityId}`,
			category: existing.category,
			description: input.description ?? existing.description,
			tags: input.tags ?? existing.tags,
			offlineLocalId: existing.offlineLocalId,
		},
		{} as Express.Multer.File,
		userId,
	);

	return toMediaAssetRecord({
		id: result.ref.id,
		entityType: result.ref.entityType as FileAssetEntityType,
		entityId: result.ref.entityId,
		category: result.ref.category as FileAssetCategory,
		description: result.ref.description,
		tags: result.ref.tags,
		originalName: result.ref.originalName,
		storedName: result.ref.storedName,
		mimeType: result.ref.mimeType,
		sizeBytes: result.ref.sizeBytes,
		url: result.ref.url,
		thumbnailUrl: result.ref.thumbnailUrl,
		storageKey: result.ref.storageKey,
		checksum: result.ref.checksum,
		width: result.ref.width,
		height: result.ref.height,
		uploadedBy: String(result.ref.uploadedBy),
		uploadedAt: result.ref.uploadedAt,
		offlineLocalId: result.ref.offlineLocalId,
		syncStatus: result.ref.syncStatus as FileAssetSyncStatus | undefined,
	});
}

export async function deleteMediaAsset(id: string, userId: string): Promise<void> {
	const existing = await getFileAssetById(id);
	if (!existing) {
		throw new AppError("Media asset not found", 404, "MEDIA_ASSET_NOT_FOUND");
	}

	await softDeleteFileAsset(id, userId);

	await createAuditLog({
		userId,
		entity: "media_asset",
		entityId: id,
		action: "FILE_ASSET_DELETED",
		before: { id, ownerType: String(existing.entityType), ownerId: `${existing.entityId}` },
	});
}

export async function uploadMediaAsset(
	input: CreateMediaAssetInput,
	file: Express.Multer.File,
	userId: string,
): Promise<MediaAssetRecord> {
	const result = await createFileAssetFromUpload(
		{
			entityType: input.ownerType,
			entityId: input.ownerId,
			category: input.category,
			description: input.description,
			tags: input.tags,
			offlineLocalId: undefined,
		},
		file,
		userId,
	);

	return toMediaAssetRecord({
		id: result.ref.id,
		entityType: result.ref.entityType as FileAssetEntityType,
		entityId: result.ref.entityId,
		category: result.ref.category as FileAssetCategory,
		description: result.ref.description,
		tags: result.ref.tags,
		originalName: result.ref.originalName,
		storedName: result.ref.storedName,
		mimeType: result.ref.mimeType,
		sizeBytes: result.ref.sizeBytes,
		url: result.ref.url,
		thumbnailUrl: result.ref.thumbnailUrl,
		storageKey: result.ref.storageKey,
		checksum: result.ref.checksum,
		width: result.ref.width,
		height: result.ref.height,
		uploadedBy: String(result.ref.uploadedBy),
		uploadedAt: result.ref.uploadedAt,
		offlineLocalId: result.ref.offlineLocalId,
		syncStatus: result.ref.syncStatus as FileAssetSyncStatus | undefined,
	});
}
