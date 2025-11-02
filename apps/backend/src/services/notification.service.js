import { sendEmail } from './email.service.js';
import { emitToUser, emitToRole } from '../config/socket.js';
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * Servicio de notificaciones
 * Centraliza el envío de notificaciones por email, socket y otros canales
 */
class NotificationService {
  /**
   * Notificar creación de orden
   */
  async notifyOrderCreated(order, createdBy = null) {
    try {
      // Notificación por Socket.IO a admins
      emitToRole('admin', 'new_order', {
        orderId: order._id,
        numeroOrden: order.numeroOrden,
        clienteNombre: order.clienteNombre,
        createdBy: createdBy?.nombre || 'Sistema',
        createdAt: order.createdAt,
      });

      // Email a admins (futuro)
      // await this.sendOrderCreatedEmail(order, createdBy);

      logger.info(`[NotificationService] Notificación de orden creada enviada: ${order.numeroOrden}`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando creación de orden:', error);
      // No fallar la operación principal por error en notificaciones
    }
  }

  /**
   * Notificar asignación de usuarios a orden
   */
  async notifyOrderAssigned(order, assignedUsers, assignedBy) {
    try {
      // Notificaciones por Socket.IO
      for (const user of assignedUsers) {
        emitToUser(user._id.toString(), 'order_assigned', {
          orderId: order._id,
          numeroOrden: order.numeroOrden,
          clienteNombre: order.clienteNombre,
          assignedBy: assignedBy.nombre,
          assignedAt: new Date(),
        });
      }

      // Emails de asignación
      for (const user of assignedUsers) {
        await this.sendOrderAssignedEmail(user, order, assignedBy);
      }

      logger.info(`[NotificationService] Notificaciones de asignación enviadas: ${order.numeroOrden}`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando asignación de orden:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Notificar cambio de estado de orden
   */
  async notifyOrderStatusChanged(order, previousStatus, newStatus, changedBy) {
    try {
      // Obtener usuarios involucrados
      const involvedUserIds = [...order.asignadoA, order.supervisorId].filter(Boolean);

      // Notificación por Socket.IO a usuarios involucrados
      involvedUserIds.forEach(userId => {
        emitToUser(userId.toString(), 'order_status_changed', {
          orderId: order._id,
          numeroOrden: order.numeroOrden,
          previousStatus,
          newStatus,
          changedBy: changedBy.nombre,
          changedAt: new Date(),
        });
      });

      // Notificación por Socket.IO a admins
      emitToRole('admin', 'order_status_changed', {
        orderId: order._id,
        numeroOrden: order.numeroOrden,
        previousStatus,
        newStatus,
        changedBy: changedBy.nombre,
      });

      // Emails de cambio de estado
      const involvedUsers = await this.getInvolvedUsers(involvedUserIds);
      await this.sendOrderStatusChangeEmail(involvedUsers, order, previousStatus, newStatus, changedBy);

      logger.info(`[NotificationService] Notificaciones de cambio de estado enviadas: ${order.numeroOrden} (${previousStatus}  ${newStatus})`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando cambio de estado:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Notificar nueva nota en orden
   */
  async notifyOrderNoteAdded(order, note, addedBy) {
    try {
      const involvedUserIds = [...order.asignadoA, order.supervisorId].filter(Boolean);

      // Notificación por Socket.IO (excepto al autor de la nota)
      involvedUserIds.forEach(userId => {
        if (userId.toString() !== addedBy._id.toString()) {
          emitToUser(userId.toString(), 'order_note_added', {
            orderId: order._id,
            numeroOrden: order.numeroOrden,
            note: note.contenido,
            addedBy: addedBy.nombre,
            addedAt: note.createdAt,
          });
        }
      });

      logger.info(`[NotificationService] Notificación de nota enviada: ${order.numeroOrden}`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando nueva nota:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Notificar creación de usuario
   */
  async notifyUserCreated(user, createdBy = null) {
    try {
      // Email de bienvenida
      await this.sendWelcomeEmail(user);

      // Notificación por Socket.IO a admins
      emitToRole('admin', 'new_user', {
        userId: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        createdBy: createdBy?.nombre || 'Sistema',
        createdAt: user.createdAt,
      });

      logger.info(`[NotificationService] Notificaciones de usuario creado enviadas: ${user.email}`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando creación de usuario:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Notificar cambio de contraseña
   */
  async notifyPasswordChanged(user) {
    try {
      await this.sendPasswordChangedEmail(user);

      // Notificación por Socket.IO al usuario
      emitToUser(user._id.toString(), 'password_changed', {
        changedAt: new Date(),
        message: 'Tu contraseña ha sido cambiada exitosamente',
      });

      logger.info(`[NotificationService] Notificación de cambio de contraseña enviada: ${user.email}`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando cambio de contraseña:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Notificar órdenes próximas a vencer
   */
  async notifyUpcomingDeadlines(orders) {
    try {
      // Notificación por Socket.IO a admins
      emitToRole('admin', 'upcoming_deadlines', {
        orders: orders.map(order => ({
          orderId: order._id,
          numeroOrden: order.numeroOrden,
          clienteNombre: order.clienteNombre,
          fechaFinEstimada: order.fechaFinEstimada,
          diasRestantes: Math.ceil((new Date(order.fechaFinEstimada) - new Date()) / (1000 * 60 * 60 * 24)),
        })),
        notifiedAt: new Date(),
      });

      // Email a admins (futuro)
      // await this.sendUpcomingDeadlinesEmail(orders);

      logger.info(`[NotificationService] Notificación de órdenes próximas a vencer enviada (${orders.length} órdenes)`);
    } catch (error) {
      logger.error('[NotificationService] Error notificando órdenes próximas a vencer:', error);
      // No fallar la operación principal
    }
  }

  /**
   * Enviar email de bienvenida
   */
  async sendWelcomeEmail(user) {
    try {
      const subject = 'Bienvenido a CERMONT ATG';
      const text = `
        Hola ${user.nombre}!

        Bienvenido al sistema de gestión CERMONT ATG.

        Tu cuenta ha sido creada exitosamente con el rol: ${user.rol}

        Email: ${user.email}

        Si tienes alguna pregunta, no dudes en contactar al administrador.

        Saludos,
        Equipo CERMONT
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bienvenido a CERMONT ATG!</h2>
          <p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Tu cuenta ha sido creada exitosamente en el sistema de gestión CERMONT ATG.</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rol:</strong> ${user.rol}</p>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactar al administrador del sistema.</p>
          <br>
          <p>Saludos,<br>Equipo CERMONT</p>
        </div>
      `;

      await sendEmail(user.email, subject, text, html);
    } catch (error) {
      logger.error('[NotificationService] Error enviando email de bienvenida:', error);
      throw error;
    }
  }

  /**
   * Enviar email de asignación de orden
   */
  async sendOrderAssignedEmail(user, order, assignedBy) {
    try {
      const subject = `Nueva orden asignada: ${order.numeroOrden}`;
      const text = `
        Hola ${user.nombre},

        Se te ha asignado la orden de trabajo: ${order.numeroOrden}

        Cliente: ${order.clienteNombre}
        Asignado por: ${assignedBy.nombre}
        Fecha de asignación: ${new Date().toLocaleDateString('es-ES')}

        Por favor revisa los detalles de la orden en el sistema.

        Saludos,
        Equipo CERMONT
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Nueva orden asignada</h2>
          <p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Se te ha asignado la siguiente orden de trabajo:</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Número de orden:</strong> ${order.numeroOrden}</p>
            <p><strong>Cliente:</strong> ${order.clienteNombre}</p>
            <p><strong>Asignado por:</strong> ${assignedBy.nombre}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <p>Por favor revisa los detalles de la orden en el sistema.</p>
          <br>
          <p>Saludos,<br>Equipo CERMONT</p>
        </div>
      `;

      await sendEmail(user.email, subject, text, html);
    } catch (error) {
      logger.error('[NotificationService] Error enviando email de asignación:', error);
      throw error;
    }
  }

  /**
   * Enviar email de cambio de estado de orden
   */
  async sendOrderStatusChangeEmail(users, order, previousStatus, newStatus, changedBy) {
    try {
      const subject = `Cambio de estado en orden ${order.numeroOrden}`;

      for (const user of users) {
        const text = `
          Hola ${user.nombre},

          La orden ${order.numeroOrden} ha cambiado de estado:

          Cliente: ${order.clienteNombre}
          Estado anterior: ${previousStatus}
          Estado nuevo: ${newStatus}
          Cambiado por: ${changedBy.nombre}
          Fecha: ${new Date().toLocaleDateString('es-ES')}

          Saludos,
          Equipo CERMONT
        `;

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Cambio de estado en orden</h2>
            <p>Hola <strong>${user.nombre}</strong>,</p>
            <p>La orden ha cambiado de estado:</p>
            <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Número de orden:</strong> ${order.numeroOrden}</p>
              <p><strong>Cliente:</strong> ${order.clienteNombre}</p>
              <p><strong>Estado anterior:</strong> ${previousStatus}</p>
              <p><strong>Estado nuevo:</strong> ${newStatus}</p>
              <p><strong>Cambiado por:</strong> ${changedBy.nombre}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
            <br>
            <p>Saludos,<br>Equipo CERMONT</p>
          </div>
        `;

        await sendEmail(user.email, subject, text, html);
      }
    } catch (error) {
      logger.error('[NotificationService] Error enviando email de cambio de estado:', error);
      throw error;
    }
  }

  /**
   * Enviar email de cambio de contraseña
   */
  async sendPasswordChangedEmail(user) {
    try {
      const subject = 'Contraseña cambiada - CERMONT ATG';
      const text = `
        Hola ${user.nombre},

        Tu contraseña ha sido cambiada exitosamente.

        Si no realizaste este cambio, contacta inmediatamente al administrador.

        Email: ${user.email}
        Fecha: ${new Date().toLocaleDateString('es-ES')}

        Saludos,
        Equipo CERMONT
      `;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Contraseña cambiada</h2>
          <p>Hola <strong>${user.nombre}</strong>,</p>
          <p>Tu contraseña ha sido cambiada exitosamente.</p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0;"><strong> Importante:</strong> Si no realizaste este cambio, contacta inmediatamente al administrador del sistema.</p>
          </div>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          <br>
          <p>Saludos,<br>Equipo CERMONT</p>
        </div>
      `;

      await sendEmail(user.email, subject, text, html);
    } catch (error) {
      logger.error('[NotificationService] Error enviando email de cambio de contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios involucrados en una orden
   */
  async getInvolvedUsers(userIds) {
    try {
      // Importar User aquí para evitar dependencias circulares
      const { default: User } = await import('../models/User.js');
      return await User.find({ _id: { $in: userIds } }).select('nombre email');
    } catch (error) {
      logger.error('[NotificationService] Error obteniendo usuarios involucrados:', error);
      return [];
    }
  }
}

// Exportar instancia única (singleton)
export default new NotificationService();
