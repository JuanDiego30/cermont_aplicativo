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

import {
	BatchAssignOrdersSchema,
	BatchUpdatePrioritySchema,
	BatchUpdateStatusSchema,
	CreateOrderSchema,
	OrderIdSchema,
	OrderListQuerySchema,
	UpdateOrderPlanningSchema,
	UpdateOrderSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../_shared/common/utils/request";
import { exportOrdersCsv, exportOrdersPdf } from "../application/export.service";
import * as OrderCrudService from "../application/service";

/**
 * GET /api/orders
 *
 * List all orders (paginated, with filters)
 */
export async function listOrders(req: Request, res: Response): Promise<void> {
	const {
		page,
		limit,
		cursor,
		pagination,
		status,
		priority,
		assignedTo,
		technicianId,
		type,
		dateFrom,
		dateTo,
		search,
	} = OrderListQuerySchema.parse(req.query);
	const user = requireUser(req);

	if (pagination === "cursor" || cursor) {
		const result = await OrderCrudService.listOrdersCursor(limit, cursor, {
			status,
			priority,
			assignedTo,
			technicianId,
			type,
			dateFrom,
			dateTo,
			search,
			role: user.role,
			createdBy: user._id,
		});

		res.status(200).json({
			success: true,
			data: result.orders,
			pagination: result.pagination,
		});
		return;
	}

	const result = await OrderCrudService.listOrders(page, limit, {
		status,
		priority,
		assignedTo,
		technicianId,
		type,
		dateFrom,
		dateTo,
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

export async function exportOrders(req: Request, res: Response): Promise<void> {
	const format = req.query.format === "pdf" ? "pdf" : "csv";
	if (format === "pdf") {
		const pdf = await exportOrdersPdf(req.query);
		res.setHeader("Content-Type", "application/pdf");
		res.setHeader("Content-Disposition", 'attachment; filename="orders.pdf"');
		res.setHeader("Content-Length", pdf.length);
		res.status(200).send(pdf);
		return;
	}

	const csv = await exportOrdersCsv(req.query);
	res.setHeader("Content-Type", "text/csv; charset=utf-8");
	res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
	res.status(200).send(csv);
}

/**
 * POST /api/orders
 *
 * Create a new order
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
	const payload = CreateOrderSchema.parse(req.body);
	const user = requireUser(req);

	const order = await OrderCrudService.createOrder(payload, user._id);

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
	const { id } = OrderIdSchema.parse(req.params);
	const user = requireUser(req);

	const order = await OrderCrudService.getOrderByIdWithAuth(id, {
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
	const { id } = OrderIdSchema.parse(req.params);
	const payload = UpdateOrderSchema.parse(req.body);
	const order = await OrderCrudService.updateOrder(id, payload);

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * PATCH /api/orders/:id/planning
 *
 * Update operational planning data and recompute readiness.
 */
export async function updateOrderPlanning(req: Request, res: Response): Promise<void> {
	const { id } = OrderIdSchema.parse(req.params);
	const payload = UpdateOrderPlanningSchema.parse(req.body);
	const user = requireUser(req);
	const order = await OrderCrudService.updateOrderPlanning(id, payload, user._id);

	res.status(200).json({
		success: true,
		data: order,
	});
}

export async function batchUpdateStatus(req: Request, res: Response): Promise<void> {
	const payload = BatchUpdateStatusSchema.parse(req.body);
	const user = requireUser(req);
	const orders = await OrderCrudService.batchUpdateStatus(payload, user.role, String(user._id));

	res.status(200).json({
		success: true,
		data: orders,
	});
}

export async function batchUpdatePriority(req: Request, res: Response): Promise<void> {
	const payload = BatchUpdatePrioritySchema.parse(req.body);
	const user = requireUser(req);
	const orders = await OrderCrudService.batchUpdatePriority(payload, String(user._id));

	res.status(200).json({
		success: true,
		data: orders,
	});
}

export async function batchAssignOrders(req: Request, res: Response): Promise<void> {
	const payload = BatchAssignOrdersSchema.parse(req.body);
	const orders = await OrderCrudService.batchAssignOrders(payload);

	res.status(200).json({
		success: true,
		data: orders,
	});
}
