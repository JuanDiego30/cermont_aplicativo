import { INTERNAL_ROLES } from "@cermont/domain";
import { CreateTechnicalReportSchema, ExecutionSessionIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import * as WorkflowController from "../order/administrative-workflow.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";

const router = Router();

router.use(authenticate);

router.get(
	"/:id/technical-report",
	authorize(...INTERNAL_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	WorkflowController.getTechnicalReportByExecutionSession,
);

router.post(
	"/:id/technical-report",
	authorize("gerente", "residente", "supervisor", "tecnico"),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CreateTechnicalReportSchema),
	WorkflowController.createTechnicalReportFromExecutionSession,
);

export default router;
