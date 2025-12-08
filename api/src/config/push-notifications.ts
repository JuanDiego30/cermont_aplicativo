// ============================================
// Push Notifications - Cermont FSM
// ============================================

import webpush from 'web-push';
import { prisma } from './database.js';
import { logger } from './logger.js';

// ============================================
// Inicialización
// ============================================

export function initPushNotifications() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:noreply@cermont.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.warn('VAPID keys not configured. Push notifications disabled.');
    return;
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    logger.info('Push notifications initialized');
  } catch (error) {
    logger.error('Failed to initialize push notifications:', error);
  }
}

// ============================================
// Tipos
// ============================================

interface PushPayload {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// ============================================
// Funciones de Notificación
// ============================================

/**
 * Enviar notificación push a un usuario
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<void> {
  try {
    // Obtener suscripciones del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      logger.debug(`No push subscriptions for user: ${userId}`);
      return;
    }

    const notification = JSON.stringify({
      ...payload,
      icon: payload.icon || '/logo-192.png',
      badge: payload.badge || '/logo-72.png',
      timestamp: Date.now(),
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub: { endpoint: string; auth: string; p256dh: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              auth: sub.auth,
              p256dh: sub.p256dh,
            },
          },
          notification
        )
      )
    );

    // Manejar suscripciones inválidas
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const error = result.reason as any;
        if (error.statusCode === 410 || error.statusCode === 404) {
          // Suscripción expirada, eliminar
          await prisma.pushSubscription.delete({
            where: { id: subscriptions[i].id },
          });
          logger.debug(`Removed expired subscription for user: ${userId}`);
        } else {
          logger.error(`Push notification failed for user ${userId}:`, error);
        }
      }
    }

    const successful = results.filter((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled').length;
    logger.debug(`Push sent to ${successful}/${subscriptions.length} devices for user: ${userId}`);
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
}

/**
 * Enviar notificación a múltiples usuarios
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload
): Promise<void> {
  await Promise.all(
    userIds.map((userId) => sendPushNotification(userId, payload))
  );
}

/**
 * Broadcast a todos los usuarios con suscripción
 */
export async function broadcastPush(
  payload: PushPayload,
  excludeUserIds?: string[]
): Promise<void> {
  try {
    const where: any = {};
    if (excludeUserIds && excludeUserIds.length > 0) {
      where.userId = { notIn: excludeUserIds };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where,
      select: { userId: true },
      distinct: ['userId'],
    });

    const userIds = subscriptions.map((s: { userId: string }) => s.userId);
    await sendPushToUsers(userIds, payload);

    logger.info(`Broadcast push sent to ${userIds.length} users`);
  } catch (error) {
    logger.error('Error broadcasting push:', error);
  }
}

// ============================================
// Notificaciones Predefinidas
// ============================================

/**
 * Notificar nueva orden asignada
 */
export async function notifyNewOrderAssigned(
  userId: string,
  ordenNumero: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: 'Nueva orden asignada',
    body: `Se te ha asignado la orden ${ordenNumero}`,
    tag: 'orden-asignada',
    data: { type: 'orden', ordenNumero },
    actions: [
      { action: 'view', title: 'Ver orden' },
      { action: 'dismiss', title: 'Ignorar' },
    ],
  });
}

/**
 * Notificar cambio de estado de orden
 */
export async function notifyOrderStatusChange(
  userId: string,
  ordenNumero: string,
  nuevoEstado: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: 'Estado de orden actualizado',
    body: `La orden ${ordenNumero} cambió a: ${nuevoEstado}`,
    tag: `orden-estado-${ordenNumero}`,
    data: { type: 'orden-estado', ordenNumero, estado: nuevoEstado },
  });
}

/**
 * Notificar tarea completada
 */
export async function notifyTaskCompleted(
  userId: string,
  ordenNumero: string,
  tareaNombre: string
): Promise<void> {
  await sendPushNotification(userId, {
    title: 'Tarea completada',
    body: `${tareaNombre} de la orden ${ordenNumero}`,
    tag: `tarea-${ordenNumero}`,
    data: { type: 'tarea', ordenNumero, tarea: tareaNombre },
  });
}

/**
 * Notificar recordatorio
 */
export async function notifyReminder(
  userId: string,
  title: string,
  body: string
): Promise<void> {
  await sendPushNotification(userId, {
    title,
    body,
    tag: 'reminder',
    data: { type: 'reminder' },
  });
}

export default {
  initPushNotifications,
  sendPushNotification,
  sendPushToUsers,
  broadcastPush,
  notifyNewOrderAssigned,
  notifyOrderStatusChange,
  notifyTaskCompleted,
  notifyReminder,
};
