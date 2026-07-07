import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as deliveryRecordService from "./delivery-record.service";

export async function listDeliveryRecords(req: Request, res: Response): Promise<void> {
	const result = await deliveryRecordService.listDeliveryRecords({
		orderId: String(req.query.orderId ?? ""),
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getDeliveryRecord(req: Request, res: Response): Promise<void> {
	const result = await deliveryRecordService.getDeliveryRecordById(String(req.params.id));
	sendSuccess(res, result);
}

export async function createDeliveryRecordFromTechnicalReport(
	req: Request,
	res: Response,
): Promise<void> {
	const actor = requireUser(req);
	const result = await deliveryRecordService.createDeliveryRecordFromTechnicalReport(
		String(req.params.id),
		String(req.body.orderId ?? ""),
		{
			recipientName: String(req.body.recipientName ?? ""),
			recipientEmail: String(req.body.recipientEmail ?? ""),
			notes: String(req.body.notes ?? ""),
		},
		actor._id,
	);
	sendSuccess(res, result, 201);
}

export async function sendDeliveryRecord(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await deliveryRecordService.sendDeliveryRecord(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function signDeliveryRecord(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await deliveryRecordService.signDeliveryRecord(
		String(req.params.id),
		actor._id,
		String(req.body.signatureImageId ?? ""),
	);
	sendSuccess(res, result);
}

export async function rejectDeliveryRecord(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await deliveryRecordService.rejectDeliveryRecord(
		String(req.params.id),
		String(req.body.reason ?? ""),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function cancelDeliveryRecord(req: Request, res: Response): Promise<void> {
	const result = await deliveryRecordService.cancelDeliveryRecord(String(req.params.id));
	sendSuccess(res, result);
}

export { cancelDeliveryRecord as archiveDeliveryRecord };
