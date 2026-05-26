/**
 * Order State Controller — HTTP Layer
 *
 * Handles order lifecycle operations:
 * - updateOrderStatus: PATCH /api/orders/:id/status
 * - transitionOrderStatus: PATCH /api/orders/:id/transition
 * - assignOrder: PATCH /api/orders/:id/assign
 * - deleteOrder: DELETE /api/orders/:id
 * - getOrderReport: GET /api/orders/:id/report
 *
 * NO try/catch blocks (Express 5 native)
 * NO business logic
 */

import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as OrderStateService from "./order-state.service";

/**
 * PATCH /api/orders/:id/status
 *
 * Change order status (state transition with fine-grained validation in service)
 */
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { status, observations } = req.body;
	const user = requireUser(req);

	const order = await OrderStateService.updateOrderStatus(
		String(id),
		status,
		user.role,
		String(user._id),
		observations,
	);

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * PATCH /api/orders/:id/transition
 *
 * Nuevo endpoint recomendado para transición de estado.
 * Mantiene compatibilidad con body legacy (`status`) vía schema.
 */
export async function transitionOrderStatus(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { status, observations } = req.body;
	const user = requireUser(req);

	const order = await OrderStateService.updateOrderStatus(
		String(id),
		status,
		user.role,
		String(user._id),
		observations,
	);

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * PATCH /api/orders/:id/assign
 *
 * Assign order to a technician/operator
 */
export async function assignOrder(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { userId } = req.body;

	const order = await OrderStateService.assignOrder(String(id), userId);

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * DELETE /api/orders/:id
 *
 * Soft delete order (mark as cancelled)
 */
export async function deleteOrder(req: Request, res: Response): Promise<void> {
	const { id } = req.params;

	const order = await OrderStateService.deleteOrder(String(id));

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * GET /api/orders/:id/report
 *
 * Get order report — returns real PDF (Fase B complete)
 */
export async function getOrderReport(req: Request, res: Response): Promise<void> {
	const { id } = req.params;

	const report = await OrderStateService.getOrderReport(String(id));

	res.setHeader("Content-Type", report.contentType);
	res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
	res.setHeader("Content-Length", report.buffer.length);
	res.send(report.buffer);
}
