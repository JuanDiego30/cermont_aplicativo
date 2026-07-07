import { INTERNAL_ROLES } from "@cermont/domain";
import { ErrorDashboardQuerySchema, NotificationIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams, validateQuery } from "../../middlewares/validate";
import {
	getErrorDashboard,
	getKpis,
	getNotifications,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "./analytics.controller";

const router = Router();

// All analytics endpoints require authentication
router.use(authenticate);

// GET /api/analytics/kpis
router.get("/kpis", authorize(...INTERNAL_ROLES), getKpis);
router.get(
	"/errors",
	authorize(...INTERNAL_ROLES),
	validateQuery(ErrorDashboardQuerySchema),
	getErrorDashboard,
);

// Notifications (analytics namespace)
router.get("/notifications", authorize(...INTERNAL_ROLES), getNotifications);
router.patch(
	"/notifications/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(NotificationIdSchema),
	markNotificationAsRead,
);
router.post(
	"/notifications/mark-all-read",
	authorize(...INTERNAL_ROLES),
	/* No body validation needed — action endpoint */
	markAllNotificationsAsRead,
);

// Notifications (direct namespace when mounted under /api/notifications)
router.get("/", authorize(...INTERNAL_ROLES), getNotifications);
router.patch(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(NotificationIdSchema),
	markNotificationAsRead,
);
router.post(
	"/mark-all-read",
	authorize(...INTERNAL_ROLES),
	/* No body validation needed — action endpoint */
	markAllNotificationsAsRead,
);

export default router;
