/**
 * Servicio de notificaciones por email
 * Resuelve: Alertas de vencimientos, recordatorios de tareas
 * 
 * @file backend/src/infra/services/EmailService.ts
 */

import nodemailer, { type Transporter } from 'nodemailer';
import type { Order } from '../../domain/entities/Order.js';
import type { WorkPlan } from '../../domain/entities/WorkPlan.js';
import { logger } from '../../shared/utils/logger.js';

// ==========================================
// Tipos y Configuraciones
// ==========================================

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface SendEmailOptions {
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

// ==========================================
// Clase de Templates (Separación de Vista)
// ==========================================

class EmailTemplates {
  private static baseLayout(content: string, title: string = 'CERMONT S.A.S.'): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            .button { display: inline-block; padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            .alert { color: #dc3545; font-weight: bold; }
            .warning { color: #ffc107; font-weight: bold; }
            .success { color: #28a745; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${title}</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responder.</p>
              <p>&copy; ${new Date().getFullYear()} CERMONT S.A.S. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static orderAssigned(technicianName: string, order: Order, frontendUrl: string): string {
    const content = `
      <p>Hola <strong>${technicianName}</strong>,</p>
      <p>Se te ha asignado una nueva orden de trabajo:</p>
      <ul>
        <li><strong>Cliente:</strong> ${order.clientName}</li>
        <li><strong>Ubicación:</strong> ${order.location || 'N/A'}</li>
        <li><strong>Estado:</strong> ${order.state}</li>
        <li><strong>Prioridad:</strong> ${order.priority || 'Normal'}</li>
      </ul>
      <p style="text-align: center;">
        <a href="${frontendUrl}/orders/${order.id}" class="button">Ver Orden</a>
      </p>
    `;
    return this.baseLayout(content, 'Nueva Orden Asignada');
  }

  static orderStateChanged(order: Order, previousState: string, newState: string, frontendUrl: string): string {
    const content = `
      <h2>Cambio de Estado de Orden</h2>
      <p>La orden <strong>${order.id}</strong> ha cambiado de estado:</p>
      <ul>
        <li><strong>Estado anterior:</strong> ${previousState}</li>
        <li><strong>Nuevo estado:</strong> ${newState}</li>
      </ul>
      <p><a href="${frontendUrl}/orders/${order.id}">Ver detalles</a></p>
    `;
    return this.baseLayout(content, 'Actualización de Orden');
  }

  static workPlanApproved(workPlan: WorkPlan, order: Order, frontendUrl: string): string {
    const content = `
      <h2 class="success">✔ Plan de Trabajo Aprobado</h2>
      <p>El plan de trabajo para la orden <strong>${order.id}</strong> ha sido aprobado.</p>
      <p>Puedes proceder con la ejecución según lo planeado.</p>
      <p><a href="${frontendUrl}/workplans/${workPlan.id}" class="button">Ver Plan de Trabajo</a></p>
    `;
    return this.baseLayout(content);
  }

  static workPlanRejected(workPlan: WorkPlan, order: Order, reason: string, frontendUrl: string): string {
    const content = `
      <h2 class="alert">✖ Plan de Trabajo Rechazado</h2>
      <p>El plan de trabajo para la orden <strong>${order.id}</strong> ha sido rechazado.</p>
      <p><strong>Razón:</strong> ${reason}</p>
      <p>Por favor, revisa y corrige el plan según las observaciones.</p>
      <p><a href="${frontendUrl}/workplans/${workPlan.id}" class="button">Corregir Plan</a></p>
    `;
    return this.baseLayout(content);
  }

  static deadlineReminder(order: Order, daysRemaining: number, frontendUrl: string): string {
    const content = `
      <h2 class="warning">⚠ Recordatorio de Fecha Límite</h2>
      <p>La orden <strong>${order.id}</strong> está próxima a vencer.</p>
      <p><strong>Días restantes:</strong> ${daysRemaining}</p>
      <p>Por favor, asegúrate de completar las actividades pendientes.</p>
      <p><a href="${frontendUrl}/orders/${order.id}" class="button">Ver Orden</a></p>
    `;
    return this.baseLayout(content);
  }

  static certificateExpiring(name: string, expiryDate: Date, days: number): string {
    const content = `
      <h2 class="alert">⚠ Certificado Próximo a Vencer</h2>
      <p>El certificado <strong>${name}</strong> está próximo a vencer.</p>
      <ul>
        <li><strong>Fecha de vencimiento:</strong> ${expiryDate.toLocaleDateString('es-CO')}</li>
        <li><strong>Días restantes:</strong> ${days}</li>
      </ul>
      <p>Por favor, gestiona la renovación del certificado antes de su vencimiento.</p>
    `;
    return this.baseLayout(content, 'Alerta de Vencimiento');
  }
}

// ==========================================
// Servicio de Email
// ==========================================

import type { EmailParams } from '../../domain/services/IEmailService.js';

export class EmailService {
  private transporter: Transporter | null = null;
  private readonly config: EmailConfig;
  private readonly enabled: boolean;
  private readonly frontendUrl: string;

  constructor(config?: Partial<EmailConfig>) {
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    this.config = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
      from: process.env.EMAIL_FROM || 'noreply@cermont.com',
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (!this.enabled) {
      logger.warn('[EmailService] Email service is disabled by configuration');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
      });

      await this.transporter.verify();
      logger.info('[EmailService] Email service initialized successfully');
    } catch (error) {
      logger.error('[EmailService] Failed to initialize email service', { error });
      this.transporter = null;
    }
  }

  private async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!this.enabled || !this.transporter) {
      logger.warn('[EmailService] Cannot send email: Service disabled or not initialized');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text, // Fallback plain text
        attachments: options.attachments,
      });

      logger.info(`[EmailService] Email sent to ${options.to}`);
      return true;
    } catch (error) {
      logger.error('[EmailService] Failed to send email', { error, to: options.to });
      return false;
    }
  }

  // --- Métodos Públicos de Notificación ---

  /**
   * Método genérico de envío (implementa IEmailService)
   * Para uso con plantillas personalizadas o casos de uso
   */
  async send(params: EmailParams): Promise<void> {
    if (!this.enabled || !this.transporter) {
      logger.warn('[EmailService] Cannot send email: Service disabled or not initialized');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: Array.isArray(params.to) ? params.to.join(', ') : params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        cc: params.cc ? (Array.isArray(params.cc) ? params.cc.join(', ') : params.cc) : undefined,
        bcc: params.bcc ? (Array.isArray(params.bcc) ? params.bcc.join(', ') : params.bcc) : undefined,
        replyTo: params.replyTo,
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      logger.info(`[EmailService] Email sent to ${params.to}`);
    } catch (error) {
      logger.error('[EmailService] Failed to send email', { error, to: params.to });
      throw error;
    }
  }

  async notifyOrderAssigned(email: string, name: string, order: Order): Promise<boolean> {
    const html = EmailTemplates.orderAssigned(name, order, this.frontendUrl);
    return this.sendEmail({
      to: email,
      subject: `Nueva Orden Asignada: ${order.id}`,
      html,
      text: `Se te ha asignado la orden ${order.id}. Revisa el sistema para más detalles.`,
    });
  }

  async notifyOrderStateChanged(email: string, order: Order, oldState: string, newState: string): Promise<boolean> {
    const html = EmailTemplates.orderStateChanged(order, oldState, newState, this.frontendUrl);
    return this.sendEmail({
      to: email,
      subject: `Cambio de Estado: ${order.id}`,
      html,
      text: `La orden ${order.id} cambió de ${oldState} a ${newState}.`,
    });
  }

  async notifyWorkPlanApproved(email: string, workPlan: WorkPlan, order: Order): Promise<boolean> {
    const html = EmailTemplates.workPlanApproved(workPlan, order, this.frontendUrl);
    return this.sendEmail({
      to: email,
      subject: `Plan de Trabajo Aprobado: ${order.id}`,
      html,
      text: `El plan de trabajo para la orden ${order.id} ha sido aprobado.`,
    });
  }

  async notifyWorkPlanRejected(email: string, workPlan: WorkPlan, order: Order, reason: string): Promise<boolean> {
    const html = EmailTemplates.workPlanRejected(workPlan, order, reason, this.frontendUrl);
    return this.sendEmail({
      to: email,
      subject: `Plan de Trabajo Rechazado: ${order.id}`,
      html,
      text: `El plan de trabajo para la orden ${order.id} ha sido rechazado. Razón: ${reason}`,
    });
  }

  async sendDeadlineReminder(email: string, order: Order, daysRemaining: number): Promise<boolean> {
    const html = EmailTemplates.deadlineReminder(order, daysRemaining, this.frontendUrl);
    return this.sendEmail({
      to: email,
      subject: `Recordatorio: Orden ${order.id} vence en ${daysRemaining} días`,
      html,
      text: `La orden ${order.id} vence en ${daysRemaining} días.`,
    });
  }

  async notifyCertificateExpiring(email: string, certName: string, date: Date, days: number): Promise<boolean> {
    const html = EmailTemplates.certificateExpiring(certName, date, days);
    return this.sendEmail({
      to: email,
      subject: `URGENTE: Certificado ${certName} vence en ${days} días`,
      html,
      text: `El certificado ${certName} vence el ${date.toLocaleDateString()}.`,
    });
  }
}

export const emailService = new EmailService();

