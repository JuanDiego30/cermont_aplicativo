/**
 * Files Controller — Thin HTTP Layer
 *
 * Handles multipart uploads via the existing `processUploadedFile` middleware
 * (multer memoryStorage → MIME/magic-bytes validation → ClamAV → sharp →
 * secure random filename → on-disk write). The controller only parses
 * request fields and delegates to the service.
 */

import type { FileAssetUploadInput } from "@cermont/shared-types";
import type { Request, Response } from "express";
import {
	sendCreated,
	sendNoContent,
	sendSuccess,
} from "../../common/interceptors/response.interceptor";
import { getString, requireUser } from "../../common/utils/request";
import {
	createFileAssetFromUpload,
	getFileAssetById,
	listFileAssetsByEntity,
	resolveFileAssetContent,
	softDeleteFileAsset,
} from "./files.service";

/**
 * POST /api/files/upload
 * Multipart form: `file` (binary) + `category` + `entityType` + `entityId` + optional `description`/`tags`/`offlineLocalId`.
 *
 * The `validateBody(FileAssetUploadInputFormSchema)` route middleware
 * has already validated and coerced `req.body` into the canonical
 * {@link FileAssetUploadInput} shape (including transforming the
 * `tags` form field from `string | string[]` to `string[]`).
 */
export const upload = async (req: Request, res: Response): Promise<void> => {
	if (!req.file) {
		res.status(400).json({
			success: false,
			error: { code: "FILE_REQUIRED", message: "No file was uploaded under field 'file'" },
		});
		return;
	}

	const user = requireUser(req);
	const headerIdempotencyKey = req.get("Idempotency-Key");
	const bodyInput = req.body as FileAssetUploadInput;
	const input: FileAssetUploadInput = {
		...bodyInput,
		offlineLocalId: bodyInput.offlineLocalId ?? headerIdempotencyKey,
	};

	const result = await createFileAssetFromUpload(
		input,
		req.file,
		String(user._id),
		user.email,
	);

	return sendCreated(res, result.ref);
};

/**
 * GET /api/files/:id
 * Fetch a single FileAsset by id.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
	const id = getString(req.params.id);
	if (!id) {
		res.status(400).json({
			success: false,
			error: { code: "BAD_REQUEST", message: "File id is required" },
		});
		return;
	}
	const doc = await getFileAssetById(id);
	return sendSuccess(res, {
		id: doc.id,
		originalName: doc.originalName,
		storedName: doc.storedName,
		mimeType: doc.mimeType,
		sizeBytes: doc.sizeBytes,
		url: doc.url,
		thumbnailUrl: doc.thumbnailUrl,
		storageKey: doc.storageKey,
		checksum: doc.checksum,
		width: doc.width,
		height: doc.height,
		uploadedBy: String(doc.uploadedBy),
		uploadedByName: doc.uploadedByName,
		uploadedAt: doc.uploadedAt.toISOString(),
		entityType: doc.entityType,
		entityId: String(doc.entityId),
		category: doc.category,
		description: doc.description,
		tags: doc.tags,
		offlineLocalId: doc.offlineLocalId,
		syncStatus: doc.syncStatus,
	});
};

/**
 * GET /api/files/:id/content
 * Streams the stored binary only after the authenticated files route has
 * authorized the caller.
 */
export const getContent = async (req: Request, res: Response): Promise<void> => {
	const id = getString(req.params.id);
	if (!id) {
		res.status(400).json({
			success: false,
			error: { code: "BAD_REQUEST", message: "File id is required" },
		});
		return;
	}

	const content = await resolveFileAssetContent(id);
	const safeDownloadName = content.downloadName.replace(/["\r\n]/g, "");
	res.type(content.mimeType);
	res.setHeader("Content-Disposition", `inline; filename="${safeDownloadName}"`);

	await new Promise<void>((resolve, reject) => {
		res.sendFile(content.absolutePath, (error) => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
};

/**
 * GET /api/files?entityType=...&entityId=...&category=...&includeDeleted=...
 * List FileAssets owned by a specific entity.
 */
export const listByEntity = async (req: Request, res: Response): Promise<void> => {
	const entityType = String(req.query.entityType ?? "");
	const entityId = String(req.query.entityId ?? "");
	const category = req.query.category ? String(req.query.category) : undefined;
	const includeDeleted = req.query.includeDeleted === "true";

	if (!entityType || !entityId) {
		res.status(400).json({
			success: false,
			error: {
				code: "BAD_REQUEST",
				message: "Both 'entityType' and 'entityId' query parameters are required",
			},
		});
		return;
	}

	const docs = await listFileAssetsByEntity({ entityType, entityId, category, includeDeleted } as Parameters<typeof listFileAssetsByEntity>[0]);
	return sendSuccess(
		res,
		docs.map((doc) => ({
			id: doc.id,
			originalName: doc.originalName,
			storedName: doc.storedName,
			mimeType: doc.mimeType,
			sizeBytes: doc.sizeBytes,
			url: doc.url,
			thumbnailUrl: doc.thumbnailUrl,
			storageKey: doc.storageKey,
			uploadedBy: String(doc.uploadedBy),
			uploadedByName: doc.uploadedByName,
			uploadedAt: doc.uploadedAt.toISOString(),
			entityType: doc.entityType,
			entityId: String(doc.entityId),
			category: doc.category,
			description: doc.description,
			tags: doc.tags,
			offlineLocalId: doc.offlineLocalId,
			syncStatus: doc.syncStatus,
		})),
	);
};

/**
 * DELETE /api/files/:id
 * Soft-delete a FileAsset and remove its ref from the parent document.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
	const id = getString(req.params.id);
	if (!id) {
		res.status(400).json({
			success: false,
			error: { code: "BAD_REQUEST", message: "File id is required" },
		});
		return;
	}
	const user = requireUser(req);
	await softDeleteFileAsset(id, String(user._id));
	return sendNoContent(res);
};
