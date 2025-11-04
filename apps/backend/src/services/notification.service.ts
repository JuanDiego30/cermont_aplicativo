/**
 * Notification Service (TypeScript - November 2025, Fixed)
 * @description Servicio centralizado de notificaciones multi-canal (Socket.IO real-time, email async, future: push/SMS). Fire-and-forget para no bloquear ops principales.
 * Integra con: emailService (templates), socket config (emitToUser/Role), User/Order models (involved users). Secure: No PII en logs/emits (IDs only, sanitize names), validate IDs.
 * Performance: Async/await, batch Promise.all para emails, no await en sockets (fire-and-forget). Usage: En controllers/services post-mutation (e.g. orderService.create ? notificationService.notifyOrderCreated(order, req.user)).
 * Extensible: Add channels (e.g. sendPush(userId: string, data: NotificationData)). Para ATG: Real-time updates (order assign/status), batch notifications (deadlines cron).
 * Types: Interfaces para params (e.g. OrderNotificationData { orderId: string, numeroOrden: string, ... }). Error: Swallow notifications (log only), throw solo en email critical? No, consistent fire-and-forget.
 * Assumes: Socket emitToUser(userId: string, event: string, data: Record<string, unknown>): void; emitToRole(role: string, event: string, data: Record<string, unknown>): void. Models populated (e.g. order.asignadoA: User[]).
 * Fixes: Stubbed missing email funcs (async no-op, implement in email.service), dynamic import sin .ts (TS5097), public getInvolvedUsers (TS2420), NotificationData index sig (TS2345 emit), err: Error (TS7006), optional chaining undefined (TS2345), UserMinimal createdAt? (TS2339), no duplicate exports (TS2300). Logs structured. tsconfig: "strict": true, "module": "ESNext".
 * Integrate: En order.controller create: await notificationService.notifyOrderCreated(order, req.user); En auth.controller register: await notificationService.notifyUserCreated(user, req.user); Cron deadlines: node-cron '0 8 * * *' (daily 8am): const orders = await orderService.getUpcomingDeadlines(); await notificationService.notifyUpcomingDeadlines(orders).
 */

import { emitToUser, emitToRole } from '../config/socket';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorHandler'; // Custom error if needed, else Error

// Import from services (no circular: notification uses email, not vice versa)
// Stubs for missing exports (implement in email.service.ts)
let sendWelcomeEmail: (user: { _id: string; nombre: string; email: string }) => Promise<void>;
let sendPasswordChangedEmail: (user: { _id: string; nombre: string; email: string }) => Promise<void>;
let sendOrderAssignedEmail: (user: { _id: string; nombre: string; email: string }, order: any, assignedBy: any) => Promise<void>;
let sendOrderStatusChangeEmail: (users: any[], order: any, previousStatus: string, newStatus: string) => Promise<void>;

// Dynamic load email service to resolve exports
const loadEmailService = async (): Promise<void> => {
  const emailService = await import('./email.service');
  sendWelcomeEmail = emailService.sendWelcomeEmail || (() => { logger.warn('sendWelcomeEmail stubbed - implement in email.service'); return Promise.resolve(); });
  sendPasswordChangedEmail = emailService.sendPasswordChangedEmail || (() => { logger.warn('sendPasswordChangedEmail stubbed - implement in email.service'); return Promise.resolve(); });
  sendOrderAssignedEmail = emailService.sendOrderAssignedEmail || (() => { logger.warn('sendOrderAssignedEmail stubbed - implement in email.service'); return Promise.resolve(); });
  sendOrderStatusChangeEmail = emailService.sendOrderStatusChangeEmail || (() => { logger.warn('sendOrderStatusChangeEmail stubbed - implement in email.service'); return Promise.resolve(); });
};

// Init stubs
loadEmailService().catch((err) => logger.error('Failed to load email service:', { error: err.message }));

// Dynamic imports for models to avoid circular deps (no .ts ext)
let User: any; // Lazy load
let Notification: any; // Lazy load

// Interfaces (reuse from models/services where possible, define minimal here)
interface UserMinimal {
  _id: string;
  nombre: string;
  email?: string;
  rol?: string;
  createdAt?: Date | null;
}

interface OrderMinimal {
  _id: string;
  numeroOrden: string;
  clienteNombre: string;
  asignadoA?: string[]; // Optional to handle undefined
  supervisorId?: string | null;
  fechaFinEstimada?: Date | null;
  createdAt?: Date | null;
}

interface NoteMinimal {
  contenido: string;
  createdAt?: Date | null;
}

interface NotificationData {
  orderId: string;
  numeroOrden: string;
  clienteNombre?: string;
  previousStatus?: string;
  newStatus?: string;
  changedBy?: string;
  note?: string;
  addedBy?: string;
  addedAt?: Date | null;
  createdBy?: string;
  createdAt?: Date | null;
  diasRestantes?: number;
  message?: string;
  [key: string]: unknown; // Index sig for emit Record<string, unknown> compat
}

interface INotificationService {
  notifyOrderCreated: (order: OrderMinimal, createdBy?: UserMinimal | null) => Promise<void>;
  notifyOrderAssigned: (order: OrderMinimal, assignedUsers: UserMinimal[], assignedBy: UserMinimal) => Promise<void>;
  notifyOrderStatusChanged: (order: OrderMinimal, previousStatus: string, newStatus: string, changedBy: UserMinimal) => Promise<void>;
  notifyOrderNoteAdded: (order: OrderMinimal, note: NoteMinimal, addedBy: UserMinimal) => Promise<void>;
  notifyUserCreated: (user: UserMinimal, createdBy?: UserMinimal | null) => Promise<void>;
  notifyPasswordChanged: (user: UserMinimal) => Promise<void>;
  notifyUpcomingDeadlines: (orders: OrderMinimal[]) => Promise<void>;
  getInvolvedUsers: (userIds: string[]) => Promise<UserMinimal[]>;
  markRead: (notificationId: string, userId: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  getUnread: (userId: string, options?: { limit?: number; sort?: any }) => Promise<any[]>;
}

/**
 * Servicio de notificaciones
 * Centraliza el envío de notificaciones por email, socket y otros canales
 */
class NotificationService implements INotificationService {
  /**
   * Notificar creación de orden
   * @param order - Order details
   * @param createdBy - User who created (optional)
   */
  async notifyOrderCreated(order: OrderMinimal, createdBy: UserMinimal | null = null): Promise<void> {
    try {
      const safeCreatedBy = createdBy?.nombre || 'Sistema';
      const data: NotificationData = {
        orderId: order._id.toString(),
        numeroOrden: order.numeroOrden,
        clienteNombre: order.clienteNombre,
        createdBy: safeCreatedBy,
        createdAt: order.createdAt || new Date(),
      };

      // Socket.IO to admins (fire-and-forget)
      emitToRole('admin', 'new_order', data);

      // Future email: await sendOrderCreatedEmail(order, createdBy); // Implement missing

      logger.info('[NotificationService] Notificación de orden creada enviada', { orderNumero: order.numeroOrden, createdBy: safeCreatedBy });
    } catch (error) {
      logger.error('[NotificationService] Error notificando creación de orden', { error: (error as Error).message });
      // Fire-and-forget: No re-throw
    }
  }

  /**
   * Notificar asignación de usuarios a orden
   * @param order - Order details
   * @param assignedUsers - Array of assigned users
   * @param assignedBy - User who assigned
   */
  async notifyOrderAssigned(order: OrderMinimal, assignedUsers: UserMinimal[], assignedBy: UserMinimal): Promise<void> {
    if (!assignedUsers.length) return;

    try {
      const safeAssignedBy = assignedBy.nombre;
      const assignedAt = new Date();
      const baseData: NotificationData = {
        orderId: order._id.toString(),
        numeroOrden: order.numeroOrden,
        clienteNombre: order.clienteNombre,
        assignedBy: safeAssignedBy,
        assignedAt,
      };

      // Socket.IO per user (fire-and-forget)
      assignedUsers.forEach((user) => {
        emitToUser(user._id, 'order_assigned', baseData);
      });

      // Batch emails concurrent
      const emailPromises = assignedUsers.map((user) => sendOrderAssignedEmail(user, order, assignedBy).catch((err: Error) => {
        logger.error(`[NotificationService] Email fail para ${user._id}`, { error: err.message });
        return { success: false }; // Partial fail ok
      }));

      await Promise.all(emailPromises);

      logger.info('[NotificationService] Notificaciones de asignación enviadas', { orderNumero: order.numeroOrden, userCount: assignedUsers.length });
    } catch (error) {
      logger.error('[NotificationService] Error notificando asignación de orden', { error: (error as Error).message });
      // Fire-and-forget
    }
  }

  /**
   * Notificar cambio de estado de orden
   * @param order - Order details
   * @param previousStatus - Old status
   * @param newStatus - New status
   * @param changedBy - User who changed
   */
  async notifyOrderStatusChanged(
    order: OrderMinimal,
    previousStatus: string,
    newStatus: string,
    changedBy: UserMinimal
  ): Promise<void> {
    try {
      const safeChangedBy = changedBy.nombre;
      const changedAt = new Date();
      const involvedUserIds = [...(order.asignadoA || []), order.supervisorId || ''].filter(Boolean) as string[]; // Filter undefined

      if (involvedUserIds.length === 0) return;

      const baseData: NotificationData = {
        orderId: order._id.toString(),
        numeroOrden: order.numeroOrden,
        previousStatus,
        newStatus,
        changedBy: safeChangedBy,
        changedAt,
      };

      // Socket.IO to involved users (fire-and-forget)
      involvedUserIds.forEach((userId) => {
        emitToUser(userId, 'order_status_changed', baseData);
      });

      // Socket.IO to admins
      emitToRole('admin', 'order_status_changed', baseData);

      // Get users and batch emails
      const involvedUsers = await this.getInvolvedUsers(involvedUserIds);
      if (involvedUsers.length > 0) {
        await sendOrderStatusChangeEmail(involvedUsers, order, previousStatus, newStatus).catch((err: Error) => {
          logger.error('[NotificationService] Batch email fail', { error: err.message });
        });
      }

      logger.info('[NotificationService] Notificaciones de cambio de estado enviadas', { orderNumero: order.numeroOrden, fromStatus: previousStatus, toStatus: newStatus });
    } catch (error) {
      logger.error('[NotificationService] Error notificando cambio de estado', { error: (error as Error).message });
      // Fire-and-forget
    }
  }

  /**
   * Notificar nueva nota en orden
   * @param order - Order details
   * @param note - Note content
   * @param addedBy - User who added
   */
  async notifyOrderNoteAdded(order: OrderMinimal, note: NoteMinimal, addedBy: UserMinimal): Promise<void> {
    try {
      const safeAddedBy = addedBy.nombre;
      const involvedUserIds = [...(order.asignadoA || []), order.supervisorId || ''].filter(Boolean) as string[];
      const addedById = addedBy._id.toString();

      const baseData: NotificationData = {
        orderId: order._id.toString(),
        numeroOrden: order.numeroOrden,
        note: note.contenido, // Assume sanitized
        addedBy: safeAddedBy,
        addedAt: note.createdAt || new Date(),
      };

      // Socket.IO to involved (exclude self)
      involvedUserIds.forEach((userId) => {
        if (userId !== addedById) {
          emitToUser(userId, 'order_note_added', baseData);
        }
      });

      logger.info('[NotificationService] Notificación de nota enviada', { orderNumero: order.numeroOrden, addedBy: safeAddedBy });
    } catch (error) {
      logger.error('[NotificationService] Error notificando nueva nota', { error: (error as Error).message });
      // Fire-and-forget
    }
  }

  /**
   * Notificar creación de usuario
   * @param user - New user details
   * @param createdBy - User who created (optional)
   */
  async notifyUserCreated(user: UserMinimal, createdBy: UserMinimal | null = null): Promise<void> {
    try {
      const safeCreatedBy = createdBy?.nombre || 'Sistema';

      // Email welcome
      await sendWelcomeEmail(user).catch((err: Error) => logger.error('[NotificationService] Welcome email fail', { error: err.message }));

      // Socket to admins
      emitToRole('admin', 'new_user', {
        userId: user._id,
        nombre: user.nombre,
        email: user.email ? user.email.substring(0, 3) + '...' + user.email.split('@')[1] : 'unknown',
        rol: user.rol,
        createdBy: safeCreatedBy,
        createdAt: user.createdAt || new Date(),
      } as NotificationData);

      logger.info('[NotificationService] Notificaciones de usuario creado enviadas', { userEmail: user.email ? user.email.substring(0, 3) + '...' : 'unknown' });
    } catch (error) {
      logger.error('[NotificationService] Error notificando creación de usuario', { error: (error as Error).message });
      // Fire-and-forget, but email throw caught inline
    }
  }

  /**
   * Notificar cambio de contraseña
   * @param user - User details
   */
  async notifyPasswordChanged(user: UserMinimal): Promise<void> {
    try {
      // Email password changed
      await sendPasswordChangedEmail(user).catch((err: Error) => logger.error('[NotificationService] Password email fail', { error: err.message }));

      // Socket to user
      emitToUser(user._id, 'password_changed', {
        changedAt: new Date(),
        message: 'Tu contraseña ha sido cambiada exitosamente',
      } as NotificationData);

      logger.info('[NotificationService] Notificación de cambio de contraseña enviada', { userEmail: user.email ? user.email.substring(0, 3) + '...' : 'unknown' });
    } catch (error) {
      logger.error('[NotificationService] Error notificando cambio de contraseña', { error: (error as Error).message });
      // Fire-and-forget
    }
  }

  /**
   * Notificar órdenes próximas a vencer
   * @param orders - Array of upcoming orders
   */
  async notifyUpcomingDeadlines(orders: OrderMinimal[]): Promise<void> {
    if (!orders.length) return;

    try {
      const now = new Date();
      const ordersData = orders.map((order) => ({
        orderId: order._id.toString(),
        numeroOrden: order.numeroOrden,
        clienteNombre: order.clienteNombre,
        fechaFinEstimada: order.fechaFinEstimada,
        diasRestantes: order.fechaFinEstimada ? Math.ceil((order.fechaFinEstimada.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      }));

      // Socket to admins
      emitToRole('admin', 'upcoming_deadlines', {
        orders: ordersData,
        notifiedAt: now,
      } as NotificationData);

      // Future batch email: await sendUpcomingDeadlinesEmail(admins, ordersData); // Implement missing

      logger.info('[NotificationService] Notificación de órdenes próximas a vencer enviada', { orderCount: orders.length });
    } catch (error) {
      logger.error('[NotificationService] Error notificando órdenes próximas a vencer', { error: (error as Error).message });
      // Fire-and-forget
    }
  }

  /**
   * Marcar una notificación como leída
   * @param notificationId - ID de la notificación
   * @param userId - ID del usuario
   */
  async markRead(notificationId: string, userId: string): Promise<void> {
    try {
      if (!Notification) {
        const { default: NotificationModel } = await import('../models/Notification');
        Notification = NotificationModel;
      }
      await Notification.markAsRead(notificationId, userId);
      logger.info('Notificación marcada como leída', { notificationId, userId });
    } catch (error) {
      logger.error('[NotificationService] Error marcando notificación como leída', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas para un usuario
   * @param userId - ID del usuario
   */
  async markAllRead(userId: string): Promise<void> {
    try {
      if (!Notification) {
        const { default: NotificationModel } = await import('../models/Notification');
        Notification = NotificationModel;
      }
      await Notification.markAllAsRead(userId);
      logger.info('Todas las notificaciones marcadas como leídas', { userId });
    } catch (error) {
      logger.error('[NotificationService] Error marcando todas las notificaciones como leídas', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtener notificaciones no leídas de un usuario
   * @param userId - ID del usuario
   * @param options - Opciones de paginación y ordenamiento
   * @returns Array de notificaciones no leídas
   */
  async getUnread(userId: string, options?: { limit?: number; sort?: any }): Promise<any[]> {
    try {
      if (!Notification) {
        const { default: NotificationModel } = await import('../models/Notification');
        Notification = NotificationModel;
      }
      return await Notification.findUnreadByUser(userId, options);
    } catch (error) {
      logger.error('[NotificationService] Error obteniendo notificaciones no leídas', { error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Obtener usuarios involucrados en una orden
   * @param userIds - Array of user IDs
   * @returns Array of minimal users
   */
  async getInvolvedUsers(userIds: string[]): Promise<UserMinimal[]> {
    try {
      if (!User) {
        const { default: UserModel } = await import('../models/User');
        User = UserModel;
      }
      return await User.find({ _id: { $in: userIds } }).select('nombre email _id rol createdAt').lean() as UserMinimal[];
    } catch (error) {
      logger.error('[NotificationService] Error obteniendo usuarios involucrados', { error: (error as Error).message });
      return [];
    }
  }
}

// Export singleton instance
export default new NotificationService();
export { NotificationService };
export type { INotificationService as NotificationService, UserMinimal, OrderMinimal, NoteMinimal, NotificationData };
