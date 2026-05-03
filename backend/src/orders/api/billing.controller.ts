/**
 * Billing Pipeline Controller — HTTP Layer
 *
 * Handles the billing pipeline view:
 * - getBillingPipeline: GET /api/orders/billing-pipeline
 *
 * Returns orders awaiting invoicing (completed or ready_for_invoicing)
 * with aging metrics (days since completedAt), grouped by client.
 *
 * NO try/catch blocks (Express 5 native)
 * NO business logic
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import {
	batchCloseOrders,
	batchMarkReadyForInvoicing,
	batchRegisterSes,
	createDeliveryRecord,
	getBillingPipeline,
	updateOrderBilling,
} from "../application/billing.service";

/**
 * GET /api/orders/billing-pipeline
 *
 * Returns orders in `completed` or `ready_for_invoicing` status
 * with aging metrics, optionally grouped by client.
 */
export async function getBillingPipelineHandler(_req: Request, res: Response): Promise<void> {
	const pipeline = await getBillingPipeline();
	sendSuccess(res, pipeline);
}

export async function updateOrderBillingHandler(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const order = await updateOrderBilling(String(req.params.id), req.body, user._id);
	sendSuccess(res, order);
}

export async function batchCloseOrdersHandler(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const orders = await batchCloseOrders(req.body, user._id);
	sendSuccess(res, orders);
}

export async function batchMarkReadyHandler(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const orders = await batchMarkReadyForInvoicing(req.body, user.role, user._id);
	sendSuccess(res, orders);
}

export async function batchRegisterSesHandler(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const orders = await batchRegisterSes(req.body, user._id);
	sendSuccess(res, orders);
}

export async function createDeliveryRecordHandler(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const order = await createDeliveryRecord(String(req.params.id), req.body, user._id);
	sendSuccess(res, order);
}
