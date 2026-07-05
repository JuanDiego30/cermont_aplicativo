/**
 * Notification Preference Routes
 */

import { INTERNAL_ROLES } from "@cermont/domain";
import { UpdateNotificationPreferencesSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody } from "../../middlewares/validate";
import * as NotificationPreferenceController from "./notification-preference.controller";

const router = Router();

router.use(authenticate);
router.use(authorize(...INTERNAL_ROLES));

// GET /api/notification-preferences — Get current user's preferences
router.get("/", NotificationPreferenceController.getMyPreferences);

// PUT /api/notification-preferences — Update current user's preferences
router.put(
	"/",
	validateBody(UpdateNotificationPreferencesSchema),
	NotificationPreferenceController.updateMyPreferences,
);

export default router;
