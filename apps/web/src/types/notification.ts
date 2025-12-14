/**
 * ARCHIVO: notification.ts
 * FUNCION: Define tipos para el sistema de notificaciones
 * IMPLEMENTACION: Interfaces para Notification, tipos, preferencias y filtros
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: Notification, NotificationType, NotificationPreferences, NotificationFilters
 */
export interface Notification {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  leido: boolean;
  metadata?: Record<string, unknown>;
  accionUrl?: string;
  createdAt: string;
}

export type NotificationType = 
  | 'orden_nueva'
  | 'orden_asignada'
  | 'orden_completada'
  | 'orden_cancelada'
  | 'costeo_aprobado'
  | 'costeo_rechazado'
  | 'tarea_asignada'
  | 'recordatorio'
  | 'sistema';

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  tipos: {
    [key in NotificationType]?: boolean;
  };
}

export interface NotificationFilters {
  leido?: boolean;
  tipo?: NotificationType;
  desde?: string;
}
