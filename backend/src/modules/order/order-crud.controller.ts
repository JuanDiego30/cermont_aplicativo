/**
 * Order CRUD Controller — HTTP Layer
 *
 * Handles core CRUD operations:
 * - listOrders: GET /api/orders
 * - createOrder: POST /api/orders
 * - getOrder: GET /api/orders/:id
 * - updateOrder: PUT /api/orders/:id
 *
 * NO try/catch blocks (Express 5 native)
 * NO business logic
 */

import type { OrderListQuery } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as OrderCrudService from "./order-crud.service";

/**
 * GET /api/orders
 *
 * List all orders (paginated, with filters)
 */
export async function listOrders(req: Request, res: Response): Promise<void> {
	const query = req.query as Record<string, unknown>;
	const parsedQuery: OrderListQuery = {
		page: Number(query.page) || 1,
		limit: Number(query.limit) || 20,
		status:
			typeof query.status === "string" ? (query.status as OrderListQuery["status"]) : undefined,
		priority:
			typeof query.priority === "string"
				? (query.priority as OrderListQuery["priority"])
				: undefined,
		assignedTo: typeof query.assignedTo === "string" ? query.assignedTo : undefined,
		search: typeof query.search === "string" ? query.search : undefined,
	};
	const { page, limit, status, priority, assignedTo, search } = parsedQuery;
	const user = requireUser(req);

	const result = await OrderCrudService.listOrders(page, limit, {
		status,
		priority,
		assignedTo,
		search,
		role: user.role,
		createdBy: user._id,
	});

	res.setHeader("X-Total-Count", String(result.total));

	res.status(200).json({
		success: true,
		data: result.orders,
		meta: {
			total: result.total,
			page: result.page,
			limit: result.limit,
			pages: result.pages,
		},
	});
}

/**
 * POST /api/orders
 *
 * Create a new order
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
	const {
		type,
		priority,
		description,
		assetId,
		assetName,
		location,
		proposalId,
		materials,
		kitTemplate,
		customFields,
	} = req.body;
	const user = requireUser(req);

	const order = await OrderCrudService.createOrder(
		{
			type,
			priority,
			description,
			assetId,
			assetName,
			location,
			proposalId,
			materials,
			kitTemplate,
			customFields,
		},
		user._id,
	);

	res.status(201).json({
		success: true,
		data: order,
	});
}

/**
 * GET /api/orders/:id
 *
 * Get order by ID (with ownership check)
 */
export async function getOrder(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const user = requireUser(req);

	const order = await OrderCrudService.getOrderByIdWithAuth(String(id), {
		_id: user._id,
		role: user.role,
	});

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * PUT /api/orders/:id
 *
 * Update order (description, location, priority, observations)
 */
export async function updateOrder(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { description, location, priority, observations } = req.body;

	const order = await OrderCrudService.updateOrder(String(id), {
		description,
		location,
		priority,
		observations,
	});

	res.status(200).json({
		success: true,
		data: order,
	});
}
