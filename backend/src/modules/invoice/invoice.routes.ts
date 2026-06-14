import { ADMIN_PLUS_RESIDENTE, INTERNAL_ROLES, MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateOrderInvoiceSchema,
	InvoiceIdParamsSchema,
	ListInvoicesQuerySchema,
	RejectServiceEntrySheetSchema,
	ServiceEntrySheetIdParamsSchema,
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
	validateQuery(ListInvoicesQuerySchema),
	WorkflowController.listInvoices,
);

router.post(
	"/from-service-entry-sheet/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(CreateOrderInvoiceSchema),
	WorkflowController.createInvoiceFromServiceEntrySheet,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.getInvoice,
);

router.post(
	"/:id/submit",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.submitInvoice,
);

router.post(
	"/:id/approve",
	authorize(...MANAGEMENT_ROLES),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.approveInvoice,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RejectServiceEntrySheetSchema),
	WorkflowController.rejectInvoice,
);

router.post(
	"/:id/cancel",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.cancelInvoice,
);

export default router;
