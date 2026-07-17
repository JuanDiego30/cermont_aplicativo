/**
 * ErpConnectorController — Thin HTTP controller for ERP connector management
 */
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import { DlqService } from "../../services/integration";
import { erpConnectorService } from "./erp-connector.service";

export class ErpConnectorController {
	async list(_req: Request, res: Response) {
		const connectors = await erpConnectorService.list();
		res.status(200).json({ success: true, data: connectors });
	}

	async create(req: Request, res: Response) {
		const connector = await erpConnectorService.create(req.body);
		res.status(201).json({ success: true, data: connector });
	}

	async getById(req: Request, res: Response) {
		const id = req.params.id as string;
		const connector = await erpConnectorService.getById(id);
		res.status(200).json({ success: true, data: connector });
	}

	async update(req: Request, res: Response) {
		const id = req.params.id as string;
		const connector = await erpConnectorService.update(id, req.body);
		res.status(200).json({ success: true, data: connector });
	}

	async delete(req: Request, res: Response) {
		const id = req.params.id as string;
		await erpConnectorService.delete(id);
		res.status(200).json({ success: true, data: null });
	}

	async sync(req: Request, res: Response) {
		const provider = req.params.provider as string;
		const result = await erpConnectorService.sync(provider);
		res.status(200).json({ success: true, data: result });
	}

	async validateMapping(req: Request, res: Response) {
		const id = req.params.id as string;
		const fieldMappings = req.body.fieldMappings as Record<string, string>;
		const result = await erpConnectorService.validateMapping(id, fieldMappings);
		res.status(200).json({ success: true, data: result });
	}

	async testSync(req: Request, res: Response) {
		const id = req.params.id as string;
		const result = await erpConnectorService.testSync(id);
		res.status(200).json({ success: true, data: result });
	}

	async healthCheck(_req: Request, res: Response) {
		const result = await erpConnectorService.healthCheckAll();
		res.status(200).json({ success: true, data: result });
	}

	async metrics(_req: Request, res: Response) {
		const result = await erpConnectorService.getMetrics();
		res.status(200).json({ success: true, data: result });
	}

	async listDlq(req: Request, res: Response) {
		const { status, provider, limit, skip } = req.query as Record<string, string>;
		const result = await DlqService.listAll({
			status,
			provider,
			limit: limit ? Number(limit) : undefined,
			skip: skip ? Number(skip) : undefined,
		});
		res.status(200).json({ success: true, data: result.entries, meta: { total: result.total } });
	}

	async retryDlqItem(req: Request, res: Response) {
		const id = req.params.id as string;
		const user = requireUser(req);
		const entry = await DlqService.retryOne(id, user._id);
		if (!entry) {
			res.status(404).json({
				success: false,
				error: { code: "DLQ_ENTRY_NOT_FOUND", message: "DLQ entry not found" },
			});
			return;
		}
		res.status(200).json({ success: true, data: entry });
	}

	async retryAllDlqByProvider(req: Request, res: Response) {
		const provider = req.params.provider as string;
		const user = requireUser(req);
		const count = await DlqService.retryAllByProvider(provider, user._id);
		res.status(200).json({ success: true, data: { provider, retriedCount: count } });
	}

	async resolveDlqItem(req: Request, res: Response) {
		const id = req.params.id as string;
		const user = requireUser(req);
		const entry = await DlqService.resolve(id, user._id);
		if (!entry) {
			res.status(404).json({
				success: false,
				error: { code: "DLQ_ENTRY_NOT_FOUND", message: "DLQ entry not found" },
			});
			return;
		}
		res.status(200).json({ success: true, data: entry });
	}

	async getIntegrationLogs(req: Request, res: Response) {
		const { entityId, provider, operation, success, limit, skip } = req.query as Record<
			string,
			string
		>;
		const result = await DlqService.getIntegrationLogs({
			entityId,
			provider,
			operation,
			success: success !== undefined ? success === "true" : undefined,
			limit: limit ? Number(limit) : undefined,
			skip: skip ? Number(skip) : undefined,
		});
		res.status(200).json({ success: true, data: result.logs, meta: { total: result.total } });
	}
}

export const erpConnectorController = new ErpConnectorController();
