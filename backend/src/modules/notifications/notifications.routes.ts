import { ADMIN_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import { NotificationIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams } from "../../middlewares/validate";
import {
	getFailedOutboxEntries,
	getNotifications,
	getUnreadCount,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "./notification.controller";

const router = Router();

router.use(authenticate);

// GET /api/notifications
router.get("/", authorize(...INTERNAL_ROLES), getNotifications);

// GET /api/notifications/unread-count — lightweight count for header bell badge
router.get("/unread-count", authorize(...INTERNAL_ROLES), getUnreadCount);

// PATCH /api/notifications/:id
router.patch(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(NotificationIdSchema),
	markNotificationAsRead,
);

// PATCH /api/notifications/:id/read
router.patch(
	"/:id/read",
	authorize(...INTERNAL_ROLES),
	validateParams(NotificationIdSchema),
	markNotificationAsRead,
);

// POST /api/notifications/read-all — mark all as read
router.post(
	"/read-all",
	authorize(...INTERNAL_ROLES),
	markAllNotificationsAsRead,
);

// POST /api/notifications/mark-all-read — alias for read-all
router.post(
	"/mark-all-read",
	authorize(...INTERNAL_ROLES),
	markAllNotificationsAsRead,
);

// GET /api/notifications/outbox/failed — admin: view failed outbox entries
router.get("/outbox/failed", authorize(...ADMIN_ROLES), getFailedOutboxEntries);

export default router;
