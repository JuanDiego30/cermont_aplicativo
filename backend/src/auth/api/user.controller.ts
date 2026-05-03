/**
 * User Controller — HTTP Layer
 *
 * DOC-10 §3 compliance:
 * - Thin layer: receives request → calls service → returns response
 * - NO try/catch blocks (Express 5 handles async errors natively)
 * - NO business logic (all in service)
 * - NO duplicate validation (handled by middlewares)
 *
 * Follows standard HTTP conventions:
 * - GET returns 200
 * - POST returns 201
 * - PUT/PATCH returns 200
 * - DELETE doesn't happen; PATCH /deactivate returns 200
 */

import {
	CreateUserSchema,
	type ListUsersQuery,
	UpdateUserSchema,
	UserIdParamsSchema,
	UserRoleParamsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import * as UserService from "../application/user.service";

/**
 * GET /api/users
 *
 * List all users (paginated, with optional filters)
 *
 * Query params:
 *   page: number (default: 1)
 *   limit: number (default: 50)
 *   role: string (optional)
 *   isActive: boolean (optional)
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: [ { _id, name, email, role, isActive, ... }, ... ],
 *     meta: { total, page, limit, pages }
 *   }
 */
export async function listUsers(req: Request, res: Response): Promise<void> {
	const { page, limit, role, isActive } = req.query as unknown as ListUsersQuery;
	const filters = {
		...(role !== undefined ? { role } : {}),
		...(isActive !== undefined ? { isActive } : {}),
	};

	const result = await UserService.listUsers(page, limit, filters);

	res.status(200).json({
		success: true,
		data: result.users,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			pages: result.pages,
		},
	});
}

/**
 * POST /api/users
 *
 * Create a new user
 *
 * Request body (validated by middleware):
 *   { name, email, password, role, phone? }
 *
 * Response 201:
 *   {
 *     success: true,
 *     data: { _id, name, email, role, isActive, ... }
 *   }
 *
 * Response 409:
 *   { success: false, error: { code: "CONFLICT", message: "User already exists" } }
 */
export async function createUser(req: Request, res: Response): Promise<void> {
	const user = await UserService.createUser(CreateUserSchema.parse(req.body));

	res.status(201).json({
		success: true,
		data: user,
	});
}

/**
 * GET /api/users/:id
 *
 * Get user by ID
 *
 * Response 200:
 *   { success: true, data: { _id, name, email, role, isActive, ... } }
 *
 * Response 404:
 *   { success: false, error: { code: "NOT_FOUND", message: "User not found" } }
 */
export async function getUser(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const user = await UserService.getUserById(id);

	res.status(200).json({
		success: true,
		data: user,
	});
}

/**
 * PUT /api/users/:id
 *
 * Update user (all fields optional in payload)
 *
 * Request body (validated by middleware):
 *   { name?, email?, password?, role?, phone?, avatarUrl? }
 *
 * Response 200:
 *   { success: true, data: { _id, name, email, role, isActive, ... } }
 *
 * Response 404:
 *   { success: false, error: { code: "NOT_FOUND", message: "User not found" } }
 *
 * Response 409:
 *   { success: false, error: { code: "CONFLICT", message: "Email already in use" } }
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const user = await UserService.updateUser(id, UpdateUserSchema.parse(req.body));

	res.status(200).json({
		success: true,
		data: user,
	});
}

/**
 * PATCH /api/users/:id/deactivate
 *
 * Deactivate (soft delete) a user
 *
 * No request body
 *
 * Response 200:
 *   { success: true, data: { _id, name, email, role, isActive: false, ... } }
 *
 * Response 404:
 *   { success: false, error: { code: "NOT_FOUND", message: "User not found" } }
 */
export async function deactivateUser(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const user = await UserService.deactivateUser(id);

	res.status(200).json({
		success: true,
		data: user,
	});
}

/**
 * GET /api/users/role/:role
 *
 * Get all active users by role
 *
 * Path param:
 *   role: string (gerente, tecnico, etc.)
 *
 * Response 200:
 *   {
 *     success: true,
 *     data: [ { _id, name, email, role, isActive, ... }, ... ]
 *   }
 */
export async function getUsersByRole(req: Request, res: Response): Promise<void> {
	const { role } = UserRoleParamsSchema.parse(req.params);

	const users = await UserService.getUsersByRole(role, true); // Only active users

	res.status(200).json({
		success: true,
		data: users,
	});
}
