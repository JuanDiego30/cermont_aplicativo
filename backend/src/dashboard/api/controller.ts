/**
 * Analytics Controller — Thin HTTP layer for dashboard KPIs
 *
 * Responsibilities:
 * - Call AnalyticsService for KPI computation
 * - Return standardized HTTP responses
 */

import type { DashboardKpisQuery, NotificationId } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../_shared/common/errors";
import { sendSuccess } from "../../_shared/common/interceptors/response.interceptor";
import * as AnalyticsService from "../application/service";

export const getKpis = async (req: Request, res: Response) => {
	const query = req.query as DashboardKpisQuery;
	const kpis = await AnalyticsService.getKpis({
		startDate: query.startDate,
		endDate: query.endDate,
		client: query.client,
	});
	return sendSuccess(res, kpis);
};

export const getExtendedKpis = async (req: Request, res: Response) => {
	const period =
		req.query.period === "7d" || req.query.period === "90d" || req.query.period === "30d"
			? req.query.period
			: "30d";
	const kpis = await AnalyticsService.getExtendedKpis(period);
	return sendSuccess(res, kpis);
};

export const getTimeSeries = async (req: Request, res: Response) => {
	const range =
		req.query.range === "7d" || req.query.range === "90d" || req.query.range === "30d"
			? req.query.range
			: "30d";
	const client = typeof req.query.client === "string" ? req.query.client : "";
	const series = await AnalyticsService.getTimeSeries(range, client);
	return sendSuccess(res, series);
};

export const getTopAssets = async (req: Request, res: Response) => {
	const parsedLimit = Number(req.query.limit);
	const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;
	const assets = await AnalyticsService.getTopAssets(limit);
	return sendSuccess(res, assets);
};

export const getTechnicianWorkload = async (req: Request, res: Response) => {
	const parsedDays = Number(req.query.days);
	const days = Number.isFinite(parsedDays) ? parsedDays : 14;
	const workload = await AnalyticsService.getTechnicianWorkload(days);
	return sendSuccess(res, workload);
};

function getReportAnalyticsPeriod(req: Request) {
	return req.query.period === "7d" || req.query.period === "90d" || req.query.period === "30d"
		? req.query.period
		: "30d";
}

export const getReportCycleTimeDistribution = async (req: Request, res: Response) => {
	const data = await AnalyticsService.getReportCycleTimeDistribution(getReportAnalyticsPeriod(req));
	return sendSuccess(res, data);
};

export const getReportTechnicianRanking = async (req: Request, res: Response) => {
	const data = await AnalyticsService.getReportTechnicianRanking(getReportAnalyticsPeriod(req));
	return sendSuccess(res, data);
};

export const getBillingVsCost = async (req: Request, res: Response) => {
	const data = await AnalyticsService.getBillingVsCost(getReportAnalyticsPeriod(req));
	return sendSuccess(res, data);
};

export const getNotifications = async (_req: Request, res: Response) => {
	return sendSuccess(res, {
		notifications: [],
		unreadCount: 0,
	});
};

export const getErrorDashboard = async (req: Request, res: Response) => {
	const parsedLimit = Number(req.query.limit);
	const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;

	const dashboard = AnalyticsService.getErrorDashboard(limit);
	return sendSuccess(res, dashboard);
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
	// Use validated params data from middleware (validateParams(NotificationIdSchema))
	const { id } = req.params as NotificationId;
	if (!id) {
		throw new BadRequestError("Notification id is required");
	}

	return sendSuccess(res, { id, read: true });
};

export const markAllNotificationsAsRead = async (_req: Request, res: Response) => {
	return sendSuccess(res, { updated: 0 });
};
