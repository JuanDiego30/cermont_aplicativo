import type { Request, Response } from "express";
import { ServiceUnavailableError } from "../../common/errors";
import { getString, requireUser } from "../../common/utils/request";
import { isTransientDatabaseError } from "../../common/utils/transient-database-error";
import * as SiteVisitService from "./site-visit.service";

export async function list(req: Request, res: Response) {
	try {
		const result = await SiteVisitService.listSiteVisits({
			page: Number(req.query.page) || 1,
			limit: Number(req.query.limit) || 20,
			workRequestId: req.query.workRequestId ? String(req.query.workRequestId) : undefined,
			clientId: req.query.clientId ? String(req.query.clientId) : undefined,
			status: req.query.status ? String(req.query.status) : undefined,
		});
		res.json({
			success: true,
			data: result.data,
			meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages },
		});
	} catch (error) {
		if (isTransientDatabaseError(error as Error)) {
			throw new ServiceUnavailableError("Database temporarily unavailable. Please try again.");
		}
		throw error;
	}
}

export async function getById(req: Request, res: Response) {
	const id = getString(req.params.id);
	const record = await SiteVisitService.getSiteVisitById(id);
	res.json({ success: true, data: record });
}

export async function create(req: Request, res: Response) {
	const user = requireUser(req);
	const record = await SiteVisitService.createSiteVisit(req.body, user._id);
	res.status(201).json({ success: true, data: record });
}

export async function update(req: Request, res: Response) {
	const id = getString(req.params.id);
	const record = await SiteVisitService.updateSiteVisit(id, req.body);
	res.json({ success: true, data: record });
}

export async function start(req: Request, res: Response) {
	const id = getString(req.params.id);
	const clientMutationId = (req.body as { clientMutationId?: string }).clientMutationId;
	const record = await SiteVisitService.startSiteVisit(id, clientMutationId);
	res.json({ success: true, data: record });
}

export async function complete(req: Request, res: Response) {
	const id = getString(req.params.id);
	const record = await SiteVisitService.completeSiteVisit(id, req.body);
	res.json({ success: true, data: record });
}

export async function cancel(req: Request, res: Response) {
	const id = getString(req.params.id);
	const { reason, clientMutationId } = req.body as { reason: string; clientMutationId?: string };
	const record = await SiteVisitService.cancelSiteVisit(id, reason, clientMutationId);
	res.json({ success: true, data: record });
}
