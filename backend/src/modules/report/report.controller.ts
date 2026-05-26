import type { ListReportsQuery } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors/AppError";
import { getString, requireUser } from "../../common/utils/request";
import { ReportService } from "./report.service";

export async function createReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.create(req.body, user._id);
	res.status(201).json({ success: true, data: report });
}

export async function listReports(req: Request, res: Response): Promise<void> {
	const query = req.query as Partial<ListReportsQuery>;

	const reports = await ReportService.findAll({
		orderId: query.orderId,
		status: query.status,
		page: Number(query.page ?? 1),
		limit: Number(query.limit ?? 20),
	});

	res.status(200).json({
		success: true,
		data: reports.data,
		meta: {
			total: reports.total,
			page: reports.page,
			limit: reports.limit,
			pages: reports.pages,
		},
	});
}

export async function getReportByOrderId(req: Request, res: Response): Promise<void> {
	const report = await ReportService.findByOrderId(getString(req.params.orderId));
	res.status(200).json({ success: true, data: report });
}

export async function getReportById(req: Request, res: Response): Promise<void> {
	const report = await ReportService.findById(getString(req.params.id));
	res.status(200).json({ success: true, data: report });
}

export async function updateReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.update(getString(req.params.id), req.body, user._id);
	res.status(200).json({ success: true, data: report });
}

export async function approveReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.approveReport(getString(req.params.id), user._id, user.role);
	res.status(200).json({ success: true, data: report });
}

export async function closeReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.closeReport(getString(req.params.id), user._id, user.role);
	res.status(200).json({ success: true, data: report });
}

export async function rejectReport(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const report = await ReportService.rejectReport(
		getString(req.params.id),
		req.body.rejectionReason,
		user._id,
		user.role,
	);
	res.status(200).json({ success: true, data: report });
}

export async function generateReportPdf(req: Request, res: Response): Promise<void> {
	const { buffer, report } = await ReportService.generatePdf(getString(req.params.orderId));

	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `inline; filename="work-report-${report.orderId}.pdf"`);
	res.setHeader("Content-Length", buffer.length);
	res.send(buffer);
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
	res.status(200).json({ success: true, data: report });
}

/*
 * Root cause: this handler does not use the request or response objects, and backend lint treats unused args as a hard error.
 * Minimum fix: rename them to the established _req / _res convention without changing behavior.
 */
export async function deleteReport(_req: Request, _res: Response): Promise<void> {
	throw new BadRequestError(
		"Report deletion is not supported in the WorkReport flow",
		"REPORT_DELETE_NOT_SUPPORTED",
	);
}

export async function getReportArchivePeriods(_req: Request, res: Response): Promise<void> {
	const periods = await ReportService.getArchivePeriods();
	res.status(200).json({ success: true, data: periods });
}

export async function downloadReportArchiveByPeriod(req: Request, res: Response): Promise<void> {
	const reports = await ReportService.getArchivedReportsByPeriod(getString(req.params.period));
	res.status(200).json({ success: true, data: reports });
}
