import { AnalyticsReportFilterSchema, AnalyticsReportParamsSchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { AnalyticsReportService } from "./analytics-report.service";

function buildCsvFileName(domain: string): string {
	const date = new Date().toISOString().slice(0, 10);
	return `${domain}-${date}.csv`;
}

export const AnalyticsReportController = {
	async getOperationalKPI(req: Request, res: Response) {
		const filters = AnalyticsReportFilterSchema.parse(req.query);
		const result = await AnalyticsReportService.getOperationalKPI(filters);
		res.status(200).json({ success: true, data: result });
	},

	async generateCustomReport(req: Request, res: Response) {
		const { domain } = AnalyticsReportParamsSchema.parse(req.params);
		const filters = AnalyticsReportFilterSchema.parse(req.body);
		const result = await AnalyticsReportService.generateCustomReport(domain, filters);
		res.status(200).json({ success: true, data: result });
	},

	async exportCSV(req: Request, res: Response) {
		const { domain } = AnalyticsReportParamsSchema.parse(req.params);
		const filters = AnalyticsReportFilterSchema.parse(req.query);
		const csv = await AnalyticsReportService.exportToCSV(domain, filters);
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename="${buildCsvFileName(domain)}"`);
		res.status(200).send(csv);
	},

	async exportCSVJson(req: Request, res: Response) {
		const { domain } = AnalyticsReportParamsSchema.parse(req.params);
		const filters = AnalyticsReportFilterSchema.parse(req.body);
		const content = await AnalyticsReportService.exportToCSV(domain, filters);
		res.status(200).json({
			success: true,
			data: {
				fileName: buildCsvFileName(domain),
				content,
			},
		});
	},
};
