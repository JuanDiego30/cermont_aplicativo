import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as invoiceService from "./invoice.service";

export async function listInvoices(req: Request, res: Response): Promise<void> {
	const result = await invoiceService.listInvoices({
		orderId: String(req.query.orderId ?? ""),
		status: String(req.query.status ?? ""),
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getInvoice(req: Request, res: Response): Promise<void> {
	const result = await invoiceService.getInvoiceById(String(req.params.id));
	sendSuccess(res, result);
}

export async function createInvoiceFromServiceEntrySheet(
	req: Request,
	res: Response,
): Promise<void> {
	const actor = requireUser(req);
	const result = await invoiceService.createInvoiceFromSES(
		{ ...req.body, serviceEntrySheetId: String(req.params.id) },
		actor._id,
	);
	sendSuccess(res, result, 201);
}

export async function submitInvoice(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await invoiceService.submitInvoice(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function approveInvoice(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await invoiceService.approveInvoice(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function rejectInvoice(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await invoiceService.rejectInvoice(
		String(req.params.id),
		String(req.body.reason ?? ""),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function cancelInvoice(req: Request, res: Response): Promise<void> {
	const result = await invoiceService.cancelInvoice(String(req.params.id));
	sendSuccess(res, result);
}
