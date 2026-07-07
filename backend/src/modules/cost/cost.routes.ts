import {
	MANAGEMENT_ROLES,
	REPORTING_ACCESS_ROLES,
	TECHNICAL_EXECUTION_ROLES,
} from "@cermont/domain";
/**
 * Cost Routes
 * DOC-10 §8
 */

import {
	CostIdSchema,
	CostOrderIdSchema,
	CreateCostCatalogItemSchema,
	CreateCostSchema,
	ListCostCatalogQuerySchema,
	ListCostsQuerySchema,
	UpdateCostSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as CostController from "./cost.controller";

const router = Router();

const costAccessRoles = [...new Set([...REPORTING_ACCESS_ROLES, ...TECHNICAL_EXECUTION_ROLES])];

// GET /api/costs
router.get(
	"/",
	authenticate,
	authorize(...costAccessRoles),
	validateQuery(ListCostsQuerySchema),
	CostController.listCosts,
);

// GET /api/costs/dashboard
router.get(
	"/dashboard",
	authenticate,
	authorize(...costAccessRoles),
	CostController.getCostDashboard,
);

// GET /api/costs/catalog — Spec-015 cost catalog listing
router.get(
	"/catalog",
	authenticate,
	authorize(...costAccessRoles),
	validateQuery(ListCostCatalogQuerySchema),
	CostController.getCostCatalog,
);

// POST /api/costs/catalog — Spec-015 create catalog item (management + residente)
router.post(
	"/catalog",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateCostCatalogItemSchema),
	CostController.createCostCatalogItem,
);

// GET /api/costs/:orderId/intelligence — Spec-015 baseline vs actual intelligence
router.get(
	"/:orderId/intelligence",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostOrderIdSchema),
	CostController.getCostIntelligence,
);

// GET /api/costs/order/:orderId (canonical P0)
router.get(
	"/order/:orderId",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostOrderIdSchema),
	validateQuery(ListCostsQuerySchema),
	CostController.getCostsByOrder,
);

// GET /api/costs/order/:orderId/summary (canonical P0)
router.get(
	"/order/:orderId/summary",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostOrderIdSchema),
	CostController.getCostSummary,
);

// Legacy compatibility alias (deprecated): use GET /api/costs/order/:orderId/summary
router.get(
	"/summary/:orderId",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostOrderIdSchema),
	CostController.getCostSummary,
);

// GET /api/costs/:id
router.get(
	"/:id",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostIdSchema),
	CostController.getCostById,
);

// POST /api/costs
router.post(
	"/",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(CreateCostSchema),
	CostController.createCost,
);

// PATCH /api/costs/:id
router.patch(
	"/:id",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostIdSchema),
	validateBody(UpdateCostSchema),
	CostController.updateCost,
);

// DELETE /api/costs/:id
router.delete(
	"/:id",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostIdSchema),
	CostController.deleteCost,
);

// POST /api/costs/order/:orderId/items — Create cost item scoped to order
router.post(
	"/order/:orderId/items",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostOrderIdSchema),
	validateBody(CreateCostSchema),
	CostController.createCostItemForOrder,
);

// PATCH /api/costs/items/:id — Update cost item (alias for PATCH /:id)
router.patch(
	"/items/:id",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostIdSchema),
	validateBody(UpdateCostSchema),
	CostController.updateCost,
);

// DELETE /api/costs/items/:id — Delete cost item (alias for DELETE /:id)
router.delete(
	"/items/:id",
	authenticate,
	authorize(...costAccessRoles),
	validateParams(CostIdSchema),
	CostController.deleteCost,
);

export default router;
