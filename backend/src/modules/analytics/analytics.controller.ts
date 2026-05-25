/**
 * Analytics Controller — Thin HTTP layer for dashboard KPIs
 *
 * Responsibilities:
 * - Call AnalyticsService for KPI computation
 * - Return standardized HTTP responses
 */

import { ErrorDashboardQuerySchema, type NotificationId } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import * as AnalyticsService from "./analytics.service";

export const getKpis = async (_req: Request, res: Response) => {
	const kpis = await AnalyticsService.getKpis();
	return sendSuccess(res, kpis);
};

export const getNotifications = async (_req: Request, res: Response) => {
	return sendSuccess(res, {
		notifications: [],
		unreadCount: 0,
	});
};

export const getErrorDashboard = async (req: Request, res: Response) => {
	// Use validated query data from middleware (validateQuery(ErrorDashboardQuerySchema))
	const { limit } = ErrorDashboardQuerySchema.parse(req.query);

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
