import type { PurchaseOrderStatus } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { getString, requireUser } from "../../common/utils/request";
import * as POService from "./purchase-order.service";

export async function list(req: Request, res: Response) {
	const status =
		req.query.status === "pending" ||
		req.query.status === "approved" ||
		req.query.status === "rejected"
			? (req.query.status as PurchaseOrderStatus)
			: undefined;
	const result = await POService.listPurchaseOrders({
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
		proposalId: req.query.proposalId ? String(req.query.proposalId) : undefined,
		status,
	});
	res.json({
		success: true,
		data: result.data,
		meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
	});
}

export async function getById(req: Request, res: Response) {
	const po = await POService.getPurchaseOrderById(getString(req.params.id));
	res.json({ success: true, data: po });
}

export async function getByProposalId(req: Request, res: Response) {
	const po = await POService.getPurchaseOrderByProposalId(getString(req.params.id));
	res.json({ success: true, data: po });
}

export async function register(req: Request, res: Response) {
	const user = requireUser(req);
	const po = await POService.registerPurchaseOrder(req.body, user._id);
	res.status(201).json({ success: true, data: po });
}

export async function registerForProposal(req: Request, res: Response) {
	const user = requireUser(req);
	const po = await POService.registerPurchaseOrder(
		{
			...req.body,
			proposalId: getString(req.params.id),
		},
		user._id,
	);
	res.status(201).json({ success: true, data: po });
}

export async function validate(req: Request, res: Response) {
	const user = requireUser(req);
	const po = await POService.validatePurchaseOrder(getString(req.params.id), user._id);
	res.json({ success: true, data: po });
}

export async function reject(req: Request, res: Response) {
	const { rejectionReason } = req.body as { rejectionReason: string };
	const po = await POService.rejectPurchaseOrder(getString(req.params.id), rejectionReason);
	res.json({ success: true, data: po });
}
