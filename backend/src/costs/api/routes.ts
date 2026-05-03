/**
 * Cost Routes
 * DOC-10 §8
 */

import {
	CostIdSchema,
	CostOrderIdSchema,
	CreateCostSchema,
	CreateTariffSchema,
	ListCostsQuerySchema,
	TariffIdSchema,
	UpdateCostControlSchema,
	UpdateCostSchema,
	UpdateTariffSchema,
} from "@cermont/shared-types";
import { INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { deprecatedRoute } from "../../_shared/middlewares/deprecation.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import * as CostController from "./controller";

const router = Router();
const legacySunset = "Wed, 30 Sep 2026 23:59:59 GMT";

const allowedRoles = [
	"manager",
	"resident_engineer",
	"supervisor",
	"administrator",
	"technician",
] as const;

// GET /api/costs/dashboard — Cross-order cost summary
router.get(
	"/dashboard",
	authenticate,
	authorize(...INTERNAL_ROLES),
	CostController.getCostDashboard,
);

router.get(
	"/tariffs",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	CostController.listTariffs,
);

router.post(
	"/tariffs",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(CreateTariffSchema),
	CostController.createTariff,
);

router.patch(
	"/tariffs/:id",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(TariffIdSchema),
	validateBody(UpdateTariffSchema),
	CostController.updateTariff,
);

router.post(
	"/calculate-labor/:orderId",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(CostOrderIdSchema),
	CostController.calculateLaborCost,
);

// GET /api/costs
router.get(
	"/",
	authenticate,
	authorize(...allowedRoles),
	validateQuery(ListCostsQuerySchema),
	CostController.listCosts,
);

// GET /api/costs/order/:orderId (canonical P0)
router.get(
	"/order/:orderId",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostOrderIdSchema),
	validateQuery(ListCostsQuerySchema),
	CostController.getCostsByOrder,
);

// GET /api/costs/order/:orderId/summary (canonical P0)
router.get(
	"/order/:orderId/summary",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostOrderIdSchema),
	CostController.getCostSummary,
);

// GET /api/costs/order/:orderId/control — Budget baseline (CostControl)
router.get(
	"/order/:orderId/control",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostOrderIdSchema),
	CostController.getOrderCostControl,
);

router.patch(
	"/order/:orderId/control",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	validateParams(CostOrderIdSchema),
	validateBody(UpdateCostControlSchema),
	CostController.updateOrderCostControl,
);

// Legacy compatibility alias (deprecated): use GET /api/costs/order/:orderId/summary
router.get(
	"/summary/:orderId",
	authenticate,
	authorize(...allowedRoles),
	deprecatedRoute({
		successor: "/api/costs/order/:orderId/summary",
		sunset: legacySunset,
	}),
	validateParams(CostOrderIdSchema),
	CostController.getCostSummary,
);

// GET /api/costs/:id
router.get(
	"/:id",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostIdSchema),
	CostController.getCostById,
);

// POST /api/costs
router.post(
	"/",
	authenticate,
	authorize(...allowedRoles),
	validateBody(CreateCostSchema),
	CostController.createCost,
);

// PATCH /api/costs/:id
router.patch(
	"/:id",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostIdSchema),
	validateBody(UpdateCostSchema),
	CostController.updateCost,
);

// DELETE /api/costs/:id
router.delete(
	"/:id",
	authenticate,
	authorize(...allowedRoles),
	validateParams(CostIdSchema),
	CostController.deleteCost,
);

export default router;
