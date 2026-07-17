import { CERMONT_ROLES } from "@cermont/domain";
import {
	ApproveInvoiceApprovalSchema,
	CorrectInvoiceApprovalSchema,
	InvoiceApprovalIdParamsSchema,
	ListInvoiceApprovalsQuerySchema,
	RejectInvoiceApprovalSchema,
	RequestInvoiceApprovalSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as ApprovalController from "./invoice-approval.controller";

const router = Router();

router.use(authenticate);

router.post(
	"/",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO),
	validateBody(RequestInvoiceApprovalSchema),
	ApprovalController.requestApproval,
);

router.post(
	"/:id/approve",
	authorize(CERMONT_ROLES.CLIENTE),
	validateParams(InvoiceApprovalIdParamsSchema),
	validateBody(ApproveInvoiceApprovalSchema),
	ApprovalController.approve,
);

router.post(
	"/:id/reject",
	authorize(CERMONT_ROLES.CLIENTE),
	validateParams(InvoiceApprovalIdParamsSchema),
	validateBody(RejectInvoiceApprovalSchema),
	ApprovalController.reject,
);

router.post(
	"/:id/correct",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO),
	validateParams(InvoiceApprovalIdParamsSchema),
	validateBody(CorrectInvoiceApprovalSchema),
	ApprovalController.correct,
);

router.get(
	"/",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO, CERMONT_ROLES.CLIENTE),
	validateQuery(ListInvoiceApprovalsQuerySchema),
	ApprovalController.list,
);

router.get(
	"/:id",
	authorize(CERMONT_ROLES.GERENTE, CERMONT_ROLES.ADMINISTRATIVO, CERMONT_ROLES.CLIENTE),
	validateParams(InvoiceApprovalIdParamsSchema),
	ApprovalController.getById,
);

export default router;
