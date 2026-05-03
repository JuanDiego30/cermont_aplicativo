import type {
	HistoryArchiveRequest,
	HistoryExportInput,
	HistoryOrdersQuery,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendSuccess } from "../_shared/common/interceptors/response.interceptor";
import {
	archiveEligibleOrders,
	exportHistoryCsv,
	exportHistoryFinancial,
	exportHistoryZip,
	getHistoryStats,
	listHistoryOrders,
} from "./service";

export async function listHistory(req: Request, res: Response): Promise<void> {
	const result = await listHistoryOrders(req.query as unknown as HistoryOrdersQuery);
	sendSuccess(res, result.data, 200, {
		total: result.total,
		page: result.page,
		limit: result.limit,
	});
}

export async function getStats(_req: Request, res: Response): Promise<void> {
	sendSuccess(res, await getHistoryStats());
}

export async function archiveOrders(req: Request, res: Response): Promise<void> {
	const body = req.body as HistoryArchiveRequest;
	sendSuccess(res, await archiveEligibleOrders(body.days));
}

export async function downloadCsv(req: Request, res: Response): Promise<void> {
	const csv = await exportHistoryCsv(req.body as HistoryExportInput);
	res.setHeader("Content-Type", "text/csv; charset=utf-8");
	res.setHeader("Content-Disposition", 'attachment; filename="historicos-cermont.csv"');
	res.status(200).send(csv);
}

export async function downloadZip(req: Request, res: Response): Promise<void> {
	const zip = await exportHistoryZip(req.body as HistoryExportInput);
	res.setHeader("Content-Type", "application/zip");
	res.setHeader("Content-Disposition", 'attachment; filename="historicos-cermont.zip"');
	res.status(200).send(zip);
}

export async function downloadFinancial(req: Request, res: Response): Promise<void> {
	sendSuccess(res, await exportHistoryFinancial(req.body as HistoryExportInput));
}
