import {
	DianConfigurationInputSchema,
	DianInvoiceParamsSchema,
	DianReportQuerySchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { DlqService } from "../../services/integration";
import { DianService } from "./dian.service";

export const DianController = {
	async getConfiguration(_req: Request, res: Response) {
		const configuration = await DianService.getConfiguration();
		res.status(200).json({ success: true, data: configuration });
	},

	async upsertConfiguration(req: Request, res: Response) {
		const user = requireUser(req);
		const input = DianConfigurationInputSchema.parse(req.body);
		const configuration = await DianService.upsertConfiguration(input, user._id);
		res.status(200).json({ success: true, data: configuration });
	},

	async sendInvoice(req: Request, res: Response) {
		const user = requireUser(req);
		const { invoiceId } = DianInvoiceParamsSchema.parse(req.params);
		const result = await DianService.sendInvoice(invoiceId, user._id);
		res.status(200).json({ success: true, data: result });
	},

	async checkInvoiceStatus(req: Request, res: Response) {
		const user = requireUser(req);
		const { invoiceId } = DianInvoiceParamsSchema.parse(req.params);
		const result = await DianService.checkInvoiceStatus(invoiceId, user);
		res.status(200).json({ success: true, data: result });
	},

	async getReport(req: Request, res: Response) {
		const query = DianReportQuerySchema.parse(req.query);
		const result = await DianService.getReport(
			query.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
			query.to ?? new Date(),
		);
		res.status(200).json({ success: true, data: result });
	},

	async listDlq(req: Request, res: Response) {
		const { status, limit, skip } = req.query as Record<string, string>;
		const result = await DlqService.listAll({
			status,
			provider: "dian",
			limit: limit ? Number(limit) : undefined,
			skip: skip ? Number(skip) : undefined,
		});
		res.status(200).json({ success: true, data: result.entries, meta: { total: result.total } });
	},

	async retryDlqItem(req: Request, res: Response) {
		const user = requireUser(req);
		const id = req.params.id as string;
		const entry = await DlqService.retryOne(id, user._id);
		if (!entry) {
			res.status(404).json({
				success: false,
				error: { code: "DLQ_ENTRY_NOT_FOUND", message: "DLQ entry not found" },
			});
			return;
		}
		res.status(200).json({ success: true, data: entry });
	},

	async retryAllDlq(req: Request, res: Response) {
		const user = requireUser(req);
		const count = await DlqService.retryAllByProvider("dian", user._id);
		res.status(200).json({ success: true, data: { provider: "dian", retriedCount: count } });
	},

	async getIntegrationLogs(req: Request, res: Response) {
		const { entityId, operation, success, limit, skip } = req.query as Record<string, string>;
		const result = await DlqService.getIntegrationLogs({
			entityId,
			provider: "dian",
			operation,
			success: success !== undefined ? success === "true" : undefined,
			limit: limit ? Number(limit) : undefined,
			skip: skip ? Number(skip) : undefined,
		});
		res.status(200).json({ success: true, data: result.logs, meta: { total: result.total } });
	},
};
