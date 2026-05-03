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
	BatchAssignOrdersSchema,
	BatchCloseOrdersSchema,
	BatchMarkReadyForInvoicingSchema,
	BatchRegisterSesSchema,
	BatchUpdatePrioritySchema,
	BatchUpdateStatusSchema,
	CreateDeliveryRecordSchema,
	CreateOrderSchema,
	OrderIdSchema,
	OrderListQuerySchema,
	TransitionExecutionPhaseSchema,
	TransitionOrderStatusSchema,
	UpdateOrderBillingSchema,
	UpdateOrderPlanningSchema,
	UpdateOrderSchema,
	UpdateOrderStatusSchema,
	UpdatePreStartVerificationSchema,
} from "@cermont/shared-types";
import { INTERNAL_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import {
	authorize,
	authorizeAllAuthenticated,
} from "../../_shared/middlewares/authorize.middleware";
import { deprecatedRoute } from "../../_shared/middlewares/deprecation.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import {
	batchCloseOrdersHandler,
	batchMarkReadyHandler,
	batchRegisterSesHandler,
	createDeliveryRecordHandler,
	getBillingPipelineHandler,
	updateOrderBillingHandler,
} from "./billing.controller";
import * as OrderController from "./controller";

const router = Router();
const legacySunset = "Wed, 30 Sep 2026 23:59:59 GMT";

/**
 * GET /api/orders
 * List all orders (paginated, filtered)
 * Roles: Todos (all authenticated users)
 */
router.get(
	"/",
	authenticate,
	authorizeAllAuthenticated(),
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
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(CreateOrderSchema),
	OrderController.createOrder,
);

/**
 * GET /api/orders/role/:role
 * Note: This would need explicit route if filtering by role is desired
 * For now, use query parameter instead
 */

/**
 * GET /api/orders/billing-pipeline
 * Returns orders awaiting invoicing with aging metrics, grouped by client.
 * Roles: Internal roles only (GER, RES, HES, ADM, SUP, TEC)
 */
router.get(
	"/billing-pipeline",
	authenticate,
	authorize(...INTERNAL_ROLES),
	getBillingPipelineHandler,
);

router.get("/export", authenticate, authorize(...INTERNAL_ROLES), OrderController.exportOrders);

router.post(
	"/billing/batch-ready",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(BatchMarkReadyForInvoicingSchema),
	batchMarkReadyHandler,
);

router.post(
	"/billing/batch-close",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	validateBody(BatchCloseOrdersSchema),
	batchCloseOrdersHandler,
);

router.post(
	"/billing/batch-ses",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	validateBody(BatchRegisterSesSchema),
	batchRegisterSesHandler,
);

router.patch(
	"/batch-status",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(BatchUpdateStatusSchema),
	OrderController.batchUpdateStatus,
);

router.patch(
	"/batch-priority",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(BatchUpdatePrioritySchema),
	OrderController.batchUpdatePriority,
);

router.patch(
	"/batch-assign",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateBody(BatchAssignOrdersSchema),
	OrderController.batchAssignOrders,
);

/**
 * GET /api/orders/:id
 * Get order by ID
 * Roles: Todos (all authenticated users)
 * Validation: OrderIdSchema (params)
 */
router.get(
	"/:id",
	authenticate,
	authorizeAllAuthenticated(),
	validateParams(OrderIdSchema),
	OrderController.getOrder,
);

/**
 * PUT /api/orders/:id
 * Update order (description, location, priority, observations)
 * Roles: GER, RES, SUP
 * Validation: OrderIdSchema (params), partial UpdateOrderSchema (body)
 */
router.put(
	"/:id",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderSchema),
	OrderController.updateOrder,
);

router.patch(
	"/:id/planning",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderPlanningSchema),
	OrderController.updateOrderPlanning,
);

/**
 * PATCH /api/orders/:id/transition
 * Nuevo endpoint recomendado para transición de estado
 * (mantiene compatibilidad con payload legado `status`)
 */
router.patch(
	"/:id/transition",
	authenticate,
	authorizeAllAuthenticated(),
	validateParams(OrderIdSchema),
	validateBody(TransitionOrderStatusSchema),
	OrderController.transitionOrderStatus,
);

router.patch(
	"/:id/status",
	authenticate,
	authorizeAllAuthenticated(),
	deprecatedRoute({
		successor: "/api/orders/:id/transition",
		sunset: legacySunset,
	}),
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderStatusSchema),
	OrderController.updateOrderStatus,
);

router.patch(
	"/:id/execution-phase",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "technician", "operator"),
	validateParams(OrderIdSchema),
	validateBody(TransitionExecutionPhaseSchema),
	OrderController.transitionExecutionPhase,
);

router.patch(
	"/:id/pre-start-verification",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "technician", "operator"),
	validateParams(OrderIdSchema),
	validateBody(UpdatePreStartVerificationSchema),
	OrderController.updatePreStartVerification,
);

router.post(
	"/:id/delivery-record",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	validateParams(OrderIdSchema),
	validateBody(CreateDeliveryRecordSchema),
	createDeliveryRecordHandler,
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
	authorize("manager", "resident_engineer", "supervisor"),
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
	authorize("manager"),
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
	authorize("manager", "resident_engineer", "hse_coordinator", "administrator"),
	validateParams(OrderIdSchema),
	OrderController.getOrderReport,
);

router.patch(
	"/:id/billing",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor", "administrator"),
	validateParams(OrderIdSchema),
	validateBody(UpdateOrderBillingSchema),
	updateOrderBillingHandler,
);

export default router;
