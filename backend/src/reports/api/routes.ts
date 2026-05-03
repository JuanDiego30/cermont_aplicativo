import {
	CreateWorkReportSchema,
	ListReportsQuerySchema,
	ReportBulkEvidenceZipSchema,
	ReportIdSchema,
	ReportOrderIdSchema,
	ReportRejectSchema,
	ReportTemplateSettingsSchema,
	UpdateWorkReportSchema,
} from "@cermont/shared-types";
import { env } from "@cermont/shared-types/config";
import { APPROVER_ROLES, INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import {
	authorize,
	authorizeAllAuthenticated,
} from "../../_shared/middlewares/authorize.middleware";
import { deprecatedRoute } from "../../_shared/middlewares/deprecation.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import * as ReportController from "./controller";

const router = Router();
const reportArchiveEnabled = env.REPORT_ARCHIVE_ENABLED;
const legacySunset = "Wed, 30 Sep 2026 23:59:59 GMT";

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListReportsQuerySchema),
	ReportController.listReports,
);

// GET /api/reports/pipeline — Orders without approved work reports
router.get("/pipeline", authorize(...INTERNAL_ROLES), ReportController.getReportPipeline);

// GET /api/reports/stats/monthly — Monthly report statistics
router.get("/stats/monthly", authorize(...INTERNAL_ROLES), ReportController.getReportMonthlyStats);

router.get(
	"/order/:orderId",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.getReportByOrderId,
);

router.post(
	"/order/:orderId/sync",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.syncReportByOrderId,
);

// ── Report Settings (Catalog) ──────────────────────────────

router.get("/settings/template", authorizeAllAuthenticated(), ReportController.getTemplateSettings);

router.patch(
	"/settings/template",
	authorize("manager", "administrator"),
	validateBody(ReportTemplateSettingsSchema),
	ReportController.updateTemplateSettings,
);

router.get(
	"/order/:orderId/pdf",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.generateReportPdf,
);
router.get(
	"/order/:orderId/evidences/zip",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.downloadEvidenceZip,
);
router.post(
	"/evidences/bulk-zip",
	authorize(...INTERNAL_ROLES),
	validateBody(ReportBulkEvidenceZipSchema),
	ReportController.downloadBulkEvidenceZip,
);

router.post(
	"/",
	authorize("manager", "resident_engineer", "hse_coordinator", "supervisor"),
	validateBody(CreateWorkReportSchema),
	ReportController.createReport,
);

router.patch(
	"/:id",
	authorize("manager", "resident_engineer", "hse_coordinator", "supervisor"),
	validateParams(ReportIdSchema),
	validateBody(UpdateWorkReportSchema),
	ReportController.updateReport,
);

/** @deprecated Use POST /api/reports/:id/close. Retirement date: 2026-09-30. */
router.patch(
	"/:id/approve",
	authorize(...APPROVER_ROLES),
	deprecatedRoute({
		successor: "/api/reports/:id/close",
		sunset: legacySunset,
	}),
	validateParams(ReportIdSchema),
	ReportController.approveReport,
);

// Canonical P0 endpoint for closing a report.
router.post(
	"/:id/close",
	authorize(...APPROVER_ROLES),
	validateParams(ReportIdSchema),
	ReportController.closeReport,
);

router.patch(
	"/:id/reject",
	authorize(...APPROVER_ROLES),
	validateParams(ReportIdSchema),
	validateBody(ReportRejectSchema),
	ReportController.rejectReport,
);

// Legacy compatibility endpoints
if (reportArchiveEnabled) {
	router.get("/archive", authorize(...INTERNAL_ROLES), ReportController.getReportArchivePeriods);
	router.get(
		"/archive/:period/download",
		authorize(...INTERNAL_ROLES),
		ReportController.downloadReportArchiveByPeriod,
	);
}

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportIdSchema),
	ReportController.getReportById,
);
/** @deprecated Use POST /api/reports/:id/close. Retirement date: 2026-09-30. */
router.patch(
	"/:id/status",
	authorize("manager", "resident_engineer", "hse_coordinator", "supervisor"),
	deprecatedRoute({
		successor: "/api/reports/:id/close",
		sunset: legacySunset,
	}),
	validateParams(ReportIdSchema),
	validateBody(UpdateWorkReportSchema),
	ReportController.updateReportStatus,
);
router.delete(
	"/:id",
	authorize("manager"),
	validateParams(ReportIdSchema),
	ReportController.deleteOrder,
);

export default router;
