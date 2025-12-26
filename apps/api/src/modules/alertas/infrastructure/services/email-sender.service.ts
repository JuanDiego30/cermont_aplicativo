/**
 * @service EmailSenderService
 * 
 * Servicio para envío de alertas por correo electrónico
 * Usa nodemailer (open source) para envío de emails
 * Implementa Strategy Pattern
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INotificationSender } from './notification-sender.interface';
import { Alerta } from '../../domain/entities/alerta.entity';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';

// nodemailer es open source y gratuito
let nodemailer: any;
try {
  nodemailer = require('nodemailer');
} catch (error) {
  Logger.warn('nodemailer no está instalado. Instalar con: npm install nodemailer @types/nodemailer');
}

@Injectable()
export class EmailSenderService implements INotificationSender {
  private readonly logger = new Logger(EmailSenderService.name);
  private transporter: any;

  constructor(@Optional() @Inject(ConfigService) private readonly config: ConfigService | null) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (!nodemailer) {
      this.logger.warn('nodemailer no disponible. Emails no se enviarán.');
      return;
    }

    if (!this.config) {
      this.logger.warn('ConfigService no disponible. Emails no se enviarán.');
      return;
    }

    try {
      // Configuración SMTP desde variables de entorno
      const smtpHost = this.config.get('SMTP_HOST');
      const smtpPort = this.config.get('SMTP_PORT');
      const smtpUser = this.config.get('SMTP_USER');
      const smtpPass = this.config.get('SMTP_PASS');

      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort, 10),
          secure: parseInt(smtpPort, 10) === 465, // true para 465, false para otros puertos
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        this.logger.log('✅ EmailSenderService configurado con SMTP');
      } else {
        // Modo desarrollo: usar Ethereal Email (gratuito, solo para testing)
        this.logger.warn('SMTP no configurado. Usando Ethereal Email para desarrollo.');
        this.logger.warn('Para producción, configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');

        // Ethereal Email es un servicio gratuito para testing
        // Se puede usar en desarrollo sin configuración
        this.transporter = null; // Se creará bajo demanda
      }
    } catch (error) {
      this.logger.error('Error inicializando transporter de email:', error);
    }
  }

  async send(alerta: Alerta, destinatario: any): Promise<void> {
    if (!destinatario?.email) {
      throw new Error('Usuario no tiene email registrado');
    }

    if (!nodemailer) {
      this.logger.warn(`Email no enviado a ${destinatario.email}: nodemailer no instalado`);
      return;
    }

    const htmlContent = this.buildHtmlEmail(alerta);
    const fromEmail = this.config?.get('SMTP_FROM') || this.config?.get('SMTP_USER') || 'noreply@cermont.com';

    try {
      // Si no hay transporter configurado, usar Ethereal Email (solo desarrollo)
      if (!this.transporter) {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.warn('⚠️  Usando Ethereal Email (solo para desarrollo). Configure SMTP para producción.');
      }

      const info = await this.transporter.sendMail({
        from: fromEmail,
        to: destinatario.email,
        subject: `[${alerta.getPrioridad().getValue()}] ${alerta.getTitulo()}`,
        html: htmlContent,
        text: this.buildTextEmail(alerta), // Versión texto plano
      });

      // En desarrollo con Ethereal, mostrar URL del preview
      if (info.messageId && info.messageId.includes('ethereal')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        this.logger.log(`📧 Email enviado (Ethereal): ${previewUrl}`);
      } else {
        this.logger.log(`📧 Email enviado a ${destinatario.email}`, {
          alertaId: alerta.getId().getValue(),
          messageId: info.messageId,
        });
      }
    } catch (error) {
      this.logger.error(`Error enviando email a ${destinatario.email}:`, error);
      throw error;
    }
  }

  getCanal(): string {
    return CanalNotificacionEnum.EMAIL;
  }

  private buildHtmlEmail(alerta: Alerta): string {
    const color = alerta.getPrioridad().getColor();
    const prioridad = alerta.getPrioridad().getValue().toLowerCase();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container { 
              background-color: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header { 
              border-left: 4px solid ${color}; 
              padding: 20px; 
              background-color: #f9f9f9;
              border-radius: 4px;
              margin-bottom: 20px;
            }
            .priority { 
              display: inline-block; 
              padding: 4px 12px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            .priority.critical { background-color: #FF0000; color: white; }
            .priority.error { background-color: #FF6B6B; color: white; }
            .priority.warning { background-color: #FFA500; color: white; }
            .priority.info { background-color: #4CAF50; color: white; }
            .footer { 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #ddd; 
              font-size: 12px; 
              color: #666; 
              text-align: center;
            }
            .message {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin-top: 0;">${alerta.getTitulo()}</h2>
              <p><span class="priority ${prioridad}">${alerta.getPrioridad().getValue()}</span></p>
              <div class="message">
                <p style="margin: 0;">${alerta.getMensaje()}</p>
              </div>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático del sistema <strong>Cermont</strong>.</p>
              <p>Fecha: ${alerta.getCreatedAt().toLocaleString('es-ES')}</p>
              <p style="color: #999; font-size: 11px;">No responda a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private buildTextEmail(alerta: Alerta): string {
    return `
${alerta.getTitulo()}

Prioridad: ${alerta.getPrioridad().getValue()}

${alerta.getMensaje()}

---
Este es un mensaje automático del sistema Cermont.
Fecha: ${alerta.getCreatedAt().toLocaleString('es-ES')}
    `.trim();
  }
}
