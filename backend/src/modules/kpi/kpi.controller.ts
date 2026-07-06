import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import * as kpiService from "./kpi.service";

export async function getDashboardKpis(req: Request, res: Response): Promise<void> {
	const period = String(req.query.period || "30d") as "7d" | "30d" | "90d" | "12m";
	const result = await kpiService.getDashboardKpiSummary(period);
	sendSuccess(res, result);
}
