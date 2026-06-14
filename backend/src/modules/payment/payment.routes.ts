import { ADMIN_PLUS_RESIDENTE, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	InvoiceIdParamsSchema,
	ListPaymentsQuerySchema,
	PaymentIdParamsSchema,
	ReconcilePaymentSchema,
	RegisterInvoicePaymentSchema,
	RejectPaymentRecordSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as WorkflowController from "../order/administrative-workflow.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListPaymentsQuerySchema),
	WorkflowController.listPayments,
);

router.post(
	"/from-invoice/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RegisterInvoicePaymentSchema),
	WorkflowController.registerPaymentForInvoice,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(PaymentIdParamsSchema),
	WorkflowController.getPayment,
);

router.post(
	"/:id/reconcile",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(PaymentIdParamsSchema),
	validateBody(ReconcilePaymentSchema),
	WorkflowController.reconcilePayment,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(PaymentIdParamsSchema),
	validateBody(RejectPaymentRecordSchema),
	WorkflowController.rejectPayment,
);

export default router;
