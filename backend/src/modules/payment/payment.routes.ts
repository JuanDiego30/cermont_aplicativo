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
import * as PaymentController from "./payment.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListPaymentsQuerySchema),
	PaymentController.listPayments,
);

router.post(
	"/from-invoice/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RegisterInvoicePaymentSchema),
	PaymentController.registerPaymentForInvoice,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(PaymentIdParamsSchema),
	PaymentController.getPayment,
);

router.post(
	"/:id/reconcile",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(PaymentIdParamsSchema),
	validateBody(ReconcilePaymentSchema),
	PaymentController.reconcilePayment,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(PaymentIdParamsSchema),
	validateBody(RejectPaymentRecordSchema),
	PaymentController.rejectPayment,
);

export default router;
