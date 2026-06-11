/**
 * User Controller â€” HTTP Layer
 *
 * DOC-10 Â§3 compliance:
 * - Thin layer: receives request â†’ calls service â†’ returns response
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
	AddUserCertificationSchema,
	CreateUserSchema,
	ListUsersQuerySchema,
	UpdateUserSchema,
	UpdateUserSkillsSchema,
	UserIdParamsSchema,
	UserRoleParamsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import * as UserService from "./user.service";

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
	const { page, limit, role, isActive } = ListUsersQuerySchema.parse(req.query);
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

/**
 * POST /api/users/:id/certifications
 *
 * Add a personnel certification (alturas, espacios confinados, eléctrico, ...)
 */
export async function addUserCertification(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const input = AddUserCertificationSchema.parse(req.body);
	const user = await UserService.addUserCertification(id, input);

	res.status(201).json({ success: true, data: user });
}

/**
 * DELETE /api/users/:id/certifications/:name
 *
 * Remove a personnel certification by name
 */
export async function removeUserCertification(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const certificationName = decodeURIComponent(String(req.params.name ?? ""));
	const user = await UserService.removeUserCertification(id, certificationName);

	res.status(200).json({ success: true, data: user });
}

/**
 * PUT /api/users/:id/skills
 *
 * Replace the skills list of a user (skills matrix)
 */
export async function updateUserSkills(req: Request, res: Response): Promise<void> {
	const { id } = UserIdParamsSchema.parse(req.params);
	const { skills } = UpdateUserSkillsSchema.parse(req.body);
	const user = await UserService.updateUserSkills(id, skills);

	res.status(200).json({ success: true, data: user });
}

/**
 * GET /api/users/expiring-certifications?days=30
 *
 * Personnel certifications expiring within N days (default 30)
 */
export async function getExpiringCertifications(req: Request, res: Response): Promise<void> {
	const days = Number.parseInt(String(req.query.days ?? "30"), 10);
	const items = await UserService.getExpiringCertifications(
		Number.isFinite(days) && days > 0 ? days : 30,
	);

	res.status(200).json({ success: true, data: items });
}
