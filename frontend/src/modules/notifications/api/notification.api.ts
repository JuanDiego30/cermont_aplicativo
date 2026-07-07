/**
 * Notifications API Service
 *
 * Thin wrapper over `apiClient` for the `/api/notifications` endpoints.
 * Returns unwrapped response `data` fields and throws on non-2xx (handled by apiClient).
 */

import { apiClient } from "@/lib/http/api-client";
import type { Notification } from "./types";

const BASE = "/notifications";

export async function fetchNotifications(): Promise<Notification[]> {
	const envelope = await apiClient.get<{ success: true; data: Notification[] }>(BASE);
	return envelope.data;
}

export async function fetchUnreadCount(): Promise<number> {
	const envelope = await apiClient.get<{ success: true; data: { count: number } }>(
		`${BASE}/unread-count`,
	);
	return envelope.data.count;
}

export async function markAsRead(id: string): Promise<void> {
	await apiClient.patch<{ success: true; data: null }>(`${BASE}/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
	await apiClient.post<{ success: true; data: null }>(`${BASE}/mark-all-read`);
}
