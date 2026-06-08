/**
 * Asset Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams, validateQuery via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES } from "@cermont/domain";
import {
	AssetIdSchema,
	CreateAssetSchema,
	ListAssetsQuerySchema,
	UpdateAssetSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
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
	authorize("gerente", "residente"),
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
	authorize("gerente", "residente"),
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
	authorize("gerente", "residente"),
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
	authorize("gerente"),
	validateParams(AssetIdSchema),
	AssetController.deleteAsset,
);

export default router;
