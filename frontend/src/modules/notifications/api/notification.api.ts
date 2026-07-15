/**
 * Notifications API — data access layer for the notifications module.
 *
 * All functions use the unique frontend apiClient.
 */

import { apiClient } from "@/lib/http/api-client";
import type { Notification } from "./types";

type NotificationListEnvelope = { success: boolean; data: Notification[] };
type UnreadNotificationEnvelope = { success: boolean; data: { count: number } };
type ApiAcknowledgement = { success: boolean };

export async function fetchNotifications(): Promise<Notification[]> {
	const body = await apiClient.get<NotificationListEnvelope>("/notifications");
	if (!body.success) {
		throw new Error("Failed to fetch notifications");
	}
	const data = body.data as unknown;
	if (Array.isArray(data)) {
		return data as Notification[];
	}
	if (data && typeof data === "object" && "notifications" in (data as Record<string, unknown>)) {
		return (data as { notifications: Notification[] }).notifications;
	}
	return [];
}

export async function fetchUnreadCount(): Promise<number> {
	const body = await apiClient.get<UnreadNotificationEnvelope>("/notifications/unread-count");
	if (!body.success) {
		return 0;
	}
	return body.data.count;
}

export async function markAsRead(notificationId: string): Promise<void> {
	await apiClient.patch<ApiAcknowledgement>(
		`/notifications/${encodeURIComponent(notificationId)}/read`,
		{},
	);
}

export async function markAllAsRead(): Promise<void> {
	await apiClient.post<ApiAcknowledgement>("/notifications/read-all", {});
}
