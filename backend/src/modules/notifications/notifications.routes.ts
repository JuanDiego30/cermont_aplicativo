import { INTERNAL_ROLES } from "@cermont/domain";
import { NotificationIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams } from "../../middlewares/validate";
import {
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "../analytics/analytics.controller";

const router = Router();

router.use(authenticate);

// GET /api/notifications
router.get("/", authorize(...INTERNAL_ROLES), getNotifications);

// PATCH /api/notifications/:id
router.patch(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(NotificationIdSchema),
	markNotificationAsRead,
);

// POST /api/notifications/mark-all-read
router.post("/mark-all-read", authorize(...INTERNAL_ROLES), markAllNotificationsAsRead);

export default router;
