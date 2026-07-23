/**
 * Dashboard Controller — Thin HTTP layer
 *
 * PROMPT 01 — Dashboard / KPIs
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import {
	buildCostComparisonChart,
	getDashboardSummary,
	getFinancialKpis as getFinancialKpisData,
	getRoleBaseKPIs,
} from "./dashboard.service";
import { getOperationalKPIs } from "./dashboard-operational-kpi.service";
import { buildSlaRiskOrders } from "./dashboard-sla.service";
import {
	getPredictiveAlerts,
	getHealthScore,
} from "./dashboard-predictive.service";

export async function getSummary(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary);
}

export async function getOperationalKpis(req: Request, res: Response): Promise<void> {
	const periodFrom = typeof req.query.periodFrom === "string" ? req.query.periodFrom : void 0;
	const periodTo = typeof req.query.periodTo === "string" ? req.query.periodTo : void 0;
	const kpis = await getOperationalKPIs(periodFrom, periodTo);
	sendSuccess(res, kpis);
}

export async function getSlaRisk(_req: Request, res: Response): Promise<void> {
	const orders = await buildSlaRiskOrders();
	sendSuccess(res, orders);
}

export async function getNextActions(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary.nextActions);
}

export async function getBlockers(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary.blockers);
}

export async function getRecentActivity(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary.recentActivity);
}

export async function getRoleKPIs(req: Request, res: Response): Promise<void> {
	const role = typeof req.query.role === "string" ? req.query.role : void 0;
	const kpis = await getRoleBaseKPIs(role);
	sendSuccess(res, kpis);
}

export async function getCostComparisonChart(_req: Request, res: Response): Promise<void> {
	const data = await buildCostComparisonChart();
	sendSuccess(res, data);
}

export async function getFinancialKpis(_req: Request, res: Response): Promise<void> {
	const kpis = await getFinancialKpisData();
	sendSuccess(res, kpis);
}

export async function getPredictiveAlertsHandler(_req: Request, res: Response): Promise<void> {
	const alerts = await getPredictiveAlerts();
	sendSuccess(res, alerts);
}

export async function getHealthScoreHandler(_req: Request, res: Response): Promise<void> {
	const score = await getHealthScore();
	sendSuccess(res, score);
}
