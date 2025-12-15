/**
 * ARCHIVO: index.ts (stores)
 * FUNCION: Barrel file que re-exporta todos los stores Zustand
 * IMPLEMENTACION: Patrón barrel export para imports centralizados
 * DEPENDENCIAS: authStore, uiStore, notificationStore
 * EXPORTS: useAuthStore, useAuth, useUIStore, useInitializeTheme, useNotificationStore, useNotifications
 */
export { useAuthStore, useAuth } from './authStore';
export { useUIStore, useInitializeTheme } from './uiStore';
export { 
  useNotificationStore, 
  useNotifications,
  type Notification,
  type NotificationType 
} from './notificationStore';
