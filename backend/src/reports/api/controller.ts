import type { ListReportsQuery } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../_shared/common/errors";
import {
	sendCreated,
	sendPaginated,
	sendSuccess,
} from "../../_shared/common/interceptors/response.interceptor";
import { getString, requireUser } from "../../_shared/common/utils/request";
import { ReportService } from "../application/service";
import * as SettingsService from "../application/settings.service";

export async function createReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.create(req.body, user._id);
	sendCreated(res, report);
}

export async function listReports(req: Request, res: Response): Promise<void> {
	const query = req.query as Partial<ListReportsQuery>;

	const reports = await ReportService.findAll({
		orderId: query.orderId,
		status: query.status,
		page: Number(query.page ?? 1),
		limit: Number(query.limit ?? 20),
	});

	sendPaginated(res, reports.data, reports.total, reports.page, reports.limit);
}

export async function getReportByOrderId(req: Request, res: Response): Promise<void> {
	const report = await ReportService.findByOrderId(getString(req.params.orderId));
	sendSuccess(res, report);
}

export async function syncReportByOrderId(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.syncDraftForCompletedOrder(
		getString(req.params.orderId),
		user._id,
	);
	sendSuccess(res, report);
}

export async function getReportById(req: Request, res: Response): Promise<void> {
	const report = await ReportService.findById(getString(req.params.id));
	sendSuccess(res, report);
}

export async function updateReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.update(getString(req.params.id), req.body, user._id);
	sendSuccess(res, report);
}

export async function approveReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.approveReport(getString(req.params.id), user._id, user.role);
	sendSuccess(res, report);
}

export async function closeReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.closeReport(getString(req.params.id), user._id, user.role);
	sendSuccess(res, report);
}

export async function rejectReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.rejectReport(
		getString(req.params.id),
		req.body.rejectionReason,
		user._id,
		user.role,
	);
	sendSuccess(res, report);
}

export async function generateReportPdf(req: Request, res: Response): Promise<void> {
	const { buffer, report } = await ReportService.generatePdf(getString(req.params.orderId));

	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `inline; filename="work-report-${report.orderId}.pdf"`);
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
}

export async function downloadEvidenceZip(req: Request, res: Response): Promise<void> {
	const { buffer, filename } = await ReportService.getEvidenceZip(getString(req.params.orderId));

	res.setHeader("Content-Type", "application/zip");
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
}

export async function downloadBulkEvidenceZip(req: Request, res: Response): Promise<void> {
	const { buffer, filename } = await ReportService.getBulkEvidenceZip(req.body.orderIds);

	res.setHeader("Content-Type", "application/zip");
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
}

// ── Report Settings ────────────────────────────────────────

export async function getTemplateSettings(_req: Request, res: Response): Promise<void> {
	const settings = await SettingsService.getReportTemplateSettings();
	sendSuccess(res, settings);
}

export async function updateTemplateSettings(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const settings = await SettingsService.updateReportTemplateSettings(req.body, user._id);
	sendSuccess(res, settings);
}

export async function getAllReports(req: Request, res: Response): Promise<void> {
	return listReports(req, res);
}

export async function getReportsByOrderId(req: Request, res: Response): Promise<void> {
	return getReportByOrderId(req, res);
}

export async function updateReportStatus(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.update(getString(req.params.id), req.body, user._id);
	sendSuccess(res, report);
}

export async function deleteOrder(_req: Request, _res: Response): Promise<void> {
	throw new BadRequestError(
		"Report deletion is not supported in the WorkReport flow",
		"REPORT_DELETE_NOT_SUPPORTED",
	);
}

export async function getReportArchivePeriods(_req: Request, res: Response): Promise<void> {
	const periods = await ReportService.getArchivePeriods();
	sendSuccess(res, periods);
}

export async function downloadReportArchiveByPeriod(req: Request, res: Response): Promise<void> {
	const reports = await ReportService.getArchivedReportsByPeriod(getString(req.params.period));
	sendSuccess(res, reports);
}

export async function getReportPipeline(_req: Request, res: Response): Promise<void> {
	const pipeline = await ReportService.getReportPipeline();
	sendSuccess(res, pipeline);
}

export async function getReportMonthlyStats(_req: Request, res: Response): Promise<void> {
	const stats = await ReportService.getMonthlyStats();
	sendSuccess(res, stats);
}

export async function syncReportDraft(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.syncDraftForCompletedOrder(
		getString(req.params.orderId),
		user._id,
	);
	sendSuccess(res, report);
}
