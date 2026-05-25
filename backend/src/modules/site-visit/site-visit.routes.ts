import {
	INTERNAL_ROLES,
	SITE_VISIT_CANCEL_ROLES,
	SITE_VISIT_EXECUTION_ROLES,
	SITE_VISIT_MANAGEMENT_ROLES,
} from "@cermont/domain";
import {
	CancelSiteVisitRecordSchema,
	CompleteSiteVisitRecordSchema,
	CreateSiteVisitRecordSchema,
	ListSiteVisitRecordsQuerySchema,
	SiteVisitRecordIdParamsSchema,
	StartSiteVisitRecordSchema,
	UpdateSiteVisitRecordSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import * as SiteVisitController from "./site-visit.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListSiteVisitRecordsQuerySchema),
	SiteVisitController.list,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(SiteVisitRecordIdParamsSchema),
	SiteVisitController.getById,
);

router.post(
	"/",
	authorize(...SITE_VISIT_MANAGEMENT_ROLES),
	validateBody(CreateSiteVisitRecordSchema),
	SiteVisitController.create,
);

router.patch(
	"/:id",
	authorize(...SITE_VISIT_MANAGEMENT_ROLES),
	validateParams(SiteVisitRecordIdParamsSchema),
	validateBody(UpdateSiteVisitRecordSchema),
	SiteVisitController.update,
);

router.post(
	"/:id/start",
	authorize(...SITE_VISIT_EXECUTION_ROLES),
	validateParams(SiteVisitRecordIdParamsSchema),
	validateBody(StartSiteVisitRecordSchema),
	SiteVisitController.start,
);

router.post(
	"/:id/complete",
	authorize(...SITE_VISIT_EXECUTION_ROLES),
	validateParams(SiteVisitRecordIdParamsSchema),
	validateBody(CompleteSiteVisitRecordSchema),
	SiteVisitController.complete,
);

router.post(
	"/:id/cancel",
	authorize(...SITE_VISIT_CANCEL_ROLES),
	validateParams(SiteVisitRecordIdParamsSchema),
	validateBody(CancelSiteVisitRecordSchema),
	SiteVisitController.cancel,
);

export default router;
