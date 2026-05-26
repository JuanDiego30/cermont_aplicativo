/**
 * Dashboard Controller — Thin HTTP layer
 *
 * PROMPT 01 — Dashboard / KPIs
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { getDashboardSummary } from "./dashboard.service";

export async function getSummary(_req: Request, res: Response): Promise<void> {
	const summary = await getDashboardSummary();
	sendSuccess(res, summary);
}
