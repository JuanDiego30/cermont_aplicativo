import type {
	AssetId,
	CreateAssetInput,
	ListAssetsQuery,
	UpdateAssetInput,
} from "@cermont/shared-types";
import { Types } from "mongoose";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { AppError, NotFoundError } from "../../common/errors";
import { saveFile } from "../../common/storage/local-storage";
import { Asset } from "../../models/Asset";
import { createAuditLog } from "../audit/audit.service";

/**
 * Create a new asset
 * @param data - Validated asset data
 * @param userId - ID of the user creating the asset
 * @returns Created asset
 */
export async function createAsset(data: CreateAssetInput, userId: string) {
	const asset = await Asset.create({
		...data,
		createdBy: userId,
	});
	return asset;
}

/**
 * Get assets with filtering and pagination
 * @param query - Query parameters for filtering and pagination
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Paginated list of assets
 */
export async function getAssets(query: ListAssetsQuery) {
	const { page = 0, limit = 20, search, status, type, assignedToId } = query;

	// Build filter based on RBAC
	const filter: Record<string, unknown> = {};

	// Apply query filters
	if (search) {
		const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const searchPattern = new RegExp(escapedSearch, "i");
		filter.$or = [
			{ code: searchPattern },
			{ name: searchPattern },
			{ serialNumber: searchPattern },
		];
	}
	if (status) {
		filter.status = status;
	}
	if (type) {
		filter.type = type;
	}
	if (assignedToId) {
		filter.assignedToId = assignedToId;
	}

	const assets = await Asset.find(filter)
		.sort({ createdAt: -1 })
		.limit(limit)
		.skip(page * limit)
		.populate("createdBy", "name email");

	const total = await Asset.countDocuments(filter);

	return {
		data: assets,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

/**
 * Get an asset by ID
 * @param id - Asset ID
 * @param userId - ID of the user making the request
 * @param userRole - Role of the user making the request
 * @returns Asset
 */
export async function getAssetById(id: AssetId) {
	const asset = await Asset.findById(id).populate("createdBy", "name email");

	if (!asset) {
		throw new AppError("ASSET_NOT_FOUND", 404, "Asset not found");
	}

	return asset;
}

/**
 * Update an asset
 * @param id - Asset ID
 * @param data - Validated update data
 * @param userId - ID of the user making the update
 * @param userRole - Role of the user making the update
 * @returns Updated asset
 */
export async function updateAsset(id: AssetId, data: UpdateAssetInput, userRole: string) {
	const asset = await Asset.findById(id);

	if (!asset) {
		throw new AppError("ASSET_NOT_FOUND", 404, "Asset not found");
	}

	// RBAC: Only gerente, residente can update
	if (!["gerente", "residente"].includes(userRole)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to update assets");
	}

	const updatedAsset = await Asset.findByIdAndUpdate(
		id,
		{ ...data },
		{
			returnDocument: "after",
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return updatedAsset;
}

/**
 * Update asset status
 * @param id - Asset ID
 * @param status - New status
 * @param userId - ID of the user making the update
 * @param userRole - Role of the user making the update
 * @returns Updated asset
 */
export async function updateAssetStatus(id: AssetId, status: string, userRole: string) {
	const asset = await Asset.findById(id);

	if (!asset) {
		throw new AppError("ASSET_NOT_FOUND", 404, "Asset not found");
	}

	// RBAC: Only gerente, residente can update status
	if (!["gerente", "residente"].includes(userRole)) {
		throw new AppError("FORBIDDEN", 403, "You do not have permission to update asset status");
	}

	// Validate status transition
	const validTransitions: Record<string, string[]> = {
		available: ["in_use", "maintenance", "damaged", "retired"],
		in_use: ["available", "maintenance", "damaged", "retired"],
		maintenance: ["available", "damaged", "retired"],
		damaged: ["maintenance", "retired"],
		retired: [],
		lost: ["available", "maintenance", "retired"],
	};

	const allowedTransitions = validTransitions[asset.status] || [];
	if (!allowedTransitions.includes(status)) {
		throw new AppError(
			"INVALID_STATUS_TRANSITION",
			400,
			`Cannot transition from ${asset.status} to ${status}`,
		);
	}

	const updatedAsset = await Asset.findByIdAndUpdate(
		id,
		{ status },
		{
			returnDocument: "after",
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return updatedAsset;
}

/**
 * Delete (soft delete) an asset
 * @param id - Asset ID
 * @param userId - ID of the user making the deletion
 * @param userRole - Role of the user making the deletion
 * @returns Deleted asset
 */
export async function deleteAsset(id: AssetId, userRole: string) {
	const asset = await Asset.findById(id);

	if (!asset) {
		throw new AppError("ASSET_NOT_FOUND", 404, "Asset not found");
	}

	// RBAC: Only gerente can delete
	if (userRole !== "gerente") {
		throw new AppError("FORBIDDEN", 403, "Only gerente can delete assets");
	}

	// Soft delete by setting status to retired
	const deletedAsset = await Asset.findByIdAndUpdate(
		id,
		{ status: "retired" },
		{
			returnDocument: "after",
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return deletedAsset;
}

// ─── Asset Photo Service ───────────────────────────────────────────

/**
 * Upload a photo for an asset
 */
export async function uploadPhoto(
	assetId: string,
	fileBuffer: Buffer,
	userId: string,
	title?: string,
) {
	const asset = await Asset.findById(assetId);
	if (!asset) {
		throw new NotFoundError("Asset", assetId);
	}

	const unique = uuidv4();
	const filename = `${unique}.webp`;
	const compressedBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();
	const url = await saveFile(filename, compressedBuffer);

	const photo = {
		_id: new Types.ObjectId(),
		url,
		filename,
		title: title || "",
		mimeType: "image/webp" as const,
		sizeBytes: compressedBuffer.length,
		isPrimary: false,
		uploadedBy: new Types.ObjectId(userId),
		uploadedAt: new Date(),
	};

	await Asset.findByIdAndUpdate(assetId, {
		$push: { photos: photo },
	});

	await createAuditLog({
		action: "ASSET_PHOTO_UPLOADED",
		entity: "Asset",
		entityId: assetId,
		userId,
		metadata: { filename, sizeBytes: compressedBuffer.length },
	});

	return photo;
}

/**
 * Get photos for an asset
 */
export async function getPhotos(assetId: string) {
	const asset = await Asset.findById(assetId).select("photos");
	if (!asset) {
		throw new NotFoundError("Asset", assetId);
	}
	return (asset as unknown as { photos?: unknown[] }).photos ?? [];
}

/**
 * Set a photo as primary for an asset
 */
export async function setPrimaryPhoto(
	assetId: string,
	photoId: string,
	userId: string,
) {
	const asset = await Asset.findById(assetId);
	if (!asset) {
		throw new NotFoundError("Asset", assetId);
	}

	const photos = (asset as unknown as { photos?: Array<{ _id: Types.ObjectId; isPrimary: boolean }> }).photos ?? [];
	const photoIndex = photos.findIndex((p) => p._id.toString() === photoId);
	if (photoIndex === -1) {
		throw new AppError("Photo not found on asset", 404, "ASSET_PHOTO_NOT_FOUND");
	}

	for (const photo of photos) {
		photo.isPrimary = false;
	}
	photos[photoIndex].isPrimary = true;

	await asset.save();

	await createAuditLog({
		action: "ASSET_PRIMARY_PHOTO_CHANGED",
		entity: "Asset",
		entityId: assetId,
		userId,
		metadata: { photoId },
	});

	return photos[photoIndex];
}

// ─── Asset Document Service ─────────────────────────────────────────

/**
 * Upload a document for an asset
 */
export async function uploadDocument(
	assetId: string,
	fileBuffer: Buffer,
	originalName: string,
	mimeType: string,
	userId: string,
	description?: string,
) {
	const asset = await Asset.findById(assetId);
	if (!asset) {
		throw new NotFoundError("Asset", assetId);
	}

	const unique = uuidv4();
	const ext = originalName.split(".").pop() || "bin";
	const filename = `${unique}.${ext}`;
	const url = await saveFile(filename, fileBuffer);

	const document = {
		_id: new Types.ObjectId(),
		url,
		filename: originalName,
		storedFilename: filename,
		mimeType,
		sizeBytes: fileBuffer.length,
		description: description || "",
		uploadedBy: new Types.ObjectId(userId),
		uploadedAt: new Date(),
	};

	await Asset.findByIdAndUpdate(assetId, {
		$push: { documents: document },
	});

	await createAuditLog({
		action: "ASSET_DOCUMENT_UPLOADED",
		entity: "Asset",
		entityId: assetId,
		userId,
		metadata: { filename: originalName, mimeType, sizeBytes: fileBuffer.length },
	});

	return document;
}

/**
 * Get documents for an asset
 */
export async function getDocuments(assetId: string) {
	const asset = await Asset.findById(assetId).select("documents");
	if (!asset) {
		throw new NotFoundError("Asset", assetId);
	}
	return (asset as unknown as { documents?: unknown[] }).documents ?? [];
}
