/**
 * Order Execution Controller — HTTP Layer
 *
 * Handles operational execution phases for Work Orders:
 * - PATCH /api/orders/:id/execution-phase
 *
 * NO try/catch blocks (Express 5 native)
 * NO business logic
 */

import type { Request, Response } from "express";
import { requireUser } from "../../_shared/common/utils/request";
import * as ExecutionService from "../application/execution.service";

/**
 * PATCH /api/orders/:id/execution-phase
 *
 * Transition the execution phase of a work order.
 */
export async function transitionExecutionPhase(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { targetPhase } = req.body;
	const user = requireUser(req);

	const order = await ExecutionService.transitionExecutionPhase(
		String(id),
		targetPhase,
		user.role,
		String(user._id),
	);

	res.status(200).json({
		success: true,
		data: order,
	});
}

/**
 * PATCH /api/orders/:id/pre-start-verification
 */
export async function updatePreStartVerification(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { items } = req.body;
	const user = requireUser(req);

	const order = await ExecutionService.updatePreStartVerification(
		String(id),
		items,
		user.role,
		String(user._id),
	);

	res.status(200).json({
		success: true,
		data: order,
	});
}
