import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { getString, requireUser } from "../../common/utils/request";
import * as portalService from "./portal.service";

export async function getDashboard(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await portalService.getClientDashboard(String(user._id));
	sendSuccess(res, data);
}

export async function listOrders(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await portalService.listClientOrders(String(user._id));
	sendSuccess(res, data);
}

export async function getOrderDetail(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await portalService.getClientOrderDetail(getString(req.params.id), String(user._id));
	sendSuccess(res, data);
}

export async function listInvoices(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await portalService.listClientInvoices(String(user._id));
	sendSuccess(res, data);
}

export async function listProposals(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await portalService.listClientProposals(String(user._id));
	sendSuccess(res, data);
}
