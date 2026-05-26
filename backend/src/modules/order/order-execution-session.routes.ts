import { INTERNAL_ROLES } from "@cermont/domain";
import {
	CreateOrderExecutionSessionSchema,
	OrderExecutionSessionParamsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import * as ExecutionSessionController from "../../modules/execution-session/execution-session.controller";

const router = Router();

router.get(
	"/:id/execution-session",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(OrderExecutionSessionParamsSchema),
	ExecutionSessionController.getExecutionSessionByOrder,
);

router.post(
	"/:id/execution-session",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(OrderExecutionSessionParamsSchema),
	validateBody(CreateOrderExecutionSessionSchema),
	ExecutionSessionController.createExecutionSessionForOrder,
);

export default router;
