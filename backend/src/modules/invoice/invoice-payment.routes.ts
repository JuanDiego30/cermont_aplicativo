import { InvoiceIdParamsSchema, RegisterInvoicePaymentSchema } from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/:id/payment",
	authorize("gerente", "residente", "administrativo"),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RegisterInvoicePaymentSchema),
	WorkflowController.registerPaymentForInvoice,
);

export default router;
