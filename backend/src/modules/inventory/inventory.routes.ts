/**
 * Inventory Routes — /api/inventory
 *
 * Order: authenticate → authorize → validate → controller
 */

import { INTERNAL_ROLES, MAINTENANCE_MANAGEMENT_ROLES } from "@cermont/domain";
import {
	CreateInventoryItemSchema,
	InventoryItemIdParamsSchema,
	ListInventoryQuerySchema,
	RegisterStockMovementSchema,
	UpdateInventoryItemSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as InventoryController from "./inventory.controller";

const router = Router();

router.use(authenticate);

// GET /api/inventory — catalog with filters (must come before /:id)
router.get(
	"/",
	authorize(...INTERNAL_ROLES),
	validateQuery(ListInventoryQuerySchema),
	InventoryController.listItems,
);

// GET /api/inventory/low-stock — items at or below minimum stock
router.get("/low-stock", authorize(...INTERNAL_ROLES), InventoryController.getLowStockItems);

// GET /api/inventory/:id — item detail
router.get(
	"/:id",
	authorize(...INTERNAL_ROLES),
	validateParams(InventoryItemIdParamsSchema),
	InventoryController.getItem,
);

// GET /api/inventory/:id/movements — movement history
router.get(
	"/:id/movements",
	authorize(...INTERNAL_ROLES),
	validateParams(InventoryItemIdParamsSchema),
	InventoryController.getItemMovements,
);

// POST /api/inventory — create item
router.post(
	"/",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateBody(CreateInventoryItemSchema),
	InventoryController.createItem,
);

// PATCH /api/inventory/:id — update item metadata
router.patch(
	"/:id",
	authorize(...MAINTENANCE_MANAGEMENT_ROLES),
	validateParams(InventoryItemIdParamsSchema),
	validateBody(UpdateInventoryItemSchema),
	InventoryController.updateItem,
);

// POST /api/inventory/:id/movements — register stock movement
router.post(
	"/:id/movements",
	authorize(...INTERNAL_ROLES),
	validateParams(InventoryItemIdParamsSchema),
	validateBody(RegisterStockMovementSchema),
	InventoryController.registerMovement,
);

export default router;
