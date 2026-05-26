/**
 * Cost Routes
 * DOC-10 §8
 */

import {
	CostIdSchema,
	CostOrderIdSchema,
	CreateCostSchema,
	ListCostsQuerySchema,
	UpdateCostSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as CostController from "./cost.controller";

const router = Router();

const allowedRoles = ["gerente", "hes", "supervisor", "tecnico"] as const;

// GET /api/costs
router.get(
	"/",
	authenticate,
	authorize(...allowedRoles),
	validateQuery(ListCostsQuerySchema),
	CostController.listCosts,
);

// GET /api/costs/dashboard
router.get("/dashboard", authenticate, authorize(...allowedRoles), CostController.getCostDashboard);

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

// Legacy compatibility alias (deprecated): use GET /api/costs/order/:orderId/summary
router.get(
	"/summary/:orderId",
	authenticate,
	authorize(...allowedRoles),
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
