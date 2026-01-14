/**
 * @interface INotificationSender
 *
 * Interfaz para servicios de envío de notificaciones (Strategy Pattern)
 */

import { Alerta } from "../../domain/entities/alerta.entity";

export interface INotificationSender {
  /**
   * Envía una alerta por el canal correspondiente
   * @param alerta - Entidad de dominio Alerta
   * @param destinatario - Datos del usuario destinatario
   */
  send(alerta: Alerta, destinatario: any): Promise<void>;

  /**
   * Obtiene el nombre del canal que maneja este sender
   */
  getCanal(): string;
}
