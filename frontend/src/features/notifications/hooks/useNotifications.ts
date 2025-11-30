/**
 * Hooks para Notificaciones
 * 
 * @file frontend/src/features/notifications/hooks/useNotifications.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationsResponse,
} from '../api/notifications-service';

// ==========================================
// Query Keys
// ==========================================

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
};

// ==========================================
// Hooks
// ==========================================

/**
 * Hook para obtener notificaciones del usuario
 * Incluye polling automático cada 30 segundos
 * 
 * ⚠️ IMPORTANTE: Solo hace fetching cuando:
 * - isReady === true (auth system initialized)
 * - isAuthenticated === true (user logged in)
 * 
 * Esto previene errores 401 tanto en mount inicial como cuando no hay sesión
 */
export function useNotifications() {
  const { isReady, isAuthenticated } = useAuth();
  
  return useQuery<NotificationsResponse>({
    queryKey: notificationsKeys.list(),
    queryFn: getNotifications,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Polling cada 30 segundos
    refetchOnWindowFocus: true,
    enabled: isReady && isAuthenticated, // ✅ Solo fetch cuando auth esté listo Y autenticado
  });
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId: string) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ queryKey: notificationsKeys.list() });
      
      // Snapshot del estado anterior
      const previousData = queryClient.getQueryData<NotificationsResponse>(notificationsKeys.list());
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData<NotificationsResponse>(notificationsKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, previousData.unreadCount - 1),
        });
      }
      
      return { previousData };
    },
    onError: (_error, _notificationId, context) => {
      // Rollback en caso de error
      if (context?.previousData) {
        queryClient.setQueryData(notificationsKeys.list(), context.previousData);
      }
    },
    onSettled: () => {
      // Refrescar datos después de mutación
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationsKeys.list() });
      
      const previousData = queryClient.getQueryData<NotificationsResponse>(notificationsKeys.list());
      
      // Actualización optimista
      if (previousData) {
        queryClient.setQueryData<NotificationsResponse>(notificationsKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        });
      }
      
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationsKeys.list(), context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.list() });
    },
  });
}

/**
 * Hook combinado para operaciones de notificaciones
 */
export function useNotificationActions() {
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  
  return {
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
