/**
 * Observability Controller — Thin HTTP layer for system health metrics
 *
 * SEPARATION OF CONCERNS:
 * - Business KPIs → /api/analytics/kpis (orders, costs, checklists)
 * - Technical errors → /api/observability/errors (endpoint failures, module errors)
 * - System health  → /api/observability/health (MongoDB, uptime, memory)
 * - Notifications  → /api/notifications (user alerts)
 *
 * These are NOT business KPIs and must NOT appear on the gerencial dashboard.
 */

import { ErrorDashboardQuerySchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import * as ObservabilityService from "./observability.service";

export const getErrorDashboard = async (req: Request, res: Response) => {
	const { limit } = ErrorDashboardQuerySchema.parse(req.query);
	const dashboard = ObservabilityService.getErrorDashboard(limit);
	return sendSuccess(res, dashboard);
};

export const getEndpointHealth = async (_req: Request, res: Response) => {
	const health = ObservabilityService.getSystemHealth();
	return sendSuccess(res, health);
};
