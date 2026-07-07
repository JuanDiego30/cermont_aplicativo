import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import * as qrService from "./qr.service";

export async function generateQrCode(req: Request, res: Response): Promise<void> {
	const result = await qrService.generateQrCode(
		String(req.body.entityType ?? ""),
		String(req.body.entityId ?? ""),
		String(req.body.label ?? ""),
	);
	sendSuccess(res, result, 201);
}

export async function generateBulkQrCodes(req: Request, res: Response): Promise<void> {
	const result = await qrService.generateBulkQrCodes(req.body.items ?? []);
	sendSuccess(res, result, 201);
}
