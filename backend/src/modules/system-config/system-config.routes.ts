import { ADMIN_ROLES } from "@cermont/domain";
import {
	FeatureFlagKeyParamsSchema,
	ToggleFeatureFlagSchema,
	UpdateSystemSettingsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import { SystemConfigController } from "./system-config.controller";

const router = Router();

router.use(authenticate);

router.get("/", authorize(...ADMIN_ROLES), SystemConfigController.getConfig);
router.put(
	"/toggle-flag/:key",
	authorize(...ADMIN_ROLES),
	validateParams(FeatureFlagKeyParamsSchema),
	validateBody(ToggleFeatureFlagSchema),
	SystemConfigController.toggleFeatureFlag,
);
router.put(
	"/settings",
	authorize(...ADMIN_ROLES),
	validateBody(UpdateSystemSettingsSchema),
	SystemConfigController.updateSettings,
);

export default router;
