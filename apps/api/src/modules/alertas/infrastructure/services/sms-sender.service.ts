/**
 * @service SmsSenderService
 *
 * Servicio para envío de alertas por SMS
 * Usa APIs REST gratuitas/open source cuando sea posible
 * Implementa Strategy Pattern
 *
 * Opciones open source/gratuitas:
 * - Twilio (trial gratuito)
 * - TextBelt (gratuito con límites)
 * - SMS Gateway API (varios proveedores gratuitos)
 */

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { INotificationSender } from "./notification-sender.interface";
import { Alerta } from "../../domain/entities/alerta.entity";
import { CanalNotificacionEnum } from "../../domain/value-objects/canal-notificacion.vo";

@Injectable()
export class SmsSenderService implements INotificationSender {
  private readonly logger = new Logger(SmsSenderService.name);
  private readonly smsProvider: "twilio" | "textbelt" | "custom" | null;

  constructor(private readonly config: ConfigService) {
    // Determinar proveedor desde configuración
    const provider = this.config.get("SMS_PROVIDER") || "textbelt";
    this.smsProvider = ["twilio", "textbelt", "custom"].includes(provider)
      ? (provider as any)
      : null;
    this.logger.log(
      `SmsSenderService inicializado con proveedor: ${this.smsProvider || "ninguno"}`,
    );
  }

  async send(alerta: Alerta, destinatario: any): Promise<void> {
    if (!destinatario?.phone) {
      throw new Error("Usuario no tiene teléfono registrado");
    }

    // Limitar mensaje a 160 caracteres (límite SMS)
    const mensaje = `[${alerta.getPrioridad().getValue()}] ${alerta.getTitulo()}: ${alerta.getMensaje()}`;
    const mensajeLimitado = mensaje.substring(0, 160);

    try {
      switch (this.smsProvider) {
        case "twilio":
          await this.sendWithTwilio(destinatario.phone, mensajeLimitado);
          break;
        case "textbelt":
          await this.sendWithTextBelt(destinatario.phone, mensajeLimitado);
          break;
        case "custom":
          await this.sendWithCustomAPI(destinatario.phone, mensajeLimitado);
          break;
        default:
          this.logger.warn(
            `SMS no enviado: proveedor no configurado. Configure SMS_PROVIDER`,
          );
          this.logger.warn(`Opciones: twilio, textbelt, custom`);
          return;
      }

      this.logger.log(`📱 SMS enviado a ${destinatario.phone}`, {
        alertaId: alerta.getId().getValue(),
        provider: this.smsProvider,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error enviando SMS a ${destinatario.phone}:`,
        errorMessage,
      );
      throw error;
    }
  }

  getCanal(): string {
    return CanalNotificacionEnum.SMS;
  }

  /**
   * Enviar con Twilio (trial gratuito disponible)
   */
  private async sendWithTwilio(phone: string, message: string): Promise<void> {
    const accountSid = this.config.get("TWILIO_ACCOUNT_SID");
    const authToken = this.config.get("TWILIO_AUTH_TOKEN");
    const fromNumber = this.config.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error(
        "Twilio no configurado. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER",
      );
    }

    // Usar fetch API (nativo, sin dependencias)
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: phone,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      const errorData = error as { message?: string };
      throw new Error(
        `Twilio error: ${errorData.message || response.statusText}`,
      );
    }
  }

  /**
   * Enviar con TextBelt (gratuito, con límites)
   */
  private async sendWithTextBelt(
    phone: string,
    message: string,
  ): Promise<void> {
    const apiKey = this.config.get("TEXTBELT_API_KEY");

    // TextBelt es gratuito pero requiere API key para producción
    // En desarrollo puede funcionar sin key (con límites)
    const response = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        message,
        key: apiKey || "textbelt", // Key por defecto para desarrollo
      }),
    });

    const result = (await response.json()) as {
      success: boolean;
      error?: string;
    };

    if (!result.success) {
      throw new Error(`TextBelt error: ${result.error || "Unknown error"}`);
    }
  }

  /**
   * Enviar con API personalizada (configurable)
   */
  private async sendWithCustomAPI(
    phone: string,
    message: string,
  ): Promise<void> {
    const apiUrl = this.config.get("SMS_API_URL");
    const apiKey = this.config.get("SMS_API_KEY");

    if (!apiUrl) {
      throw new Error("SMS_API_URL no configurada para proveedor custom");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        to: phone,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom SMS API error: ${response.statusText}`);
    }
  }
}
