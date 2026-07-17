import type { InvoiceApprovalStatus } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as approvalService from "./invoice-approval.service";

export async function requestApproval(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await approvalService.requestApproval({
		...req.body,
		requestedBy: actor._id,
	});
	sendSuccess(res, result, 201);
}

export async function approve(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await approvalService.approve(
		String(req.params.id),
		actor._id,
		String(req.body.clientMutationId ?? ""),
	);
	sendSuccess(res, result);
}

export async function reject(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const sid = String(req.body.details ?? "");
	const result = await approvalService.reject(
		String(req.params.id),
		String(req.body.reason ?? ""),
		sid,
		actor._id,
		String(req.body.clientMutationId ?? ""),
	);
	sendSuccess(res, result);
}

export async function correct(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await approvalService.correct(
		String(req.params.id),
		String(req.body.correctionNotes ?? ""),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function list(req: Request, res: Response): Promise<void> {
	const statusFilter = req.query.status
		? { status: String(req.query.status) as InvoiceApprovalStatus }
		: {};
	const result = await approvalService.list({
		invoiceId: String(req.query.invoiceId ?? ""),
		clientId: String(req.query.clientId ?? ""),
		...statusFilter,
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getById(req: Request, res: Response): Promise<void> {
	const result = await approvalService.getById(String(req.params.id));
	sendSuccess(res, result);
}
