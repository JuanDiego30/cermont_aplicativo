/**
 * useUnreadCount — TanStack Query hook for the unread notification count.
 *
 * Polls every 30s. Shares the `notificationKeys` namespace so mutations that
 * mark notifications as read can invalidate both the list and the counter.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "../api/notification.api";
import { notificationKeys } from "./useNotifications";

export function useUnreadCount() {
	return useQuery({
		queryKey: notificationKeys.unreadCount(),
		queryFn: fetchUnreadCount,
		refetchInterval: 30_000,
	});
}
