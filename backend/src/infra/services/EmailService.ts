/**
 * Servicio de notificaciones por email
 * Resuelve: Alertas de vencimientos, recordatorios de tareas
 * 
 * @file backend/src/infra/services/EmailService.ts
 * @requires nodemailer
 */

import nodemailer, { type Transporter } from 'nodemailer';
import type { Order } from '../../domain/entities/Order';
import type { WorkPlan } from '../../domain/entities/WorkPlan';
import { logger } from '../../shared/utils/logger';

/**
 * Configuraci�n del servicio de email
 */
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Opciones para env�o de email
 */
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

/**
 * Tipos de notificaciones
 */
export enum NotificationType {
  ORDER_ASSIGNED = 'ORDER_ASSIGNED',
  ORDER_STATE_CHANGED = 'ORDER_STATE_CHANGED',
  WORKPLAN_APPROVED = 'WORKPLAN_APPROVED',
  WORKPLAN_REJECTED = 'WORKPLAN_REJECTED',
  EVIDENCE_APPROVED = 'EVIDENCE_APPROVED',
  EVIDENCE_REJECTED = 'EVIDENCE_REJECTED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  CERTIFICATE_EXPIRING = 'CERTIFICATE_EXPIRING',
}

/**
 * Servicio de notificaciones por email
 * @class EmailService
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private readonly config: EmailConfig;
  private readonly enabled: boolean;

  constructor() {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
      from: process.env.EMAIL_FROM || 'noreply@cermont.com',
    };
  }

  /**
   * Inicializa el servicio de email
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      logger.warn('[EmailService] Email service is disabled');
      return;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      this.transporter = transporter;

      // Verificar conexi�n
      await transporter.verify();
      logger.info('[EmailService] Email service initialized successfully');
    } catch (error) {
      logger.error('[EmailService] Failed to initialize email service', { error });
      this.transporter = null;
    }
  }

  /**
   * Env�a un email
   * @private
   */
  private async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('[EmailService] Email service not available');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      logger.info(`[EmailService] Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('[EmailService] Failed to send email', { error });
      return false;
    }
  }

  /**
   * Notifica asignaci�n de orden a t�cnico
   */
  async notifyOrderAssigned(
    technicianEmail: string,
    technicianName: string,
    order: Order
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CERMONT S.A.S.</h1>
              <p>Nueva Orden Asignada</p>
            </div>
            <div class="content">
              <p>Hola ${technicianName},</p>
              <p>Se te ha asignado una nueva orden de trabajo:</p>
              <ul>
                <li><strong>Cliente:</strong> ${order.clientName}</li>
                <li><strong>Ubicaci�n:</strong> ${order.location || 'N/A'}</li>
                <li><strong>Estado:</strong> ${order.state}</li>
                <li><strong>Prioridad:</strong> ${order.priority || 'Normal'}</li>
              </ul>
              <p>Por favor, revisa los detalles en el sistema:</p>
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/orders/${order.id}" class="button">Ver Orden</a>
              </p>
            </div>
            <div class="footer">
              <p>Este es un mensaje autom�tico, por favor no responder.</p>
              <p>&copy; 2024 CERMONT S.A.S. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: technicianEmail,
      subject: `Nueva Orden Asignada: ${order.id}`,
      html,
      text: `Se te ha asignado una nueva orden: ${order.id} - ${order.clientName}`,
    });
  }

  /**
   * Notifica cambio de estado de orden
   */
  async notifyOrderStateChanged(
    recipientEmail: string,
    order: Order,
    previousState: string,
    newState: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Cambio de Estado de Orden</h2>
            <p>La orden <strong>${order.id}</strong> ha cambiado de estado:</p>
            <ul>
              <li><strong>Estado anterior:</strong> ${previousState}</li>
              <li><strong>Nuevo estado:</strong> ${newState}</li>
            </ul>
            <p><a href="${process.env.FRONTEND_URL}/orders/${order.id}">Ver detalles</a></p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Cambio de Estado: ${order.id}`,
      html,
    });
  }

  /**
   * Notifica aprobaci�n de plan de trabajo
   */
  async notifyWorkPlanApproved(
    technicianEmail: string,
    workPlan: WorkPlan,
    order: Order
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">? Plan de Trabajo Aprobado</h2>
            <p>El plan de trabajo para la orden <strong>${order.id}</strong> ha sido aprobado.</p>
            <p>Puedes proceder con la ejecuci�n seg�n lo planeado.</p>
            <p><a href="${process.env.FRONTEND_URL}/workplans/${workPlan.id}">Ver plan de trabajo</a></p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: technicianEmail,
      subject: `Plan de Trabajo Aprobado: ${order.id}`,
      html,
    });
  }

  /**
   * Notifica rechazo de plan de trabajo
   */
  async notifyWorkPlanRejected(
    technicianEmail: string,
    workPlan: WorkPlan,
    order: Order,
    reason: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">? Plan de Trabajo Rechazado</h2>
            <p>El plan de trabajo para la orden <strong>${order.id}</strong> ha sido rechazado.</p>
            <p><strong>Raz�n:</strong> ${reason}</p>
            <p>Por favor, revisa y corrige el plan seg�n las observaciones.</p>
            <p><a href="${process.env.FRONTEND_URL}/workplans/${workPlan.id}">Ver plan de trabajo</a></p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: technicianEmail,
      subject: `Plan de Trabajo Rechazado: ${order.id}`,
      html,
    });
  }

  /**
   * Env�a recordatorio de fecha l�mite
   */
  async sendDeadlineReminder(
    recipientEmail: string,
    order: Order,
    daysRemaining: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ffc107;">?? Recordatorio de Fecha L�mite</h2>
            <p>La orden <strong>${order.id}</strong> est� pr�xima a vencer.</p>
            <p><strong>D�as restantes:</strong> ${daysRemaining}</p>
            <p>Por favor, aseg�rate de completar las actividades pendientes.</p>
            <p><a href="${process.env.FRONTEND_URL}/orders/${order.id}">Ver orden</a></p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `Recordatorio: Orden ${order.id} pr�xima a vencer`,
      html,
    });
  }

  /**
   * Notifica vencimiento pr�ximo de certificado
   */
  async notifyCertificateExpiring(
    recipientEmail: string,
    certificateName: string,
    expiryDate: Date,
    daysRemaining: number
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">?? Certificado Pr�ximo a Vencer</h2>
            <p>El certificado <strong>${certificateName}</strong> est� pr�ximo a vencer.</p>
            <ul>
              <li><strong>Fecha de vencimiento:</strong> ${expiryDate.toLocaleDateString('es-CO')}</li>
              <li><strong>D�as restantes:</strong> ${daysRemaining}</li>
            </ul>
            <p>Por favor, gestiona la renovaci�n del certificado antes de su vencimiento.</p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: recipientEmail,
      subject: `URGENTE: Certificado ${certificateName} pr�ximo a vencer`,
      html,
    });
  }
}

/**
 * Instancia singleton del servicio
 */
export const emailService = new EmailService();
