/**
 * Work Request Routes — API Endpoints
 *
 * DOC-10 §4 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateParams, validateQuery via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 */

import { FIELD_MANAGEMENT_ROLES, INTERNAL_ROLES, REPORTING_ACCESS_ROLES } from "@cermont/domain";
import {
	CreateWorkRequestSchema,
	ListWorkRequestsQuerySchema,
	ScheduleVisitSchema,
	UpdateWorkRequestStatusSchema,
	WorkRequestIdParamsSchema,
} from "@cermont/shared-types";
import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../middlewares/validate";
import * as WorkRequestController from "./work-requests.controller";

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
	authorize(...INTERNAL_ROLES),
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
	authorize(...INTERNAL_ROLES),
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
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateParams(WorkRequestIdParamsSchema),
	validateBody(UpdateWorkRequestStatusSchema),
	WorkRequestController.updateWorkRequestStatus,
);

/**
 * POST /api/work-requests/:id/qualify
 * Qualify a work request (advance to next step)
 * Roles: GER, RES, HES
 */
router.post(
	"/:id/qualify",
	authenticate,
	authorize(...FIELD_MANAGEMENT_ROLES),
	validateParams(WorkRequestIdParamsSchema),
	WorkRequestController.qualifyWorkRequest,
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

/**
 * POST /api/work-requests/:id/visits
 * Create site visit for work request
 * Roles: GER, RES, HES, SUP
 */
router.post(
	"/:id/visits",
	authenticate,
	authorize(...REPORTING_ACCESS_ROLES),
	validateParams(WorkRequestIdParamsSchema),
	validateBody(ScheduleVisitSchema),
	WorkRequestController.createSiteVisit,
);

/**
 * GET /api/work-requests/:id/visits
 * List site visits for work request
 * Roles: All authenticated users
 */
router.get(
	"/:id/visits",
	authenticate,
	authorize(...INTERNAL_ROLES),
	validateParams(WorkRequestIdParamsSchema),
	WorkRequestController.listSiteVisits,
);

export default router;
