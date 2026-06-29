import {
	AssetIdSchema,
	CreateAssetSchema,
	ListAssetsQuerySchema,
	UpdateAssetSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors/AppError";
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

// ─── Asset Photo Controllers ────────────────────────────────────────

/**
 * Upload photo for asset
 * POST /api/assets/:id/photos
 * Roles: GER, RES
 */
export async function uploadPhoto(req: Request, res: Response) {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}
	const user = requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);

	const photo = await AssetService.uploadPhoto(
		id,
		req.file.buffer,
		user._id,
		req.body.title as string,
	);

	res.status(201).json({ success: true, data: photo });
}

/**
 * List photos for asset
 * GET /api/assets/:id/photos
 * Roles: Todos
 */
export async function getPhotos(req: Request, res: Response) {
	requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);

	const photos = await AssetService.getPhotos(id);

	res.status(200).json({ success: true, data: photos });
}

/**
 * Set primary photo for asset
 * PATCH /api/assets/:id/primary-photo
 * Roles: GER, RES
 */
export async function setPrimaryPhoto(req: Request, res: Response) {
	const user = requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);
	const { photoId } = req.body as { photoId: string };

	const result = await AssetService.setPrimaryPhoto(id, photoId, user._id);

	res.status(200).json({ success: true, data: result });
}

// ─── Asset Document Controllers ─────────────────────────────────────

/**
 * Upload document for asset
 * POST /api/assets/:id/documents
 * Roles: GER, RES
 */
export async function uploadDocument(req: Request, res: Response) {
	if (!req.file) {
		throw new BadRequestError("No file uploaded");
	}
	const user = requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);

	const document = await AssetService.uploadDocument(
		id,
		req.file.buffer,
		req.file.originalname,
		req.file.mimetype,
		user._id,
		req.body.description as string,
	);

	res.status(201).json({ success: true, data: document });
}

/**
 * List documents for asset
 * GET /api/assets/:id/documents
 * Roles: Todos
 */
export async function getDocuments(req: Request, res: Response) {
	requireUser(req);
	const { id } = AssetIdSchema.parse(req.params);

	const documents = await AssetService.getDocuments(id);

	res.status(200).json({ success: true, data: documents });
}
