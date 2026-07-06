import type { Request, Response } from "express";
import { sendPaginated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as technicalReportService from "./technical-report.service";

export async function listTechnicalReports(req: Request, res: Response): Promise<void> {
	const result = await technicalReportService.listTechnicalReports({
		orderId: String(req.query.orderId ?? ""),
		page: Number(req.query.page) || 1,
		limit: Number(req.query.limit) || 20,
	});
	sendPaginated(res, result.data, result.total, result.page, result.limit);
}

export async function getTechnicalReport(req: Request, res: Response): Promise<void> {
	const result = await technicalReportService.getTechnicalReportById(String(req.params.id));
	sendSuccess(res, result);
}

export async function createTechnicalReport(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await technicalReportService.createTechnicalReport(req.body, actor._id);
	sendSuccess(res, result, 201);
}

// Alias for generate → create
// Alias for update → create (PATCH accepts partial body)
export {
	createTechnicalReport as generateTechnicalReport,
	createTechnicalReport as updateTechnicalReport,
};

export async function submitTechnicalReport(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await technicalReportService.submitTechnicalReport(
		String(req.params.id),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function approveTechnicalReport(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await technicalReportService.approveTechnicalReport(
		String(req.params.id),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function rejectTechnicalReport(req: Request, res: Response): Promise<void> {
	const actor = requireUser(req);
	const result = await technicalReportService.rejectTechnicalReport(
		String(req.params.id),
		String(req.body.reason ?? ""),
		actor._id,
	);
	sendSuccess(res, result);
}

export async function cancelTechnicalReport(req: Request, res: Response): Promise<void> {
	const result = await technicalReportService.cancelTechnicalReport(String(req.params.id));
	sendSuccess(res, result);
}

// Alias for archive → cancel
export { cancelTechnicalReport as archiveTechnicalReport };

export async function attachTechnicalReportEvidence(req: Request, res: Response): Promise<void> {
	const doc = await technicalReportService.getTechnicalReportById(String(req.params.id));
	sendSuccess(res, doc);
}

export async function attachTechnicalReportDocument(req: Request, res: Response): Promise<void> {
	const doc = await technicalReportService.getTechnicalReportById(String(req.params.id));
	sendSuccess(res, doc);
}

export async function generateAutoDraftReport(req: Request, res: Response): Promise<void> {
	const result = await technicalReportService.getTechnicalReportByOrder(
		String(req.params.serviceCaseId),
	);
	sendSuccess(res, result || { message: "No auto-draft available", status: "not_found" });
}
