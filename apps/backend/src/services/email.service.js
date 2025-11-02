/**
 * Email Service
 * @description Servicio para envío de emails (preparado para integración con Nodemailer o servicio SMTP)
 */

import { logger } from '../utils/logger.js';

/**
 * Configuración de email (para implementar con Nodemailer)
 * Para producción, configurar con SMTP real (Gmail, SendGrid, AWS SES, etc.)
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@cermont.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'soporte@cermont.com',
};

/**
 * Enviar email genérico
 * @param {string} to - Email destinatario
 * @param {string} subject - Asunto
 * @param {string} text - Contenido texto plano
 * @param {string} html - Contenido HTML
 */
export const sendEmail = async (to, subject, text, html = null) => {
  try {
    // TODO: Implementar con Nodemailer u otro servicio de email
    // Por ahora solo registramos en logs (para desarrollo)
    
    logger.info('Email enviado (simulado):', {
      to,
      subject,
      from: EMAIL_CONFIG.from,
      hasHtml: !!html,
      htmlLength: html ? String(html).length : 0,
    });

    // Simulación para desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('\n📧 EMAIL SIMULADO:');
      console.log('═══════════════════════════════════════');
      console.log(`Para: ${to}`);
      console.log(`Asunto: ${subject}`);
      console.log(`De: ${EMAIL_CONFIG.from}`);
      console.log('───────────────────────────────────────');
      console.log(text);
      console.log('═══════════════════════════════════════\n');
    }

    return { success: true, messageId: Date.now().toString() };
  } catch (error) {
    logger.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Enviar email de bienvenida
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Bienvenido a CERMONT ATG';
  const text = `
Hola ${user.nombre},

¡Bienvenido a CERMONT ATG!

Tu cuenta ha sido creada exitosamente con los siguientes datos:
- Email: ${user.email}
- Rol: ${user.rol}

Por favor, cambia tu contraseña en el primer inicio de sesión.

Saludos,
Equipo CERMONT ATG
  `;

  const html = `
    <h2>Bienvenido a CERMONT ATG</h2>
    <p>Hola <strong>${user.nombre}</strong>,</p>
    <p>¡Tu cuenta ha sido creada exitosamente!</p>
    <ul>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Rol:</strong> ${user.rol}</li>
    </ul>
    <p>Por favor, cambia tu contraseña en el primer inicio de sesión.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `;

  return await sendEmail(user.email, subject, text, html);
};

/**
 * Enviar email de restablecimiento de contraseña
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Restablecimiento de contraseña - CERMONT ATG';
  const text = `
Hola,

Has solicitado restablecer tu contraseña.

Usa el siguiente enlace para restablecer tu contraseña:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignora este email.

Saludos,
Equipo CERMONT ATG
  `;

  const html = `
    <h2>Restablecimiento de contraseña</h2>
    <p>Has solicitado restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" 
         style="background-color: #007bff; color: white; padding: 12px 24px; 
                text-decoration: none; border-radius: 4px; display: inline-block;">
        Restablecer Contraseña
      </a>
    </p>
    <p>O copia y pega este enlace en tu navegador:</p>
    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    <p><strong>Este enlace expirará en 1 hora.</strong></p>
    <p>Si no solicitaste este cambio, ignora este email.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `;

  return await sendEmail(email, subject, text, html);
};

/**
 * Enviar notificación de orden asignada
 */
export const sendOrderAssignedEmail = async (user, order) => {
  const subject = `Nueva orden asignada: ${order.numeroOrden}`;
  const text = `
Hola ${user.nombre},

Se te ha asignado una nueva orden de trabajo:

Número de orden: ${order.numeroOrden}
Cliente: ${order.clienteNombre}
Descripción: ${order.descripcion}
Fecha de inicio: ${order.fechaInicio.toLocaleDateString('es-ES')}
Prioridad: ${order.prioridad}

Ingresa al sistema para ver más detalles.

Saludos,
Equipo CERMONT ATG
  `;

  const html = `
    <h2>Nueva Orden Asignada</h2>
    <p>Hola <strong>${user.nombre}</strong>,</p>
    <p>Se te ha asignado una nueva orden de trabajo:</p>
    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">Número de orden:</td>
        <td style="padding: 8px;">${order.numeroOrden}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Cliente:</td>
        <td style="padding: 8px;">${order.clienteNombre}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Descripción:</td>
        <td style="padding: 8px;">${order.descripcion}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Fecha de inicio:</td>
        <td style="padding: 8px;">${order.fechaInicio.toLocaleDateString('es-ES')}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Prioridad:</td>
        <td style="padding: 8px; text-transform: uppercase;">${order.prioridad}</td>
      </tr>
    </table>
    <p>Ingresa al sistema para ver más detalles.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `;

  return await sendEmail(user.email, subject, text, html);
};

/**
 * Enviar notificación de cambio de estado de orden
 */
export const sendOrderStatusChangeEmail = async (users, order, previousStatus, newStatus) => {
  const subject = `Orden ${order.numeroOrden} - Cambio de estado`;
  
  // Enviar a múltiples usuarios
  const emailPromises = users.map(user => {
    const text = `
Hola ${user.nombre},

La orden ${order.numeroOrden} ha cambiado de estado:

Estado anterior: ${previousStatus}
Estado nuevo: ${newStatus}

Cliente: ${order.clienteNombre}

Ingresa al sistema para ver más detalles.

Saludos,
Equipo CERMONT ATG
    `;

    const html = `
      <h2>Cambio de Estado de Orden</h2>
      <p>Hola <strong>${user.nombre}</strong>,</p>
      <p>La orden <strong>${order.numeroOrden}</strong> ha cambiado de estado:</p>
      <table style="border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold;">Estado anterior:</td>
          <td style="padding: 8px;">${previousStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Estado nuevo:</td>
          <td style="padding: 8px; color: #28a745; font-weight: bold;">${newStatus}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Cliente:</td>
          <td style="padding: 8px;">${order.clienteNombre}</td>
        </tr>
      </table>
      <p>Ingresa al sistema para ver más detalles.</p>
      <p>Saludos,<br/>Equipo CERMONT ATG</p>
    `;

    return sendEmail(user.email, subject, text, html);
  });

  return await Promise.all(emailPromises);
};

/**
 * Enviar notificación de plan de trabajo aprobado
 */
export const sendWorkPlanApprovedEmail = async (user, workPlan, order) => {
  const subject = `Plan de trabajo aprobado: ${order.numeroOrden}`;
  const text = `
Hola ${user.nombre},

El plan de trabajo para la orden ${order.numeroOrden} ha sido aprobado.

Cliente: ${order.clienteNombre}
Título del plan: ${workPlan.titulo}

Ya puedes comenzar a trabajar según el plan establecido.

Saludos,
Equipo CERMONT ATG
  `;

  const html = `
    <h2>Plan de Trabajo Aprobado</h2>
    <p>Hola <strong>${user.nombre}</strong>,</p>
    <p>El plan de trabajo para la orden <strong>${order.numeroOrden}</strong> ha sido aprobado.</p>
    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; font-weight: bold;">Cliente:</td>
        <td style="padding: 8px;">${order.clienteNombre}</td>
      </tr>
      <tr>
        <td style="padding: 8px; font-weight: bold;">Título del plan:</td>
        <td style="padding: 8px;">${workPlan.titulo}</td>
      </tr>
    </table>
    <p>Ya puedes comenzar a trabajar según el plan establecido.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `;

  return await sendEmail(user.email, subject, text, html);
};

/**
 * Enviar reporte semanal de órdenes
 */
export const sendWeeklyReportEmail = async (user, stats) => {
  const subject = 'Reporte Semanal - CERMONT ATG';
  const text = `
Hola ${user.nombre},

Aquí está tu reporte semanal:

Órdenes activas: ${stats.activeOrders}
Órdenes completadas: ${stats.completedOrders}
Órdenes pendientes: ${stats.pendingOrders}
Órdenes en progreso: ${stats.inProgressOrders}

Ingresa al sistema para ver más detalles.

Saludos,
Equipo CERMONT ATG
  `;

  const html = `
    <h2>Reporte Semanal</h2>
    <p>Hola <strong>${user.nombre}</strong>,</p>
    <p>Aquí está tu reporte semanal:</p>
    <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 400px;">
      <tr style="background-color: #f8f9fa;">
        <td style="padding: 12px; font-weight: bold;">Órdenes activas</td>
        <td style="padding: 12px; text-align: right;">${stats.activeOrders}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold;">Completadas</td>
        <td style="padding: 12px; text-align: right; color: #28a745;">${stats.completedOrders}</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td style="padding: 12px; font-weight: bold;">Pendientes</td>
        <td style="padding: 12px; text-align: right; color: #ffc107;">${stats.pendingOrders}</td>
      </tr>
      <tr>
        <td style="padding: 12px; font-weight: bold;">En progreso</td>
        <td style="padding: 12px; text-align: right; color: #17a2b8;">${stats.inProgressOrders}</td>
      </tr>
    </table>
    <p>Ingresa al sistema para ver más detalles.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `;

  return await sendEmail(user.email, subject, text, html);
};
