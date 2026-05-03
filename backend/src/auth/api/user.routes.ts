/**
 * User Routes — API Endpoints
 *
 * DOC-10 §3 compliance:
 * - RBAC: authorize exactly as specified
 * - Validation: validateBody, validateQuery, validateParams via Zod
 * - Authentication: authenticate on all routes
 * - Order: authenticate → authorize → validate → controller
 *
 * Roles:
 * - GET /api/users         → GER, RES
 * - POST /api/users        → GER, RES
 * - GET /api/users/:id     → GER, RES
 * - PUT /api/users/:id     → GER, RES
 * - PATCH /api/users/:id/deactivate → GER only
 * - GET /api/users/role/:role → GER, RES, SUP
 */

import {
	CreateUserSchema,
	ListUsersQuerySchema,
	UpdateUserSchema,
	UserIdParamsSchema,
	UserRoleParamsSchema,
} from "@cermont/shared-types";
import { MANAGEMENT_ROLES } from "@cermont/shared-types/rbac";
import { Router } from "express";
import { authenticate } from "../../_shared/middlewares/auth.middleware";
import { authorize } from "../../_shared/middlewares/authorize.middleware";
import { validateBody, validateParams, validateQuery } from "../../_shared/middlewares/validate";
import * as UserController from "./user.controller";

const router = Router();

/**
 * GET /api/users
 * List all users (paginated, with optional filters)
 * Roles: GER, RES
 */
router.get(
	"/",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateQuery(ListUsersQuerySchema),
	UserController.listUsers,
);

/**
 * POST /api/users
 * Create a new user
 * Roles: GER, RES
 * Validation: CreateUserSchema
 */
router.post(
	"/",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateBody(CreateUserSchema),
	UserController.createUser,
);

/**
 * GET /api/users/role/:role
 * Get all active users by role
 * Roles: GER, RES, SUP
 *
 * Note: This route must come BEFORE /:id to avoid ambiguity
 */
router.get(
	"/role/:role",
	authenticate,
	authorize("manager", "resident_engineer", "supervisor"),
	validateParams(UserRoleParamsSchema),
	UserController.getUsersByRole,
);

/**
 * GET /api/users/:id
 * Get user by ID
 * Roles: GER, RES
 */
router.get(
	"/:id",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(UserIdParamsSchema),
	UserController.getUser,
);

/**
 * PUT /api/users/:id
 * Update user (all fields optional)
 * Roles: GER, RES
 * Validation: UpdateUserSchema (partial)
 */
router.put(
	"/:id",
	authenticate,
	authorize(...MANAGEMENT_ROLES),
	validateParams(UserIdParamsSchema),
	validateBody(UpdateUserSchema),
	UserController.updateUser,
);

/**
 * PATCH /api/users/:id/deactivate
 * Deactivate (soft delete) user
 * Roles: GER only
 */
router.patch(
	"/:id/deactivate",
	authenticate,
	authorize("manager"),
	validateParams(UserIdParamsSchema),
	UserController.deactivateUser,
);

export default router;
