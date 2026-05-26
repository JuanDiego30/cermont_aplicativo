import type { ListChecklistsQuery } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { requireUser } from "../../common/utils/request";
import * as ChecklistService from "./checklist.service";

export async function listChecklists(req: Request, res: Response): Promise<void> {
	const checklists = await ChecklistService.listChecklists(req.query as ListChecklistsQuery);
	res.status(200).json({ success: true, data: checklists });
}

export async function listChecklistsByOrder(req: Request, res: Response): Promise<void> {
	const checklists = await ChecklistService.getChecklistsByOrderId(String(req.params.orderId));
	res.status(200).json({ success: true, data: checklists });
}

export async function createChecklist(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const checklist = await ChecklistService.createChecklist(String(req.body.orderId), user._id, {
		idempotencyKey: req.get("Idempotency-Key") ?? undefined,
	});
	res.status(201).json({ success: true, data: checklist });
}

export async function updateChecklistItem(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const checklist = await ChecklistService.updateChecklistItem(
		String(req.params.id),
		String(req.params.itemId),
		req.body,
		user._id,
	);

	res.status(200).json({ success: true, data: checklist });
}

export async function completeChecklist(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const checklist = await ChecklistService.completeChecklist(
		String(req.params.id),
		req.body,
		user._id,
	);
	res.status(200).json({ success: true, data: checklist });
}
