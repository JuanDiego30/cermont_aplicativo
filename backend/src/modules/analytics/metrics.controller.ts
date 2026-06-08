/**
 * Metrics Controller — Thin HTTP layer for system metrics
 *
 * Returns non-sensitive operational metrics for monitoring dashboards.
 * Requires admin/internal role access.
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import * as AnalyticsService from "../analytics/analytics.service";

export const getSystemMetrics = async (_req: Request, res: Response) => {
	const metrics = AnalyticsService.getSystemMetrics();
	return sendSuccess(res, metrics);
};
