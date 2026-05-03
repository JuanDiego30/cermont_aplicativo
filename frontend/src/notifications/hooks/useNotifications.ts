import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/_shared/lib/http/api-client";

// Types
export interface NotificationItem {
	id: string;
	type: "info" | "warning" | "success" | "error";
	title: string;
	message: string;
	read: boolean;
	actionUrl?: string;
	createdAt: string;
}

interface NotificationsResponse {
	notifications: NotificationItem[];
	unreadCount: number;
}

// Query key factory
export const NOTIFICATION_KEYS = {
	all: ["notifications"] as const,
	list: (userId?: string) => [...NOTIFICATION_KEYS.all, "list", userId] as const,
	unreadCount: (userId?: string) => [...NOTIFICATION_KEYS.all, "unread", userId] as const,
};

interface UseNotificationsOptions {
	limit?: number;
	enabled?: boolean;
}

export function useNotifications({ limit = 20, enabled = true }: UseNotificationsOptions = {}) {
	return useQuery({
		queryKey: NOTIFICATION_KEYS.list(),
		queryFn: async () => {
			const data = await apiClient.get<NotificationsResponse>(
				`/analytics/notifications?limit=${limit}`,
			);
			return data;
		},
		staleTime: 30_000,
		enabled,
		refetchInterval: 60_000,
	});
}

export function useUnreadNotificationCount() {
	return useQuery({
		queryKey: NOTIFICATION_KEYS.unreadCount(),
		queryFn: async () => {
			const data = await apiClient.get<NotificationsResponse>("/analytics/notifications");
			return data.unreadCount;
		},
		staleTime: 30_000,
		refetchInterval: 30_000,
	});
}

export function useMarkNotificationAsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (notificationId: string) => {
			const data = await apiClient.patch<{ id: string; read: boolean }>(
				`/analytics/notifications/${notificationId}`,
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
		},
	});
}

export function useMarkAllNotificationsAsRead() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async () => {
			const data = await apiClient.post<{ updated: number }>(
				"/analytics/notifications/mark-all-read",
			);
			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
		},
	});
}
