import { ADMIN_ROLES, BILLING_ACCESS_ROLES, FINANCE_ACCESS_ROLES } from "@cermont/domain";
import {
	DianConfigurationInputSchema,
	DianInvoiceParamsSchema,
	DianReportQuerySchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import { DianController } from "./dian.controller";

const router = Router();

router.use(authenticate);

router.get("/config", authorize(...ADMIN_ROLES), DianController.getConfiguration);
router.put(
	"/config",
	authorize(...ADMIN_ROLES),
	validateBody(DianConfigurationInputSchema),
	DianController.upsertConfiguration,
);
router.post(
	"/send/:invoiceId",
	authorize(...FINANCE_ACCESS_ROLES),
	validateParams(DianInvoiceParamsSchema),
	DianController.sendInvoice,
);
router.get(
	"/status/:invoiceId",
	authorize(...BILLING_ACCESS_ROLES),
	validateParams(DianInvoiceParamsSchema),
	DianController.checkInvoiceStatus,
);
router.get(
	"/report",
	authorize(...FINANCE_ACCESS_ROLES),
	validateQuery(DianReportQuerySchema),
	DianController.getReport,
);

export default router;
