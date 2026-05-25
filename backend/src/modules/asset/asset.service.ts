import type {
	AssetId,
	CreateAssetInput,
	ListAssetsQuery,
	UpdateAssetInput,
} from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { Asset } from "../../models/Asset";

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
	const { page = 0, limit = 20, status, type, assignedToId } = query;

	// Build filter based on RBAC
	const filter: Record<string, unknown> = {};

	// Apply query filters
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
			new: true,
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
			new: true,
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
			new: true,
			runValidators: true,
		},
	).populate("createdBy", "name email");

	return deletedAsset;
}
