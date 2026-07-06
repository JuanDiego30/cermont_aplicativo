/**
 * Notifications module — barrel export
 *
 * Aggregates all public API types, hooks, and UI components so that
 * external modules (header, dashboard, etc.) can import from
 * `@/modules/notifications` instead of deep paths.
 */

export {
	fetchNotifications,
	fetchUnreadCount,
	markAllAsRead,
	markAsRead,
} from "./api/notification.api";
export type { Notification, NotificationType } from "./api/types";
export {
	notificationKeys,
	useNotifications,
} from "./hooks/useNotifications";
export { useUnreadCount } from "./hooks/useUnreadCount";
