import nodemailer from 'nodemailer';
import { logger } from '';
import { createAuditLog } from '';
import { EMAIL_FROM, EMAIL_REPLY_TO, EMAIL_SUBJECTS, FRONTEND_URL, EMAIL_ENABLED, } from '';
let transporter = null;
const initTransporter = async () => {
    if (!EMAIL_ENABLED) {
        logger.warn('[Email] Service deshabilitado via env');
        return;
    }
    if (transporter)
        return;
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const secure = process.env.EMAIL_SECURE === 'true';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    if (!host || !user || !pass || isNaN(port)) {
        throw new Error('EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS requeridos en env');
    }
    transporter = nodemailer.createTransporter({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV !== 'development',
            minVersion: 'TLSv1.2',
        },
        pool: true,
        maxConnections: parseInt(process.env.EMAIL_MAX_CONNECTIONS || '5', 10),
        maxMessages: parseInt(process.env.EMAIL_MAX_MESSAGES || '100', 10),
        rateDelta: 1000,
        rateLimit: true,
    });
    try {
        await transporter.verify();
        logger.info(`✅ Email transporter inicializado (${host}:${port}, secure: ${secure})`);
    }
    catch (error) {
        const errMsg = error.message;
        logger.error('[Email] Verificación fallida:', errMsg);
        throw new Error(`SMTP config inválida: ${errMsg}`);
    }
};
const renderTemplate = (template, context = {}) => {
    return template.replace(/{{(\w+)}}/g, (match, key) => {
        const value = context[key];
        if (typeof value === 'string' && template.includes('<')) {
            return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
        }
        return String(value || '');
    });
};
export const sendEmail = async (to, subject, text, html, options = {}) => {
    if (!EMAIL_ENABLED) {
        logger.info('[Email] Envío simulado (disabled):', { to: to.substring(0, 3) + '...', subject: subject.substring(0, 50) + '...' });
        return { success: true, messageId: Date.now().toString() };
    }
    await initTransporter();
    const from = EMAIL_FROM || 'noreply@cermont.com';
    const mailOptions = {
        from,
        to,
        subject,
        text,
        html,
        replyTo: EMAIL_REPLY_TO,
        ...options,
    };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
        throw new Error('Email destinatario inválido');
    }
    const sanitizedTo = to.substring(0, 3) + '...';
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
        try {
            const info = await transporter.sendMail(mailOptions);
            const messageId = info.messageId || Date.now().toString();
            logger.info('[Email] Enviado:', { to: sanitizedTo, subject: subject.substring(0, 50) + '...', messageId });
            await createAuditLog({ accion: 'EMAIL_SENT', usuarioId: null, detalles: { to: sanitizedTo, subject: subject.substring(0, 50) + '...', messageId } });
            return { success: true, messageId };
        }
        catch (error) {
            attempts++;
            const errMsg = error.message;
            logger.error(`[Email] Error intento ${attempts}/${maxAttempts} (${sanitizedTo}):`, errMsg);
            if (attempts >= maxAttempts) {
                await createAuditLog({ accion: 'EMAIL_FAIL', usuarioId: null, detalles: { to: sanitizedTo, subject: subject.substring(0, 50) + '...', error: errMsg.substring(0, 100) + '...' } });
                throw new Error(`Error enviando email después de ${maxAttempts} intentos: ${errMsg}`);
            }
            const delay = 1000 * Math.pow(2, attempts - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Unexpected error in sendEmail');
};
export const sendWelcomeEmail = async (user) => {
    if (!user || !user.nombre || !user.email) {
        throw new Error('Datos de usuario requeridos (nombre, email)');
    }
    const subject = EMAIL_SUBJECTS.WELCOME || 'Bienvenido a CERMONT ATG';
    const text = renderTemplate(`
Hola {{nombre}},

¡Bienvenido a CERMONT ATG!

Tu cuenta ha sido creada:
- Email: {{email}}
- Rol: {{role || 'Usuario'}}

Cambia tu contraseña en el primer login.

Saludos,
Equipo CERMONT ATG
  `, { nombre: user.nombre, email: user.email, role: user.role });
    const html = renderTemplate(`
    <h2>Bienvenido a CERMONT ATG</h2>
    <p>Hola <strong>{{nombre}}</strong>,</p>
    <p>¡Tu cuenta ha sido creada!</p>
    <ul>
      <li><strong>Email:</strong> {{email}}</li>
      <li><strong>Rol:</strong> {{role || 'Usuario'}}</li>
    </ul>
    <p>Cambia tu contraseña en el primer login.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `, { nombre: user.nombre, email: user.email, role: user.role });
    return await sendEmail(user.email, subject, text, html);
};
export const sendPasswordResetEmail = async (email, resetToken) => {
    if (!email || !resetToken) {
        throw new Error('Email y token requeridos');
    }
    const resetUrl = `${FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${encodeURIComponent(resetToken)}`;
    const subject = EMAIL_SUBJECTS.RESET || 'Restablecimiento de contraseña - CERMONT ATG';
    const text = renderTemplate(`
Hola,

Solicitaste restablecer tu contraseña.

Enlace: {{resetUrl}}

Expira en 1 hora.

Si no solicitaste, ignora.

Saludos,
Equipo CERMONT ATG
  `, { resetUrl });
    const html = renderTemplate(`
    <h2>Restablecimiento de contraseña</h2>
    <p>Solicitaste restablecer tu contraseña.</p>
    <p><a href="{{resetUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Restablecer Contraseña</a></p>
    <p>O copia: <span style="word-break: break-all; color: #666;">{{resetUrl}}</span></p>
    <p><strong>Expira en 1 hora.</strong></p>
    <p>Si no solicitaste, ignora.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `, { resetUrl });
    return await sendEmail(email, subject, text, html);
};
export const sendOrderAssignedEmail = async (user, order) => {
    if (!user || !order || !order.numeroOrden || !order.clienteNombre) {
        throw new Error('User y order requeridos (numeroOrden, clienteNombre)');
    }
    const fechaInicio = order.fechaInicio ? new Date(order.fechaInicio).toLocaleDateString('es-ES') : 'N/A';
    const subject = EMAIL_SUBJECTS.ORDER_ASSIGNED || `Nueva orden: ${order.numeroOrden}`;
    const text = renderTemplate(`
Hola {{nombre}},

Asignada orden: {{numeroOrden}}
Cliente: {{clienteNombre}}
Descripción: {{descripcion || 'N/A'}}
Inicio: {{fechaInicio}}
Prioridad: {{prioridad || 'Normal'}}

Ingresa para detalles.

Saludos,
Equipo CERMONT ATG
  `, { nombre: user.nombre, ...order, fechaInicio });
    const html = renderTemplate(`
    <h2>Nueva Orden Asignada</h2>
    <p>Hola <strong>{{nombre}}</strong>,</p>
    <p>Asignada orden:</p>
    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 8px; font-weight: bold;">Número:</td><td style="padding: 8px;">{{numeroOrden}}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Cliente:</td><td style="padding: 8px;">{{clienteNombre}}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Descripción:</td><td style="padding: 8px;">{{descripcion || 'N/A'}}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Inicio:</td><td style="padding: 8px;">{{fechaInicio}}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Prioridad:</td><td style="padding: 8px;">{{prioridad || 'Normal'}}</td></tr>
    </table>
    <p>Ingresa para detalles.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `, { nombre: user.nombre, ...order, fechaInicio });
    return await sendEmail(user.email, subject, text, html);
};
export const sendOrderStatusChangeEmail = async (users, order, previousStatus, newStatus) => {
    if (!users || users.length === 0 || !order || !previousStatus || !newStatus) {
        throw new Error('Parámetros requeridos: users (non-empty), order, previousStatus, newStatus');
    }
    const subject = EMAIL_SUBJECTS.STATUS_CHANGE || `Orden ${order.numeroOrden} - Cambio de estado`;
    const promises = users.map((user) => {
        const text = renderTemplate(`
Hola {{nombre}},

Orden {{numeroOrden}} cambió estado:

Anterior: {{previousStatus}}
Nuevo: {{newStatus}}

Cliente: {{clienteNombre}}

Ingresa para detalles.

Saludos,
Equipo CERMONT ATG
    `, { nombre: user.nombre, ...order, previousStatus, newStatus });
        const html = renderTemplate(`
      <h2>Cambio de Estado</h2>
      <p>Hola <strong>{{nombre}}</strong>,</p>
      <p>Orden <strong>{{numeroOrden}}</strong> cambió estado:</p>
      <table style="border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; font-weight: bold;">Anterior:</td><td style="padding: 8px;">{{previousStatus}}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Nuevo:</td><td style="padding: 8px; color: #28a745; font-weight: bold;">{{newStatus}}</td></tr>
        <tr><td style="padding: 8px; font-weight: bold;">Cliente:</td><td style="padding: 8px;">{{clienteNombre}}</td></tr>
      </table>
      <p>Ingresa para detalles.</p>
      <p>Saludos,<br/>Equipo CERMONT ATG</p>
    `, { nombre: user.nombre, ...order, previousStatus, newStatus });
        return sendEmail(user.email, subject, text, html);
    });
    const results = await Promise.allSettled(promises);
    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        }
        else {
            logger.error(`[Email] Batch fail para user ${index}:`, result.reason);
            return { success: false, messageId: `fail-${Date.now()}-${index}` };
        }
    });
};
export const sendWorkPlanApprovedEmail = async (user, workPlan, order) => {
    if (!user || !workPlan || !workPlan.titulo || !order) {
        throw new Error('Parámetros requeridos: user, workPlan (titulo), order');
    }
    const subject = EMAIL_SUBJECTS.PLAN_APPROVED || `Plan aprobado: ${order.numeroOrden}`;
    const text = renderTemplate(`
Hola {{nombre}},

Plan para orden {{numeroOrden}} aprobado.

Cliente: {{clienteNombre}}
Título: {{titulo}}

Comienza trabajo.

Saludos,
Equipo CERMONT ATG
  `, { nombre: user.nombre, titulo: workPlan.titulo, ...order });
    const html = renderTemplate(`
    <h2>Plan Aprobado</h2>
    <p>Hola <strong>{{nombre}}</strong>,</p>
    <p>Plan para orden <strong>{{numeroOrden}}</strong> aprobado.</p>
    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 8px; font-weight: bold;">Cliente:</td><td style="padding: 8px;">{{clienteNombre}}</td></tr>
      <tr><td style="padding: 8px; font-weight: bold;">Título:</td><td style="padding: 8px;">{{titulo}}</td></tr>
    </table>
    <p>Comienza trabajo.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `, { nombre: user.nombre, titulo: workPlan.titulo, ...order });
    return await sendEmail(user.email, subject, text, html);
};
export const sendWeeklyReportEmail = async (user, stats) => {
    if (!user || !stats) {
        throw new Error('User y stats requeridos');
    }
    const subject = EMAIL_SUBJECTS.WEEKLY_REPORT || 'Reporte Semanal - CERMONT ATG';
    const text = renderTemplate(`
Hola {{nombre}},

Reporte semanal:

Activas: {{activeOrders}}
Completadas: {{completedOrders}}
Pendientes: {{pendingOrders}}
Progreso: {{inProgressOrders}}

Ingresa para detalles.

Saludos,
Equipo CERMONT ATG
  `, { nombre: user.nombre, ...stats });
    const html = renderTemplate(`
    <h2>Reporte Semanal</h2>
    <p>Hola <strong>{{nombre}}</strong>,</p>
    <p>Reporte semanal:</p>
    <table style="border-collapse: collapse; margin: 20px 0; width: 100%; max-width: 400px;">
      <tr style="background-color: #f8f9fa;"><td style="padding: 12px; font-weight: bold;">Activas</td><td style="padding: 12px; text-align: right;">{{activeOrders}}</td></tr>
      <tr><td style="padding: 12px; font-weight: bold;">Completadas</td><td style="padding: 12px; text-align: right; color: #28a745;">{{completedOrders}}</td></tr>
      <tr style="background-color: #f8f9fa;"><td style="padding: 12px; font-weight: bold;">Pendientes</td><td style="padding: 12px; text-align: right; color: #ffc107;">{{pendingOrders}}</td></tr>
      <tr><td style="padding: 12px; font-weight: bold;">Progreso</td><td style="padding: 12px; text-align: right; color: #17a2b8;">{{inProgressOrders}}</td></tr>
    </table>
    <p>Ingresa para detalles.</p>
    <p>Saludos,<br/>Equipo CERMONT ATG</p>
  `, { nombre: user.nombre, ...stats });
    return await sendEmail(user.email, subject, text, html);
};
//# sourceMappingURL=email.service.js.map