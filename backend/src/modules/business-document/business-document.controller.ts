/**
 * BusinessDocumentController — Thin HTTP controller for business document CRUD
 */
import type { Request, Response } from "express";
import { businessDocumentService } from "./business-document.service";

export class BusinessDocumentController {
	async list(req: Request, res: Response) {
		const documentType = req.query.documentType as string;
		const docs = await businessDocumentService.list(documentType);
		res.status(200).json({ success: true, data: docs });
	}

	async create(req: Request, res: Response) {
		const doc = await businessDocumentService.create(req.body);
		res.status(201).json({ success: true, data: doc });
	}

	async getById(req: Request, res: Response) {
		const id = req.params.id as string;
		const doc = await businessDocumentService.getById(id);
		res.status(200).json({ success: true, data: doc });
	}

	async update(req: Request, res: Response) {
		const id = req.params.id as string;
		const doc = await businessDocumentService.update(id, req.body);
		res.status(200).json({ success: true, data: doc });
	}

	async delete(req: Request, res: Response) {
		const id = req.params.id as string;
		await businessDocumentService.delete(id);
		res.status(200).json({ success: true, data: null });
	}
}

export const businessDocumentController = new BusinessDocumentController();
