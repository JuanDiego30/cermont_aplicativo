import { REPORT_ROLES } from "@cermont/domain";
import { AnalyticsReportFilterSchema, AnalyticsReportParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import { AnalyticsReportController } from "./analytics-report.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/kpi",
	authorize(...REPORT_ROLES),
	validateQuery(AnalyticsReportFilterSchema),
	AnalyticsReportController.getOperationalKPI,
);

router.post(
	"/:domain",
	authorize(...REPORT_ROLES),
	validateParams(AnalyticsReportParamsSchema),
	validateBody(AnalyticsReportFilterSchema),
	AnalyticsReportController.generateCustomReport,
);

router.get(
	"/:domain/export",
	authorize(...REPORT_ROLES),
	validateParams(AnalyticsReportParamsSchema),
	validateQuery(AnalyticsReportFilterSchema),
	AnalyticsReportController.exportCSV,
);

router.post(
	"/:domain/export",
	authorize(...REPORT_ROLES),
	validateParams(AnalyticsReportParamsSchema),
	validateBody(AnalyticsReportFilterSchema),
	AnalyticsReportController.exportCSVJson,
);

export default router;
