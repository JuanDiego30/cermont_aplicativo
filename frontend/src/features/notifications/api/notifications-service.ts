/**
 * Servicio API para Notificaciones
 * 
 * Endpoints:
 * - GET /api/notifications - Lista de notificaciones del usuario
 * - PATCH /api/notifications/:id/read - Marcar como leída
 * - PATCH /api/notifications/read-all - Marcar todas como leídas
 * 
 * @file frontend/src/features/notifications/api/notifications-service.ts
 */

import apiClient from '@/core/api/client';

// ==========================================
// Types
// ==========================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
  createdAt: string;
  context?: {
    orderId?: string;
    workPlanId?: string;
    [key: string]: unknown;
  };
}

export type NotificationType = 
  | 'ORDER_ASSIGNED'
  | 'ORDER_STATE_CHANGED'
  | 'WORKPLAN_APPROVED'
  | 'WORKPLAN_REJECTED'
  | 'EVIDENCE_APPROVED'
  | 'EVIDENCE_REJECTED'
  | 'DEADLINE_APPROACHING'
  | 'GENERAL';

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ==========================================
// API Functions
// ==========================================

/**
 * Obtiene las notificaciones del usuario actual
 */
export const getNotifications = async (): Promise<NotificationsResponse> => {
  return apiClient.get<NotificationsResponse>('/notifications');
};

/**
 * Marca una notificación como leída
 */
export const markAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
};

/**
 * Marca todas las notificaciones como leídas
 */
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};

// ==========================================
// Exports
// ==========================================

export const notificationsService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationsService;
