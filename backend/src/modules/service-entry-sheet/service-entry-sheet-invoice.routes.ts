import { CreateOrderInvoiceSchema, ServiceEntrySheetIdParamsSchema } from "@cermont/shared-types";
import { Router } from "express";
import * as WorkflowController from "../order/administrative-workflow.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";

const router = Router();

router.use(authenticate);

router.post(
	"/:id/invoice",
	authorize("gerente", "residente", "administrativo"),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(CreateOrderInvoiceSchema),
	WorkflowController.createInvoiceFromServiceEntrySheet,
);

export default router;
