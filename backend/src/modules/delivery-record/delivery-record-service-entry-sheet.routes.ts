import { INTERNAL_ROLES } from "@cermont/domain";
import { CreateOrderServiceEntrySheetSchema, ObjectIdSchema } from "@cermont/shared-types";
import { Router } from "express";
import { z } from "zod";
import * as WorkflowController from "../order/administrative-workflow.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";

const router = Router();
const DeliveryRecordIdParamsSchema = z.object({ id: ObjectIdSchema }).strict();

router.use(authenticate);

router.get(
	"/:id/service-entry-sheet",
	authorize(...INTERNAL_ROLES),
	validateParams(DeliveryRecordIdParamsSchema),
	WorkflowController.getServiceEntrySheetByDeliveryRecord,
);

router.post(
	"/:id/service-entry-sheet",
	authorize("gerente", "residente", "administrativo"),
	validateParams(DeliveryRecordIdParamsSchema),
	validateBody(CreateOrderServiceEntrySheetSchema),
	WorkflowController.createServiceEntrySheetFromDeliveryRecord,
);

export default router;
