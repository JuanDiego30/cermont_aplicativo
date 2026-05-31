import {
	CreateWorkRequestSchema,
	ListWorkRequestsQuerySchema,
	UpdateWorkRequestStatusSchema,
	WorkRequestIdParamsSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendPaginated } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as WorkRequestService from "./work-requests.service";

/**
 * Create a new work request
 * POST /api/work-requests
 * Roles: Todos (all authenticated users)
 */
export async function createWorkRequest(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const data = CreateWorkRequestSchema.parse(req.body);

	const result = await WorkRequestService.createWorkRequest(data, userId);

	res.status(201).json({ success: true, data: result });
}

/**
 * Get work requests (paginated, filtered)
 * GET /api/work-requests
 * Roles: Todos (all authenticated users, service applies RBAC filtering)
 */
export async function getWorkRequests(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const userRole = user.role;
	const query = ListWorkRequestsQuerySchema.parse(req.query);

	const result = await WorkRequestService.getWorkRequests(query, userId, userRole);

	sendPaginated(
		res,
		result.data,
		result.pagination.total,
		result.pagination.page,
		result.pagination.limit,
	);
}

/**
 * Get work request by ID
 * GET /api/work-requests/:id
 * Roles: Todos (all authenticated users, service applies RBAC)
 */
export async function getWorkRequest(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const userRole = user.role;
	const { id } = WorkRequestIdParamsSchema.parse(req.params);

	const workRequest = await WorkRequestService.getWorkRequestById(id, userId, userRole);

	res.status(200).json({ success: true, data: workRequest });
}

/**
 * Update work request
 * PATCH /api/work-requests/:id
 * Roles: GER, RES, HES (full update), CLI (own only)
 */
export async function updateWorkRequest(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const userRole = user.role;
	const { id } = WorkRequestIdParamsSchema.parse(req.params);
	const data = CreateWorkRequestSchema.partial().parse(req.body);

	const workRequest = await WorkRequestService.updateWorkRequest(id, data, userId, userRole);

	res.status(200).json({ success: true, data: workRequest });
}

/**
 * Update work request status
 * PATCH /api/work-requests/:id/status
 * Roles: GER, RES, HES
 */
export async function updateWorkRequestStatus(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const userRole = user.role;
	const { id } = WorkRequestIdParamsSchema.parse(req.params);
	const { status } = UpdateWorkRequestStatusSchema.parse(req.body);

	const workRequest = await WorkRequestService.updateWorkRequestStatus(
		id,
		status,
		userId,
		userRole,
	);

	res.status(200).json({ success: true, data: workRequest });
}

/**
 * Delete (soft delete) work request
 * DELETE /api/work-requests/:id
 * Roles: GER (only gerente can delete)
 */
export async function deleteWorkRequest(req: Request, res: Response) {
	const user = requireUser(req);
	const userId = user._id.toString();
	const userRole = user.role;
	const { id } = WorkRequestIdParamsSchema.parse(req.params);

	const workRequest = await WorkRequestService.deleteWorkRequest(id, userId, userRole);

	res.status(200).json({ success: true, data: workRequest });
}
