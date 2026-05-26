import { INTERNAL_ROLES } from "@cermont/domain";
import {
	ListPurchaseOrdersQuerySchema,
	PurchaseOrderIdParamsSchema,
	RegisterPurchaseOrderSchema,
	RejectPurchaseOrderSchema,
	ValidatePurchaseOrderSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as POController from "./purchase-order.controller";

const router = Router();

router.use(authenticate);

router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListPurchaseOrdersQuerySchema),
	POController.list,
);

router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(PurchaseOrderIdParamsSchema),
	POController.getById,
);

router.post(
	"/",
	authorize("gerente", "residente", "administrativo"),
	validateBody(RegisterPurchaseOrderSchema),
	POController.register,
);

router.post(
	"/:id/validate",
	authorize("gerente", "residente"),
	validateParams(PurchaseOrderIdParamsSchema),
	validateBody(ValidatePurchaseOrderSchema),
	POController.validate,
);

router.post(
	"/:id/reject",
	authorize("gerente", "residente"),
	validateParams(PurchaseOrderIdParamsSchema),
	validateBody(RejectPurchaseOrderSchema),
	POController.reject,
);

export default router;
