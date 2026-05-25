/**
 * Work Request Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams, validateQuery via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 */

import {
	CreateWorkRequestSchema,
	ListWorkRequestsQuerySchema,
	UpdateWorkRequestStatusSchema,
	WorkRequestIdParamsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import * as WorkRequestController from "./work-requests.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";

const router = Router();

/**
 * GET /api/work-requests
 * List all work requests (paginated, filtered)
 * Roles: Todos (all authenticated users)
 * Service applies RBAC filtering
 */
router.get(
	"/",
	authenticate,
	validateQuery(ListWorkRequestsQuerySchema),
	WorkRequestController.getWorkRequests,
);

/**
 * GET /api/work-requests/:id
 * Get work request by ID
 * Roles: Todos (all authenticated users)
 * Service applies RBAC
 */
router.get(
	"/:id",
	authenticate,
	validateParams(WorkRequestIdParamsSchema),
	WorkRequestController.getWorkRequest,
);

/**
 * POST /api/work-requests
 * Create a new work request
 * Roles: Todos (all authenticated users)
 */
router.post(
	"/",
	authenticate,
	validateBody(CreateWorkRequestSchema),
	WorkRequestController.createWorkRequest,
);

/**
 * PATCH /api/work-requests/:id
 * Update work request
 * Roles: GER, RES, HES (full update), CLI (own only)
 * Service applies RBAC
 */
router.patch(
	"/:id",
	authenticate,
	validateParams(WorkRequestIdParamsSchema),
	validateBody(CreateWorkRequestSchema.partial()),
	WorkRequestController.updateWorkRequest,
);

/**
 * PATCH /api/work-requests/:id/status
 * Update work request status
 * Roles: GER, RES, HES
 */
router.patch(
	"/:id/status",
	authenticate,
	authorize("gerente", "residente", "hes"),
	validateParams(WorkRequestIdParamsSchema),
	validateBody(UpdateWorkRequestStatusSchema),
	WorkRequestController.updateWorkRequestStatus,
);

/**
 * DELETE /api/work-requests/:id
 * Soft delete work request (mark as cancelled)
 * Roles: GER (only gerente can delete)
 */
router.delete(
	"/:id",
	authenticate,
	authorize("gerente"),
	validateParams(WorkRequestIdParamsSchema),
	WorkRequestController.deleteWorkRequest,
);

export default router;
