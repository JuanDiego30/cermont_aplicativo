/**
 * useNotifications — TanStack Query hook for the current user's notifications.
 *
 * Polls every 30s to surface new alerts in the bell + panel. Query keys are
 * stable and centralized via `notificationKeys` for cache invalidation.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "../api/notification.api";

export const notificationKeys = {
	all: ["notifications"] as const,
	list: () => [...notificationKeys.all, "list"] as const,
	unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

export function useNotifications() {
	return useQuery({
		queryKey: notificationKeys.list(),
		queryFn: fetchNotifications,
		refetchInterval: 30_000,
	});
}