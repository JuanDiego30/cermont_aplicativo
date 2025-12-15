/**
 * ARCHIVO: notificationStore.ts
 * FUNCION: Store global para sistema de notificaciones toast
 * IMPLEMENTACION: Basado en vercel/examples/apps/vibe-coding-platform/components/error-monitor/state.ts
 * DEPENDENCIAS: zustand
 * EXPORTS: useNotificationStore, NotificationType, Notification
 */
import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = no auto-dismiss
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

interface NotificationState {
  notifications: Notification[];
  maxNotifications: number;
  
  // Acciones
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  clearByType: (type: NotificationType) => void;
  
  // Helpers
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

const DEFAULT_DURATION = 5000; // 5 segundos
const MAX_NOTIFICATIONS = 5;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  maxNotifications: MAX_NOTIFICATIONS,
  
  addNotification: (notification) => {
    const id = crypto.randomUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: Date.now(),
      duration: notification.duration ?? DEFAULT_DURATION,
      dismissible: notification.dismissible ?? true,
    };
    
    set((state) => {
      // Limitar número de notificaciones
      let notifications = [...state.notifications, newNotification];
      if (notifications.length > state.maxNotifications) {
        notifications = notifications.slice(-state.maxNotifications);
      }
      return { notifications };
    });
    
    // Auto-dismiss si tiene duración
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ notifications: [] });
  },
  
  clearByType: (type) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.type !== type),
    }));
  },
  
  // Helpers de conveniencia
  success: (title, message) => {
    return get().addNotification({ type: 'success', title, message });
  },
  
  error: (title, message) => {
    return get().addNotification({ 
      type: 'error', 
      title, 
      message,
      duration: 8000, // Errores duran más
    });
  },
  
  warning: (title, message) => {
    return get().addNotification({ type: 'warning', title, message });
  },
  
  info: (title, message) => {
    return get().addNotification({ type: 'info', title, message });
  },
}));

/**
 * Hook para usar notificaciones fácilmente
 */
export function useNotifications() {
  const { success, error, warning, info, removeNotification, clearAll } = 
    useNotificationStore();
  
  return {
    success,
    error,
    warning,
    info,
    dismiss: removeNotification,
    clearAll,
  };
}
