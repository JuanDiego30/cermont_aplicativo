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
	RegisterEquipmentCostSchema,
	RegisterLaborCostSchema,
	RegisterMaterialCostSchema,
	RegisterSubcontractorCostSchema,
	RegisterTaxCostSchema,
	RegisterTransportCostSchema,
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

// ── F22: Baseline, registration, and variance endpoints ────────────────

// POST /api/costs/baseline/:proposalId — Freeze cost baseline on proposal approval
router.post(
	"/baseline/:proposalId",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	CostController.freezeBaseline,
);

// POST /api/costs/register/labor — Register labor cost
router.post(
	"/register/labor",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterLaborCostSchema),
	CostController.registerLaborCost,
);

// POST /api/costs/register/material — Register material cost
router.post(
	"/register/material",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterMaterialCostSchema),
	CostController.registerMaterialCost,
);

// POST /api/costs/register/equipment — Register equipment cost
router.post(
	"/register/equipment",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterEquipmentCostSchema),
	CostController.registerEquipmentCost,
);

// POST /api/costs/register/transport — Register transport cost
router.post(
	"/register/transport",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterTransportCostSchema),
	CostController.registerTransportCost,
);

// POST /api/costs/register/subcontractor — Register subcontractor cost
router.post(
	"/register/subcontractor",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterSubcontractorCostSchema),
	CostController.registerSubcontractorCost,
);

// POST /api/costs/register/tax — Register tax cost
router.post(
	"/register/tax",
	authenticate,
	authorize(...costAccessRoles),
	validateBody(RegisterTaxCostSchema),
	CostController.registerTaxCost,
);

// GET /api/costs/variance/:serviceCaseId — Calculate variance report
router.get(
	"/variance/:serviceCaseId",
	authenticate,
	authorize(...costAccessRoles),
	CostController.getCalculateVariance,
);

// GET /api/costs/dashboard/:serviceCaseId — Full cost dashboard per service case
router.get(
	"/dashboard/:serviceCaseId",
	authenticate,
	authorize(...costAccessRoles),
	CostController.getServiceCaseCostDashboard,
);

export default router;
