import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as sesService from "./service-entry-sheet.service";

export async function listServiceEntrySheets(req: Request, res: Response): Promise<void> {
	const result = await sesService.listServiceEntrySheets({
		orderId: String(req.query.orderId ?? ""),
		status: String(req.query.status ?? ""),
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const result = await sesService.getServiceEntrySheetById(String(req.params.id));
	sendSuccess(res, result);
}

export async function createServiceEntrySheetFromDeliveryRecord(
	req: Request,
	res: Response,
): Promise<void> {
	const actor = requireUser(req);
	const result = await sesService.createServiceEntrySheet(
		{ ...req.body, deliveryRecordId: String(req.params.id) },
		actor._id,
	);
	sendSuccess(res, result, 201);
}

export async function submitServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await sesService.submitServiceEntrySheet(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function approveServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await sesService.approveServiceEntrySheet(String(req.params.id), actor._id);
	sendSuccess(res, result);
}

export async function rejectServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await sesService.rejectServiceEntrySheet(
		String(req.params.id),
		String(req.body.reason ?? ""),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function cancelServiceEntrySheet(req: Request, res: Response): Promise<void> {
	const result = await sesService.cancelServiceEntrySheet(String(req.params.id));
	sendSuccess(res, result);
}

export { cancelServiceEntrySheet as archiveServiceEntrySheet };
