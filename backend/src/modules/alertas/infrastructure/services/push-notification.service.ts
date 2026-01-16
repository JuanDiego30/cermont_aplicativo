/**
 * @service PushNotificationService
 *
 * Servicio para envío de notificaciones push usando Web Push API (open source)
 * No requiere Firebase, usa estándares web abiertos
 * Implementa Strategy Pattern
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRequire } from 'node:module';
import { Alerta } from '../../domain/entities/alerta.entity';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';
import { INotificationSender } from './notification-sender.interface';

// web-push es open source y gratuito
let webpush: any;
try {
  const require = createRequire(import.meta.url);
  webpush = require('web-push');
} catch (error) {
  Logger.warn('web-push no está instalado. Instalar con: npm install web-push @types/web-push');
}

@Injectable()
export class PushNotificationService implements INotificationSender {
  private readonly logger = new Logger(PushNotificationService.name);
  private vapidKeys: { publicKey: string; privateKey: string } | null = null;

  constructor(private readonly config: ConfigService) {
    this.initializeVapidKeys();
  }

  private initializeVapidKeys(): void {
    if (!webpush) {
      this.logger.warn('web-push no disponible. Push notifications no se enviarán.');
      return;
    }

    try {
      // VAPID keys desde variables de entorno o generar automáticamente
      const publicKey = this.config.get('VAPID_PUBLIC_KEY');
      const privateKey = this.config.get('VAPID_PRIVATE_KEY');

      if (publicKey && privateKey) {
        this.vapidKeys = { publicKey, privateKey };
        webpush.setVapidDetails(
          'mailto:' + (this.config.get('VAPID_EMAIL') || 'noreply@cermont.com'),
          publicKey,
          privateKey
        );
        this.logger.log('✅ PushNotificationService configurado con VAPID keys');
      } else {
        // Generar keys automáticamente en desarrollo (no recomendado para producción)
        this.logger.warn('VAPID keys no configuradas. Generando keys temporales para desarrollo.');
        this.logger.warn('Para producción, configure VAPID_PUBLIC_KEY y VAPID_PRIVATE_KEY');
        this.logger.warn('Generar con: npx web-push generate-vapid-keys');

        // Generar keys temporales (solo desarrollo)
        const generated = webpush.generateVAPIDKeys();
        this.vapidKeys = {
          publicKey: generated.publicKey,
          privateKey: generated.privateKey,
        };
        webpush.setVapidDetails(
          'mailto:noreply@cermont.com',
          generated.publicKey,
          generated.privateKey
        );
        this.logger.warn('⚠️  Usando VAPID keys temporales. No usar en producción.');
      }
    } catch (error) {
      this.logger.error('Error inicializando VAPID keys:', error);
    }
  }

  async send(alerta: Alerta, destinatario: any): Promise<void> {
    if (!destinatario?.pushSubscription) {
      throw new Error('Usuario no tiene push subscription registrada');
    }

    if (!webpush) {
      this.logger.warn('Push notification no enviada: web-push no instalado');
      return;
    }

    if (!this.vapidKeys) {
      throw new Error('VAPID keys no configuradas');
    }

    try {
      const payload = JSON.stringify({
        title: alerta.getTitulo(),
        body: alerta.getMensaje(),
        icon: '/assets/icon-192x192.png', // Icono de la app
        badge: '/assets/badge-72x72.png',
        data: {
          alertaId: alerta.getId().getValue(),
          prioridad: alerta.getPrioridad().getValue(),
          tipo: alerta.getTipo().getValue(),
          timestamp: alerta.getCreatedAt().toISOString(),
          url: `/alertas/${alerta.getId().getValue()}`,
        },
        requireInteraction: alerta.getPrioridad().esCritica(), // Mostrar hasta que el usuario interactúe si es crítica
      });

      // Enviar push notification
      await webpush.sendNotification(destinatario.pushSubscription, payload);

      this.logger.log(`📱 Push notification enviada`, {
        alertaId: alerta.getId().getValue(),
        titulo: alerta.getTitulo(),
      });
    } catch (error: any) {
      // Manejar errores específicos de web-push
      if (error.statusCode === 410) {
        // Subscription expirada o inválida
        this.logger.warn(`Push subscription expirada para usuario ${destinatario.id}`);
        throw new Error('Push subscription expirada');
      } else if (error.statusCode === 429) {
        // Rate limit excedido
        this.logger.warn('Rate limit excedido para push notifications');
        throw new Error('Rate limit excedido');
      } else {
        this.logger.error(`Error enviando push notification:`, error);
        throw error;
      }
    }
  }

  getCanal(): string {
    return CanalNotificacionEnum.PUSH;
  }

  /**
   * Obtener VAPID public key para el cliente
   */
  getVapidPublicKey(): string | null {
    return this.vapidKeys?.publicKey || null;
  }
}
