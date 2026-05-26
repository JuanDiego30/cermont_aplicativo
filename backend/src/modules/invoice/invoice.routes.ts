import { INTERNAL_ROLES } from "@cermont/domain";
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
	authorize("gerente", "residente", "administrativo"),
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
	authorize("gerente", "residente", "administrativo"),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.submitInvoice,
);

router.post(
	"/:id/approve",
	authorize("gerente", "residente"),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.approveInvoice,
);

router.post(
	"/:id/reject",
	authorize("gerente", "residente"),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RejectServiceEntrySheetSchema),
	WorkflowController.rejectInvoice,
);

router.post(
	"/:id/cancel",
	authorize("gerente", "residente", "administrativo"),
	validateParams(InvoiceIdParamsSchema),
	WorkflowController.cancelInvoice,
);

export default router;
