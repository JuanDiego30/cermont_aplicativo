import { INTERNAL_ROLES } from "@cermont/domain";
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
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();
const AttachEvidenceSchema = z.object({ evidenceId: ObjectIdSchema }).strict();
const AttachDocumentSchema = z.object({ documentId: ObjectIdSchema }).strict();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListTechnicalReportsQuerySchema),
	WorkflowController.listTechnicalReports,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(TechnicalReportIdParamsSchema),
	WorkflowController.getTechnicalReport,
);

router.post(
	"/:id/generate",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(GenerateTechnicalReportSchema),
	WorkflowController.generateTechnicalReport,
);

router.patch(
	"/:id",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(GenerateTechnicalReportSchema),
	WorkflowController.updateTechnicalReport,
);

router.post(
	"/:id/submit",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(ApproveTechnicalReportSchema),
	WorkflowController.submitTechnicalReport,
);

router.post(
	"/:id/approve",
	authorize("gerente", "residente"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(ApproveTechnicalReportSchema),
	WorkflowController.approveTechnicalReport,
);

router.post(
	"/:id/reject",
	authorize("gerente", "residente"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(RejectTechnicalReportSchema),
	WorkflowController.rejectTechnicalReport,
);

router.post(
	"/:id/cancel",
	authorize("gerente", "residente"),
	validateParams(TechnicalReportIdParamsSchema),
	WorkflowController.cancelTechnicalReport,
);

router.post(
	"/:id/archive",
	authorize("gerente", "residente"),
	validateParams(TechnicalReportIdParamsSchema),
	WorkflowController.cancelTechnicalReport,
);

router.post(
	"/:id/evidences",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachEvidenceSchema),
	WorkflowController.attachTechnicalReportEvidence,
);

router.post(
	"/:id/documents",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachDocumentSchema),
	WorkflowController.attachTechnicalReportDocument,
);

router.post(
	"/:id/generated-document",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(TechnicalReportIdParamsSchema),
	validateBody(AttachDocumentSchema),
	WorkflowController.attachTechnicalReportDocument,
);

export default router;
