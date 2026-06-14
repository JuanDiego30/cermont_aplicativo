import { ADMIN_PLUS_RESIDENTE } from "@cermont/domain";
import { CreateOrderInvoiceSchema, ServiceEntrySheetIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/:id/invoice",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(CreateOrderInvoiceSchema),
	WorkflowController.createInvoiceFromServiceEntrySheet,
);

export default router;
