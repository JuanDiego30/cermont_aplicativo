/**
 * @service EmailSenderService
 * 
 * Servicio para envío de alertas por correo electrónico
 * Implementa Strategy Pattern
 */

import { Injectable, Logger } from '@nestjs/common';
import { INotificationSender } from './notification-sender.interface';
import { Alerta } from '../../domain/entities/alerta.entity';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';
import { NotificationsService } from '../../../notifications/notifications.service';
import {
  renderAlertaEmailHtml,
  renderAlertaEmailText,
} from '../../../../templates/emails/alerta-email.template';

@Injectable()
export class EmailSenderService implements INotificationSender {
  private readonly logger = new Logger(EmailSenderService.name);

  constructor(private readonly notifications: NotificationsService) {}

  async send(alerta: Alerta, destinatario: any): Promise<void> {
    if (!destinatario?.email) {
      throw new Error('Usuario no tiene email registrado');
    }

    const prioridadLabel = alerta.getPrioridad().getValue();
    const prioridadCssClass = prioridadLabel.toLowerCase();

    const htmlContent = renderAlertaEmailHtml({
      titulo: alerta.getTitulo(),
      mensaje: alerta.getMensaje(),
      prioridadLabel,
      prioridadCssClass,
      prioridadColor: alerta.getPrioridad().getColor(),
      fechaLocaleString: alerta.getCreatedAt().toLocaleString('es-ES'),
    });

    const textContent = renderAlertaEmailText({
      titulo: alerta.getTitulo(),
      mensaje: alerta.getMensaje(),
      prioridadLabel,
      fechaLocaleString: alerta.getCreatedAt().toLocaleString('es-ES'),
    });

    await this.notifications.sendEmail({
      to: destinatario.email,
      subject: `[${prioridadLabel}] ${alerta.getTitulo()}`,
      html: htmlContent,
      text: textContent,
    });

    this.logger.log(`📧 Email encolado/enviado a ${destinatario.email}`, {
      alertaId: alerta.getId().getValue(),
    });
  }

  getCanal(): string {
    return CanalNotificacionEnum.EMAIL;
  }
}
