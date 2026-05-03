import {
	DashboardKpisQuerySchema,
	DashboardTechnicianWorkloadQuerySchema,
	DashboardTimeSeriesQuerySchema,
	DashboardTopAssetsQuerySchema,
	ErrorDashboardQuerySchema,
	ExtendedKpisQuerySchema,
	NoBodySchema,
	NotificationIdSchema,
	ReportAnalyticsQuerySchema,
} from "@cermont/shared-types";
import { INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	getBillingVsCost,
	getErrorDashboard,
	getExtendedKpis,
	getKpis,
	getNotifications,
	getReportCycleTimeDistribution,
	getReportTechnicianRanking,
	getTechnicianWorkload,
	getTimeSeries,
	getTopAssets,
	markAllNotificationsAsRead,
	markNotificationAsRead,
} from "./controller";

const router = Router();

// All analytics endpoints require authentication
router.use(authenticate);

// GET /api/analytics/kpis
router.get("/kpis", authorize(...INTERNAL_ROLES), validateQuery(DashboardKpisQuerySchema), getKpis);
router.get(
	"/kpis/extended",
	authorize(...INTERNAL_ROLES),
	validateQuery(ExtendedKpisQuerySchema),
	getExtendedKpis,
);
router.get(
	"/time-series",
	authorize(...INTERNAL_ROLES),
	validateQuery(DashboardTimeSeriesQuerySchema),
	getTimeSeries,
);
router.get(
	"/top-assets",
	authorize(...INTERNAL_ROLES),
	validateQuery(DashboardTopAssetsQuerySchema),
	getTopAssets,
);
router.get(
	"/technician-workload",
	authorize(...INTERNAL_ROLES),
	validateQuery(DashboardTechnicianWorkloadQuerySchema),
	getTechnicianWorkload,
);
router.get(
	"/errors",
	authorize(...INTERNAL_ROLES),
	validateQuery(ErrorDashboardQuerySchema),
	getErrorDashboard,
);
router.get(
	"/report-cycle-time",
	authorize(...INTERNAL_ROLES),
	validateQuery(ReportAnalyticsQuerySchema),
	getReportCycleTimeDistribution,
);
router.get(
	"/report-technician-ranking",
	authorize(...INTERNAL_ROLES),
	validateQuery(ReportAnalyticsQuerySchema),
	getReportTechnicianRanking,
);
router.get(
	"/billing-vs-cost",
	authorize(...INTERNAL_ROLES),
	validateQuery(ReportAnalyticsQuerySchema),
	getBillingVsCost,
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
	validateBody(NoBodySchema),
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
	validateBody(NoBodySchema),
	markAllNotificationsAsRead,
);

export default router;
