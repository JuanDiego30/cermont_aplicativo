import {
	AssetIdSchema,
	CreateAssetSchema,
	ListAssetsQuerySchema,
	UpdateAssetSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as AssetService from "./asset.service";

/**
 * Create a new asset
 * POST /api/assets
 * Roles: GER, RES
 */
export async function createAsset(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const data = CreateAssetSchema.parse(req.body);

	const asset = await AssetService.createAsset(data, userId);

	res.status(201).json({ success: true, data: asset });
}

/**
 * Get assets (paginated, filtered)
 * GET /api/assets
 * Roles: Todos (all authenticated users)
 */
export async function getAssets(req: Request, res: Response) {
	requireUser(req);
	const query = ListAssetsQuerySchema.parse(req.query);

	const result = await AssetService.getAssets(query);

	res.status(200).json({ success: true, ...result });
}

/**
 * Get asset by ID
 * GET /api/assets/:id
 * Roles: Todos (all authenticated users)
 */
export async function getAsset(req: Request, res: Response) {
	requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);

	const asset = await AssetService.getAssetById({ id });

	res.status(200).json({ success: true, data: asset });
}

/**
 * Update asset
 * PATCH /api/assets/:id
 * Roles: GER, RES
 */
export async function updateAsset(req: Request, res: Response) {
	const user = requireUser(req);
	const userRole = user.role;
	const { id } = AssetIdSchema.parse(req.params);
	const data = UpdateAssetSchema.parse(req.body);

	const asset = await AssetService.updateAsset({ id }, data, userRole);

	res.status(200).json({ success: true, data: asset });
}

/**
 * Update asset status
 * PATCH /api/assets/:id/status
 * Roles: GER, RES
 */
export async function updateAssetStatus(req: Request, res: Response) {
	const user = requireUser(req);
	const userRole = user.role;
	const { id } = AssetIdSchema.parse(req.params);
	const { status } = req.body;

	const asset = await AssetService.updateAssetStatus({ id }, status, userRole);

	res.status(200).json({ success: true, data: asset });
}

/**
 * Delete (soft delete) asset
 * DELETE /api/assets/:id
 * Roles: GER (only gerente can delete)
 */
export async function deleteAsset(req: Request, res: Response) {
	const user = requireUser(req);
	const userRole = user.role;
	const { id } = AssetIdSchema.parse(req.params);

	const asset = await AssetService.deleteAsset({ id }, userRole);

	res.status(200).json({ success: true, data: asset });
}
