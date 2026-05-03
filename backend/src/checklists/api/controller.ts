import {
	ChecklistIdParamsSchema,
	ChecklistItemParamsSchema,
	ChecklistOrderIdParamsSchema,
	CompleteChecklistSchema,
	CreateChecklistSchema,
	CreateChecklistTemplateSchema,
	ListChecklistsQuerySchema,
	UpdateChecklistItemSchema,
	UpdateChecklistTemplateSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import { requireUser } from "../../_shared/common/utils/request";
import * as ChecklistService from "../application/service";
import * as TemplateService from "../application/template.service";

export async function listChecklists(req: Request, res: Response): Promise<void> {
	const query = ListChecklistsQuerySchema.parse(req.query);
	const checklists = await ChecklistService.listChecklists(query);
	sendSuccess(res, checklists);
}

export async function getChecklistByOrder(req: Request, res: Response): Promise<void> {
	const { orderId } = ChecklistOrderIdParamsSchema.parse(req.params);
	const checklists = await ChecklistService.getChecklistByOrderId(orderId);
	sendSuccess(res, checklists);
}

export async function createChecklist(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { orderId } = CreateChecklistSchema.parse(req.body);
	const idempotencyKey = req.get("Idempotency-Key");
	const checklist = await ChecklistService.createChecklist(orderId, user._id, {
		...(idempotencyKey ? { idempotencyKey } : {}),
	});
	sendCreated(res, checklist);
}

export async function updateChecklistItem(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id, itemId } = ChecklistItemParamsSchema.parse(req.params);
	const payload = UpdateChecklistItemSchema.parse(req.body);
	const checklist = await ChecklistService.updateItem(id, itemId, payload, user._id);

	sendSuccess(res, checklist);
}

export async function completeChecklist(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ChecklistIdParamsSchema.parse(req.params);
	const payload = CompleteChecklistSchema.parse(req.body);
	const checklist = await ChecklistService.completeChecklist(id, payload, user._id);
	sendSuccess(res, checklist);
}

// ── Checklist Templates ─────────────────────────────────────

export async function listTemplates(_req: Request, res: Response): Promise<void> {
	const templates = await TemplateService.listTemplates();
	sendSuccess(res, templates);
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const payload = CreateChecklistTemplateSchema.parse(req.body);
	const template = await TemplateService.createTemplate(payload, user._id);
	sendCreated(res, template);
}

export async function getTemplateById(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const template = await TemplateService.getTemplateById(String(id));
	sendSuccess(res, template);
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const payload = UpdateChecklistTemplateSchema.parse(req.body);
	const template = await TemplateService.updateTemplate(String(id), payload);
	sendSuccess(res, template);
}
