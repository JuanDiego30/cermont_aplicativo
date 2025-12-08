// ============================================
// useNotifications Hook - Cermont FSM
// ============================================

'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from './use-socket';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

export function useNotifications() {
  const { subscribe, connected } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!connected) return;

    // Orden actualizada
    const unsubOrdenUpdated = subscribe('orden:updated', (data: any) => {
      const notification = createNotification(
        'orden-updated',
        'Orden actualizada',
        `La orden ${data.numero || data.ordenId} ha sido actualizada`,
        data
      );
      addNotification(notification);
      toast.info(notification.title, { description: notification.message });
    });

    // Cambio de estado
    const unsubOrdenEstado = subscribe('orden:estado', (data: any) => {
      const notification = createNotification(
        'orden-estado',
        'Estado actualizado',
        `La orden cambió a: ${data.estado}`,
        data
      );
      addNotification(notification);
      toast.info(notification.title, { description: notification.message });
    });

    // Nueva evidencia
    const unsubEvidencia = subscribe('evidencia:new', (data: any) => {
      const notification = createNotification(
        'evidencia',
        'Nueva evidencia',
        `Se subió una nueva evidencia: ${data.tipo}`,
        data
      );
      addNotification(notification);
      toast.success(notification.title, { description: notification.message });
    });

    // Ejecución completada
    const unsubEjecucionComplete = subscribe('ejecucion:completed', (data: any) => {
      const notification = createNotification(
        'ejecucion-completed',
        'Ejecución completada',
        'La ejecución ha sido completada exitosamente',
        data
      );
      addNotification(notification);
      toast.success(notification.title, { description: notification.message });
    });

    // Usuario online
    const unsubUserOnline = subscribe('user:online', (data: any) => {
      console.log(`Usuario ${data.userId} está online`);
    });

    // Mensaje de chat
    const unsubChatMessage = subscribe('chat:message', (data: any) => {
      const notification = createNotification(
        'chat',
        'Nuevo mensaje',
        data.message.substring(0, 50) + (data.message.length > 50 ? '...' : ''),
        data
      );
      addNotification(notification);
      toast.message('Nuevo mensaje', { description: notification.message });
    });

    return () => {
      unsubOrdenUpdated();
      unsubOrdenEstado();
      unsubEvidencia();
      unsubEjecucionComplete();
      unsubUserOnline();
      unsubChatMessage();
    };
  }, [connected, subscribe]);

  // Actualizar contador de no leídas
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  const createNotification = (
    type: string,
    title: string,
    message: string,
    data?: any
  ): Notification => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    data,
  });

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Máximo 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification,
  };
}

// ============================================
// usePushNotifications - Web Push
// ============================================

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Verificar soporte
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      setSubscription(sub);

      // Enviar suscripción al backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
        credentials: 'include',
      });

      return sub;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();

      // Notificar al backend
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
        credentials: 'include',
      });

      setSubscription(null);
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscription,
  };
}

// Helper para convertir VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default useNotifications;
