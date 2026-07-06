import { INTERNAL_ROLES, MANAGEMENT_ROLES, TECHNICAL_EXECUTION_ROLES } from "@cermont/domain";
import {
	ApproveTechnicalReportSchema,
	GenerateTechnicalReportSchema,
	ListTechnicalReportsQuerySchema,
	ObjectIdSchema,
	RejectTechnicalReportSchema,
	TechnicalReportIdParamsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as TechnicalReportController from "./technical-report.controller";

const router = Router();
const AttachEvidenceSchema = z.object({ evidenceId: ObjectIdSchema }).strict();
const AttachDocumentSchema = z.object({ documentId: ObjectIdSchema }).strict();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListTechnicalReportsQuerySchema),
	TechnicalReportController.listTechnicalReports,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	TechnicalReportController.getTechnicalReport,
);

router.post(
	"/:id/generate",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(GenerateTechnicalReportSchema),
	TechnicalReportController.generateTechnicalReport,
);

router.patch(
	"/:id",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(GenerateTechnicalReportSchema),
	TechnicalReportController.updateTechnicalReport,
);

router.post(
	"/:id/submit",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(ApproveTechnicalReportSchema),
	TechnicalReportController.submitTechnicalReport,
);

router.post(
	"/:id/approve",
	authorize(...MANAGEMENT_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(ApproveTechnicalReportSchema),
	TechnicalReportController.approveTechnicalReport,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(RejectTechnicalReportSchema),
	TechnicalReportController.rejectTechnicalReport,
);

router.post(
	"/:id/cancel",
	authorize(...MANAGEMENT_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	TechnicalReportController.cancelTechnicalReport,
);

router.post(
	"/:id/archive",
	authorize(...MANAGEMENT_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	TechnicalReportController.cancelTechnicalReport,
);

router.post(
	"/:id/evidences",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachEvidenceSchema),
	TechnicalReportController.attachTechnicalReportEvidence,
);

router.post(
	"/:id/documents",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachDocumentSchema),
	TechnicalReportController.attachTechnicalReportDocument,
);

router.post(
	"/:id/generated-document",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachDocumentSchema),
	TechnicalReportController.attachTechnicalReportDocument,
);

const AutoDraftServiceCaseIdSchema = z.object({ serviceCaseId: ObjectIdSchema }).strict();

// GET /api/reports/auto-draft/:serviceCaseId — Auto-generate report draft from service case data
router.get(
	"/auto-draft/:serviceCaseId",
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(AutoDraftServiceCaseIdSchema),
	TechnicalReportController.generateAutoDraftReport,
);

export default router;
