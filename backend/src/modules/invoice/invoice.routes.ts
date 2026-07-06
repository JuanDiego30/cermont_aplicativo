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
import * as InvoiceController from "./invoice.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListInvoicesQuerySchema),
	InvoiceController.listInvoices,
);

router.post(
	"/from-service-entry-sheet/:id",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(ServiceEntrySheetIdParamsSchema),
	validateBody(CreateOrderInvoiceSchema),
	InvoiceController.createInvoiceFromServiceEntrySheet,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(InvoiceIdParamsSchema),
	InvoiceController.getInvoice,
);

router.post(
	"/:id/submit",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	InvoiceController.submitInvoice,
);

router.post(
	"/:id/approve",
	authorize(...MANAGEMENT_ROLES),
	validateParams(InvoiceIdParamsSchema),
	InvoiceController.approveInvoice,
);

router.post(
	"/:id/reject",
	authorize(...MANAGEMENT_ROLES),
	validateParams(InvoiceIdParamsSchema),
	validateBody(RejectServiceEntrySheetSchema),
	InvoiceController.rejectInvoice,
);

router.post(
	"/:id/cancel",
	authorize(...ADMIN_PLUS_RESIDENTE),
	validateParams(InvoiceIdParamsSchema),
	InvoiceController.cancelInvoice,
);

export default router;
