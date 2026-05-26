import { env } from "@cermont/config";
import { APPROVER_ROLES, INTERNAL_ROLES } from "@cermont/domain";
import {
	CreateWorkReportSchema,
	ListReportsQuerySchema,
	ReportIdSchema,
	ReportOrderIdSchema,
	ReportRejectSchema,
	UpdateWorkReportSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ReportController from "./report.controller";

const router = Router();
const reportArchiveEnabled = env.REPORT_ARCHIVE_ENABLED === true;

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListReportsQuerySchema),
	ReportController.listReports,
);

router.get(
	"/order/:orderId",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.getReportByOrderId,
);

router.get(
	"/order/:orderId/pdf",
	authorize(...INTERNAL_ROLES),
	validateParams(ReportOrderIdSchema),
	ReportController.generateReportPdf,
);

router.post(
	"/",
	authorize("gerente", "residente", "hes", "supervisor"),
	validateBody(CreateWorkReportSchema),
	ReportController.createReport,
);

router.patch(
	"/:id",
	authorize("gerente", "residente", "hes", "supervisor"),
	validateParams(ReportIdSchema),
	validateBody(UpdateWorkReportSchema),
	ReportController.updateReport,
);

/** @deprecated Use POST /api/reports/:id/close. Retirement date: 2026-09-30. */
router.patch(
	"/:id/approve",
	authorize(...APPROVER_ROLES),
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
	authorize("gerente", "residente", "hes", "supervisor"),
	validateParams(ReportIdSchema),
	validateBody(UpdateWorkReportSchema),
	ReportController.updateReportStatus,
);
router.delete(
	"/:id",
	authorize("gerente"),
	validateParams(ReportIdSchema),
	ReportController.deleteReport,
);

export default router;
