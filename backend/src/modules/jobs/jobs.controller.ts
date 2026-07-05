/**
 * Jobs Controller — Admin job management
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { runAllChecks } from "./jobs.service";

let lastRunAt: string | null = null;

export async function runJobs(_req: Request, res: Response): Promise<void> {
	await runAllChecks();
	lastRunAt = new Date().toISOString();
	sendSuccess(res, { triggered: true, lastRunAt });
}

export function getStatus(_req: Request, res: Response): void {
	sendSuccess(res, {
		workerActive: true,
		lastRunAt,
		nextScheduled: "every 60 minutes",
	});
}
