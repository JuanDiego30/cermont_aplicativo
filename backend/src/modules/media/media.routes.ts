import { INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { uploadLimiter } from "../../middlewares/rate-limiter";
import { handleUploadError, processUploadedFile, upload } from "../../middlewares/uploadMiddleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as MediaController from "./media.controller";
import {
	CreateMediaAssetSchema,
	ListMediaQuerySchema,
	MediaAssetIdSchema,
	MediaOwnerParamsSchema,
} from "./media.schema";

const router = Router();
router.use(authenticate);

router.get(
	"/:ownerType/:ownerId",
	authorize(...INTERNAL_ROLES),
	validateParams(MediaOwnerParamsSchema),
	validateQuery(ListMediaQuerySchema),
	MediaController.listMediaAssets,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(MediaAssetIdSchema),
	MediaController.getMediaAsset,
);

router.post(
	"/:ownerType/:ownerId/upload",
	authorize(...MANAGEMENT_ROLES),
	validateParams(MediaOwnerParamsSchema),
	uploadLimiter,
	upload.single("file"),
	handleUploadError,
	processUploadedFile,
	validateBody(CreateMediaAssetSchema),
	MediaController.uploadMediaAsset,
);

router.delete(
	"/:id",
	authorize(...MANAGEMENT_ROLES),
	validateParams(MediaAssetIdSchema),
	MediaController.deleteMediaAsset,
);

export default router;
