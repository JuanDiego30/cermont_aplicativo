/**
 * Notification Preference Controller
 */

import type { Request, Response } from "express";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import { getPreferences, updatePreferences } from "./notification-preference.service";

export async function getMyPreferences(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await getPreferences(String(user._id));
	sendSuccess(res, data);
}

export async function updateMyPreferences(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = await updatePreferences(String(user._id), req.body);
	sendSuccess(res, data);
}
