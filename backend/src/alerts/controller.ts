import type { Request, Response } from "express";
import { sendSuccess } from "../_shared/common/interceptors/response.interceptor";
import { generateAlerts, getOrderAlertsById, getUserAlerts } from "./service";

function getSingleParam(value: string | string[] | undefined): string {
	return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function listAlerts(_req: Request, res: Response): Promise<void> {
	const alerts = await generateAlerts();
	sendSuccess(res, alerts);
}

export async function listUserAlerts(req: Request, res: Response): Promise<void> {
	const alerts = await getUserAlerts(getSingleParam(req.params.userId));
	sendSuccess(res, alerts);
}

export async function listOrderAlerts(req: Request, res: Response): Promise<void> {
	const alerts = await getOrderAlertsById(getSingleParam(req.params.orderId));
	sendSuccess(res, alerts);
}
