import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as paymentService from "./payment.service";

export async function listPayments(req: Request, res: Response): Promise<void> {
	const result = await paymentService.listPayments({
		orderId: String(req.query.orderId ?? ""),
		status: String(req.query.status ?? ""),
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getPayment(req: Request, res: Response): Promise<void> {
	const result = await paymentService.getPaymentById(String(req.params.id));
	sendSuccess(res, result);
}

export async function registerPaymentForInvoice(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await paymentService.registerPaymentForInvoice(
		{
			invoiceId: String(req.params.id),
			amountCOP: Number(req.body.amountCOP),
			paymentMethod: String(req.body.paymentMethod ?? ""),
			referenceNumber: String(req.body.referenceNumber ?? ""),
			paidAt: String(req.body.paidAt ?? new Date().toISOString()),
		},
		actor._id,
	);
	sendSuccess(res, result, 201);
}

export async function reconcilePayment(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await paymentService.reconcilePayment(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function rejectPayment(req: Request, res: Response): Promise<void> {
	const result = await paymentService.rejectPayment(
		String(req.params.id),
		String(req.body.reason ?? ""),
	);
	sendSuccess(res, result);
}
