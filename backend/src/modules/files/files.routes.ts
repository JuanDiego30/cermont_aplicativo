/**
 * Files Routes — POST /upload, GET /:id, GET /, DELETE /:id
 *
 * Middleware chain (per backend AGENTS.md):
 *   authenticate → authorize(internal roles) → upload single → processUploadedFile → controller
 *
 * The `upload.single("file")` middleware uses multer memoryStorage + a strict
 * MIME/extension allowlist. The `processUploadedFile` middleware then runs
 * magic-bytes validation, optional ClamAV scan, sharp compression, and writes
 * the file to disk with a secure random name.
 */

import { INTERNAL_ROLES } from "@cermont/domain";
import { FileAssetUploadInputFormSchema } from "@cermont/shared-types";
import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { processUploadedFile, upload } from "../../middlewares/uploadMiddleware";
import { validateBody } from "../../middlewares/validate";
import * as FilesController from "./files.controller";

const router = Router();

router.use(authenticate);

// POST /api/files/upload — multipart upload
router.post(
	"/upload",
	authorize(...INTERNAL_ROLES),
	upload.single("file"),
	processUploadedFile,
	validateBody(FileAssetUploadInputFormSchema),
	FilesController.upload,
);

router.post(
	"/offline-upload",
	authorize(...INTERNAL_ROLES),
	upload.single("file"),
	processUploadedFile,
	validateBody(FileAssetUploadInputFormSchema),
	FilesController.upload,
);

// GET /api/files?entityType=...&entityId=...&category=...&includeDeleted=...
router.get("/", authorize(...INTERNAL_ROLES), FilesController.listByEntity);

// GET /api/files/:id/content
router.get("/:id/content", authorize(...INTERNAL_ROLES), FilesController.getContent);

// GET /api/files/:id
router.get("/:id", authorize(...INTERNAL_ROLES), FilesController.getById);

// DELETE /api/files/:id — soft delete
router.delete("/:id", authorize(...INTERNAL_ROLES), FilesController.remove);

export default router;
