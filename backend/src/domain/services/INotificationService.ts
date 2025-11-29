export type NotificationType = 
  | 'ORDER_ASSIGNED'
  | 'ORDER_STATE_CHANGED'
  | 'WORKPLAN_APPROVED'
  | 'WORKPLAN_REJECTED'
  | 'EVIDENCE_APPROVED'
  | 'EVIDENCE_REJECTED'
  | 'DEADLINE_APPROACHING'
  | 'GENERAL';

export interface NotificationParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Contexto opcional para deep linking o lógica de negocio
  context?: {
    orderId?: string;
    workPlanId?: string;
    [key: string]: unknown;
  };
}

/**
 * Servicio de Notificaciones (Fire & Forget)
 * Responsable de entregar alertas al usuario (Push, In-App, Email, SMS).
 */
export interface INotificationService {
  notify(notification: NotificationParams): Promise<void>;

  /**
   * Envío masivo eficiente.
   */
  notifyMany(
    recipientIds: string[],
    notification: Omit<NotificationParams, 'recipientId'>
  ): Promise<void>;
}

/**
 * Repositorio de Notificaciones (Opcional)
 * Responsable de persistir el historial y estado de lectura.
 * Separado del servicio de envío para cumplir ISP.
 */
export interface INotificationRepository {
  create(notification: NotificationParams): Promise<string>; // Retorna ID
  markAsRead(notificationId: string, userId: string): Promise<void>;
  getForUser(userId: string, unreadOnly?: boolean): Promise<any[]>;
}

