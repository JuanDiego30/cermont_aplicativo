import { INTERNAL_ROLES, TECHNICAL_EXECUTION_ROLES } from "@cermont/domain";
import { CreateTechnicalReportSchema, ExecutionSessionIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

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
	authorize(...TECHNICAL_EXECUTION_ROLES),
	validateParams(ExecutionSessionIdParamsSchema),
	validateBody(CreateTechnicalReportSchema),
	WorkflowController.createTechnicalReportFromExecutionSession,
);

export default router;
