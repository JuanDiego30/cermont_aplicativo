import { INTERNAL_ROLES, SUPERVISORY_ROLES } from "@cermont/domain";
import { ObjectIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateParams } from "../../middlewares/validate";
import * as WorkflowController from "./administrative-workflow.controller";

const router = Router();
const OrderIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

router.use(authenticate);

router.post(
	"/:id/advance-step",
	authorize(...SUPERVISORY_ROLES),
	validateParams(OrderIdParamsSchema),
	WorkflowController.advanceServiceCaseByOrder,
);

router.get(
	"/:id/technical-report",
	authorize(...INTERNAL_ROLES),
	validateParams(OrderIdParamsSchema),
	WorkflowController.getTechnicalReportByOrder,
);

router.get(
	"/:id/delivery-record",
	authorize(...INTERNAL_ROLES),
	validateParams(OrderIdParamsSchema),
	WorkflowController.getDeliveryRecordByOrder,
);

export default router;
