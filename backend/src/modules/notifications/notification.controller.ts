import type { Request, Response } from "express";
import { BadRequestError } from "../../common/errors";
import { sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as NotificationService from "./notification.service";

export async function getNotifications(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const page = Number.parseInt(String(req.query.page ?? ""), 10);
	const limit = Number.parseInt(String(req.query.limit ?? ""), 10);
	const type = typeof req.query.type === "string" && req.query.type ? req.query.type : "";
	const isReadParam = String(req.query.isRead ?? "");

	const data = await NotificationService.getNotificationsForUserPaginated(String(user._id), {
		...(Number.isFinite(page) && page > 0 ? { page } : {}),
		...(Number.isFinite(limit) && limit > 0 ? { limit } : {}),
		...(type ? { type } : {}),
		...(isReadParam === "true" || isReadParam === "false"
			? { isRead: isReadParam === "true" }
			: {}),
	});
	sendSuccess(res, data.notifications);
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	if (!id) {
		throw new BadRequestError("Notification ID is required");
	}
	const user = requireUser(req);
	const updated = await NotificationService.markAsRead(id, String(user._id));
	sendSuccess(res, updated);
}

export async function markAllNotificationsAsRead(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const result = await NotificationService.markAllAsRead(String(user._id));
	sendSuccess(res, result);
}

export async function getFailedOutboxEntries(_req: Request, res: Response): Promise<void> {
	const data = await NotificationService.getFailedOutboxNotifications();
	sendSuccess(res, data);
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const count = await NotificationService.getUnreadCount(String(user._id));
	sendSuccess(res, { count });
}
