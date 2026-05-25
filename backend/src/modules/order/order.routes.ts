/**
 * Order Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams, validateQuery via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 *
 * Note: "Todos" (all roles) means all authenticated users.
 * The service layer enforces finer domain rules.
 */

import {
	AssignOrderSchema,
	CreateOrderSchema,
	OrderIdSchema,
	OrderListQuerySchema,
	TransitionOrderStatusSchema,
	UpdateOrderSchema,
	UpdateOrderStatusSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import * as OrderController from "./order.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const router = Router();

/**
 * GET /api/orders
 * List all orders (paginated, filtered)
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/",
	authenticate,
	validateQuery(OrderListQuerySchema),
	// Note: All roles can list, but service may filter visibility
	OrderController.listOrders,
);

/**
 * POST /api/orders
 * Create a new order
 * Roles: GER, RES, SUP
 * Validation: CreateOrderSchema
 */
router.post(
	"/",
	authenticate,
	authorize("gerente", "residente", "hes"),
	validateBody(CreateOrderSchema),
	OrderController.createOrder,
);

/**
 * GET /api/orders/role/:role
 * Note: This would need explicit route if filtering by role is desired
 * For now, use query parameter instead
 */

/**
 * GET /api/orders/:id
 * Get order by ID
 * Roles: Todos (all authenticated users)
 * Validation: OrderIdSchema (params)
 */
router.get("/:id", authenticate, validateParams(OrderIdSchema), OrderController.getOrder);

/**
 * PUT /api/orders/:id
 * Update order (description, location, priority, observations)
 * Roles: GER, RES, SUP
 * Validation: OrderIdSchema (params), partial UpdateOrderSchema (body)
 */
router.put(
	"/:id",
	authenticate,
	authorize("gerente", "residente", "hes", "supervisor"),
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderSchema),
	OrderController.updateOrder,
);

/**
 * PATCH /api/orders/:id/status
 * Change order status (state transition with fine-grained validation in service)
 * Roles: Todos (but service validates role permissions per transition)
 * Validation: UpdateOrderStatusSchema
 */
router.patch(
	"/:id/status",
	authenticate,
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderStatusSchema),
	OrderController.updateOrderStatus,
);

/**
 * PATCH /api/orders/:id/transition
 * Nuevo endpoint recomendado para transición de estado
 * (mantiene compatibilidad con payload legado `status`)
 */
router.patch(
	"/:id/transition",
	authenticate,
	validateParams(OrderIdSchema),
	validateBody(TransitionOrderStatusSchema),
	OrderController.transitionOrderStatus,
);

/**
 * PATCH /api/orders/:id/assign
 * Assign order to a technician/operator
 * Roles: GER, RES, SUP
 * Validation: OrderIdSchema (params), AssignOrderSchema (body)
 */
router.patch(
	"/:id/assign",
	authenticate,
	authorize("gerente", "residente", "hes"),
	validateParams(OrderIdSchema),
	validateBody(AssignOrderSchema),
	OrderController.assignOrder,
);

/**
 * DELETE /api/orders/:id
 * Soft delete order (mark as cancelled)
 * Roles: GER (only gerente can delete)
 * Validation: OrderIdSchema (params)
 */
router.delete(
	"/:id",
	authenticate,
	authorize("gerente"),
	validateParams(OrderIdSchema),
	OrderController.deleteOrder,
);

/**
 * GET /api/orders/:id/report
 * Get order report (PDF generation)
 * Roles: GER, RES, HES, ADM
 * Validation: OrderIdSchema (params)
 */
router.get(
	"/:id/report",
	authenticate,
	authorize("gerente", "residente", "hes", "administrativo"),
	validateParams(OrderIdSchema),
	OrderController.getOrderReport,
);

export default router;
