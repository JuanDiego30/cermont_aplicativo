/**
 * Asset Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams, validateQuery via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 */

import { ASSET_MANAGEMENT_ROLES, CERMONT_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import {
	AssetIdSchema,
	CreateAssetSchema,
	ListAssetsQuerySchema,
	UpdateAssetSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { uploadLimiter } from "../../middlewares/rate-limiter";
import {
	evidenceUpload,
	handleUploadError,
	validateUploadedFileHeaders,
} from "../../middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as AssetController from "./asset.controller";

const router = Router();

/**
 * GET /api/assets
 * List all assets (paginated, filtered)
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateQuery(ListAssetsQuerySchema),
	AssetController.getAssets,
);

/**
 * GET /api/assets/:id
 * Get asset by ID
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/:id",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(AssetIdSchema),
	AssetController.getAsset,
);

/**
 * POST /api/assets
 * Create a new asset
 * Roles: GER, RES
 */
router.post(
	"/",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateBody(CreateAssetSchema),
	AssetController.createAsset,
);

/**
 * PATCH /api/assets/:id
 * Update asset
 * Roles: GER, RES
 */
router.patch(
	"/:id",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(AssetIdSchema),
	validateBody(UpdateAssetSchema),
	AssetController.updateAsset,
);

/**
 * PATCH /api/assets/:id/status
 * Update asset status
 * Roles: GER, RES
 */
router.patch(
	"/:id/status",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(AssetIdSchema),
	validateBody(UpdateAssetSchema.pick({ status: true })),
	AssetController.updateAssetStatus,
);

/**
 * DELETE /api/assets/:id
 * Soft delete asset (mark as retired)
 * Roles: GER (only gerente can delete)
 */
router.delete(
	"/:id",
	authenticate,
	authorize(CERMONT_ROLES.GERENTE),
	validateParams(AssetIdSchema),
	AssetController.deleteAsset,
);

// ─── Asset Photo Endpoints ──────────────────────────────────────────

/**
 * POST /api/assets/:id/photos
 * Upload photo for asset
 * Roles: GER, RES
 */
router.post(
	"/:id/photos",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(AssetIdSchema),
	uploadLimiter,
	evidenceUpload.single("file"),
	handleUploadError,
	validateUploadedFileHeaders,
	AssetController.uploadPhoto,
);

/**
 * GET /api/assets/:id/photos
 * List photos for asset
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/:id/photos",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(AssetIdSchema),
	AssetController.getPhotos,
);

/**
 * PATCH /api/assets/:id/primary-photo
 * Set primary photo for asset
 * Roles: GER, RES
 */
router.patch(
	"/:id/primary-photo",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(AssetIdSchema),
	AssetController.setPrimaryPhoto,
);

// ─── Asset Document Endpoints ───────────────────────────────────────

/**
 * POST /api/assets/:id/documents
 * Upload document for asset
 * Roles: GER, RES
 */
router.post(
	"/:id/documents",
	authenticate,
	authorize(...ASSET_MANAGEMENT_ROLES),
	validateParams(AssetIdSchema),
	uploadLimiter,
	evidenceUpload.single("file"),
	handleUploadError,
	validateUploadedFileHeaders,
	AssetController.uploadDocument,
);

/**
 * GET /api/assets/:id/documents
 * List documents for asset
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/:id/documents",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(AssetIdSchema),
	AssetController.getDocuments,
);

export default router;
