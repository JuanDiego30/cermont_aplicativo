/**
 * Dashboard Controller — Thin HTTP layer
 *
 * PROMPT 01 — Dashboard / KPIs
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { getDashboardSummary } from "./dashboard.service";
import { getOperationalKPIs } from "./dashboard-operational-kpi.service";
import { buildSlaRiskOrders } from "./dashboard-sla.service";

export async function getSummary(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary);
}

export async function getOperationalKpis(req: Request, res: Response): Promise<void> {
	const periodFrom = typeof req.query.periodFrom === "string" ? req.query.periodFrom : undefined;
	const periodTo = typeof req.query.periodTo === "string" ? req.query.periodTo : undefined;
	const kpis = await getOperationalKPIs(periodFrom, periodTo);
	sendSuccess(res, kpis);
}

export async function getSlaRisk(_req: Request, res: Response): Promise<void> {
	const orders = await buildSlaRiskOrders();
	sendSuccess(res, orders);
}
