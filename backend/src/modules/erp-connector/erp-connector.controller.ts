/**
 * ErpConnectorController — Thin HTTP controller for ERP connector management
 */
import type { Request, Response } from "express";
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

	async healthCheck(_req: Request, res: Response) {
		const result = await erpConnectorService.healthCheckAll();
		res.status(200).json({ success: true, data: result });
	}

	async metrics(_req: Request, res: Response) {
		const result = await erpConnectorService.getMetrics();
		res.status(200).json({ success: true, data: result });
	}
}

export const erpConnectorController = new ErpConnectorController();
