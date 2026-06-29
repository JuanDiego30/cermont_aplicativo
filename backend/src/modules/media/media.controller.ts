import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors/AppError";
import { requireUser } from "../../common/utils/request";
import {
	CreateMediaAssetSchema,
	ListMediaQuerySchema,
	MediaAssetIdSchema,
	MediaOwnerParamsSchema,
} from "./media.schema";
import * as MediaService from "./media.service";

export async function listMediaAssets(req: Request, res: Response): Promise<void> {
	const _user = requireUser(req);
	const { ownerType, ownerId } = MediaOwnerParamsSchema.parse(req.params);
	const query = ListMediaQuerySchema.parse(req.query);
	const result = await MediaService.getMediaAssets(ownerType, ownerId, query);
	res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
}

export async function getMediaAsset(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = MediaAssetIdSchema.parse(req.params);
	const asset = await MediaService.getMediaAssetById(id);
	res.status(200).json({ success: true, data: asset });
}

export async function deleteMediaAsset(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = MediaAssetIdSchema.parse(req.params);
	await MediaService.deleteMediaAsset(id, String(user._id));
	res.status(204).send();
}

export async function uploadMediaAsset(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { ownerType, ownerId } = MediaOwnerParamsSchema.parse(req.params);
	const body = CreateMediaAssetSchema.parse(req.body);
	if (!req.file) {
		throw new BadRequestError("File is required", "FILE_REQUIRED");
	}
	const result = await MediaService.uploadMediaAsset(
		{ ownerType, ownerId, category: body.category, description: body.description, tags: body.tags },
		req.file,
		String(user._id),
	);
	res.status(201).json({ success: true, data: result });
}
