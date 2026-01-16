/**
 * @service NotificationSenderFactory
 *
 * Factory Pattern para obtener el sender apropiado según el canal
 */

import { Injectable, Logger } from '@nestjs/common';
import { CanalNotificacionEnum } from '../domain/value-objects/canal-notificacion.vo';
import { EmailSenderService } from './email-sender.service';
import { InAppNotificationService } from './in-app-notification.service';
import { INotificationSender } from './notification-sender.interface';
import { PushNotificationService } from './push-notification.service';
import { SmsSenderService } from './sms-sender.service';

@Injectable()
export class NotificationSenderFactory {
  private readonly logger = new Logger(NotificationSenderFactory.name);

  constructor(
    private readonly emailSender: EmailSenderService,
    private readonly pushSender: PushNotificationService,
    private readonly smsSender: SmsSenderService,
    private readonly inAppSender: InAppNotificationService
  ) {}

  /**
   * Obtiene el sender apropiado para un canal
   * @param canal - Nombre del canal (EMAIL, PUSH, SMS, IN_APP)
   * @returns INotificationSender implementación
   * @throws Error si el canal no es soportado
   */
  getSender(canal: string): INotificationSender {
    const senders: Record<string, INotificationSender> = {
      [CanalNotificacionEnum.EMAIL]: this.emailSender,
      [CanalNotificacionEnum.PUSH]: this.pushSender,
      [CanalNotificacionEnum.SMS]: this.smsSender,
      [CanalNotificacionEnum.IN_APP]: this.inAppSender,
    };

    const sender = senders[canal];
    if (!sender) {
      const error = new Error(`Canal no soportado: ${canal}`);
      this.logger.error(error.message, { canal });
      throw error;
    }

    return sender;
  }

  /**
   * Obtiene múltiples senders para una lista de canales
   */
  getSenders(canales: string[]): INotificationSender[] {
    return canales.map(canal => this.getSender(canal));
  }
}
