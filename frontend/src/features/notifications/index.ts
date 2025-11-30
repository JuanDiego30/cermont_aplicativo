/**
 * Notifications Feature - Barrel Export
 * 
 * @file frontend/src/features/notifications/index.ts
 */

// API Service
export {
  notificationsService,
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
  type NotificationType,
  type NotificationsResponse,
} from './api/notifications-service';

// Hooks
export {
  notificationsKeys,
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useNotificationActions,
} from './hooks/useNotifications';

// Components
export { NotificationDropdown } from './components/NotificationDropdown';
