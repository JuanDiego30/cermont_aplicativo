/**
 * @service InAppNotificationService
 * 
 * Servicio para notificaciones en tiempo real dentro de la aplicación (WebSocket)
 * Implementa Strategy Pattern
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { INotificationSender } from './notification-sender.interface';
import { Alerta } from '../../domain/entities/alerta.entity';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';
import { AlertasGateway } from '../gateway/alertas.gateway';

@Injectable()
export class InAppNotificationService implements INotificationSender {
  private readonly logger = new Logger(InAppNotificationService.name);

  constructor(
    @Optional() @Inject('AlertasGateway') private readonly websocketGateway?: AlertasGateway,
  ) {
    this.logger.log('InAppNotificationService inicializado');
  }

  async send(alerta: Alerta, destinatario: any): Promise<void> {
    if (!destinatario?.id) {
      throw new Error('Usuario no tiene ID registrado');
    }

    const payload = {
      id: alerta.getId().getValue(),
      tipo: alerta.getTipo().getValue(),
      prioridad: alerta.getPrioridad().getValue(),
      titulo: alerta.getTitulo(),
      mensaje: alerta.getMensaje(),
      estado: alerta.getEstado().getValue(),
      createdAt: alerta.getCreatedAt().toISOString(),
    };

    // Enviar por WebSocket al cliente usando el gateway
    if (this.websocketGateway) {
      this.websocketGateway.sendNotificationToUser(destinatario.id, payload);
      this.logger.log(`💬 Notificación in-app enviada a usuario ${destinatario.id}`, {
        alertaId: alerta.getId().getValue(),
      });
    } else {
      this.logger.warn('WebSocket Gateway no está disponible. Notificación in-app no enviada.');
    }
  }

  getCanal(): string {
    return CanalNotificacionEnum.IN_APP;
  }
}

