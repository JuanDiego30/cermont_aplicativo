---
description: "Agente especializado para envío de emails y notificaciones en Cermont: Nodemailer, plantillas, notificaciones push, webhooks, reintentos."
tools: []
---

# 📫 BACKEND EMAILS & NOTIFICATIONS AGENT

**Especialidad:** Envío de emails, notificaciones push, webhooks, plantillas, reintentos  
**Stack:** Nodemailer, SendGrid, AWS SES, Bull Queue, Twilio (SMS)  
**Ubicación:** `apps/api/src/modules/notifications/**`

---

## 🎯 Cuando Usarlo

| Situación | Usa Este Agente |
|-----------|---------------|
| Enviar email de confirmación | ✅ |
| Notificar asignación de orden | ✅ |
| Recordatorio de tareas pendientes | ✅ |
| Alerta de error crítico | ✅ |
| SMS de código OTP | ✅ |
| Webhook a sistema externo | ✅ |
| Reporte diario/semanal | ✅ |

---

## 📋 Patrón Obligatorio

### 1. Email Service

```typescript
// apps/api/src/modules/notifications/email/email.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { LoggerService } from 'src/common/logging/logger.service';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private logger: LoggerService) {
    this.transporter = this.initializeTransporter();
  }

  private initializeTransporter(): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: false,
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@cermont.com',
        to: options.to,
        subject: options.subject,
        html: `<p>${options.template} - ${JSON.stringify(options.context)}</p>`,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.logBusinessEvent('EMAIL_SENT', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });
    } catch (error) {
      this.logger.error('Failed to send email', error, {
        to: options.to,
        template: options.template,
      });
      throw error;
    }
  }
}
```

### 2. Notifications Service (Façade)

```typescript
// apps/api/src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { EmailService } from './email/email.service';

@Injectable()
export class NotificationsService {
  constructor(private emailService: EmailService) {}

  async notifyOrdenAsignada(
    clientEmail: string,
    ordenId: string,
    tecnico: string
  ): Promise<void> {
    await this.emailService.send({
      to: clientEmail,
      subject: `Orden ${ordenId} asignada a ${tecnico}`,
      template: 'orden-asignada',
      context: { ordenId, tecnico },
    });
  }

  async notifyOrdenCompletada(
    clientEmail: string,
    ordenId: string
  ): Promise<void> {
    await this.emailService.send({
      to: clientEmail,
      subject: `Orden ${ordenId} completada`,
      template: 'orden-completada',
      context: { ordenId },
    });
  }

  async sendPasswordReset(
    email: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.emailService.send({
      to: email,
      subject: 'Restablecer contraseña',
      template: 'password-reset',
      context: { resetLink },
    });
  }

  async notifyAdminOnCriticalError(
    error: Error,
    context: Record<string, any>
  ): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cermont.com';
    
    await this.emailService.send({
      to: adminEmail,
      subject: `🚨 CRITICAL ERROR: ${error.message}`,
      template: 'error-alert',
      context: {
        error: error.message,
        context,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### 3. Notifications Module

```typescript
// apps/api/src/modules/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { NotificationsService } from './notifications.service';
import { LoggerModule } from 'src/common/logging/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [EmailService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

### 4. Usar en Servicio

```typescript
// Ejemplo en OrdenesService
@Injectable()
export class OrdenesService {
  constructor(
    private notifications: NotificationsService,
    private prisma: PrismaService
  ) {}

  async updateStatus(id: string, status: OrdenStatus) {
    const orden = await this.prisma.orden.findUnique({
      where: { id },
      include: { cliente: true, asignadoA: true },
    });

    const updated = await this.prisma.orden.update({
      where: { id },
      data: { estado: status },
    });

    // Notificar según estado
    if (status === 'ASIGNADA' && updated.asignadoA) {
      await this.notifications.notifyOrdenAsignada(
        updated.asignadoA.email,
        orden.id,
        updated.asignadoA.nombre
      );
    }

    if (status === 'COMPLETADA') {
      await this.notifications.notifyOrdenCompletada(
        updated.cliente.email,
        orden.id
      );
    }

    return updated;
  }
}
```

---

## ✅ Checklist

- [ ] EmailService creado
- [ ] NotificationsService como façade
- [ ] Plantillas de email
- [ ] Integración en App Module
- [ ] Tests para EmailService
- [ ] Variables de entorno configuradas (SMTP, EMAIL_FROM)
- [ ] Logging de envíos
- [ ] Manejo de errores de envío

---

## 🚫 Límites

| ❌ NO | ✅ HACER |
|-----|----------|
| Envío síncrono | Usar queue |
| Sin reintentos | Máximo 3 intentos |
| Hardcodear emails | Usar config/env |
| Ignorar errores | Loguear y alertar |

---

**Status:** ✅ Listo para uso  
**Última actualización:** 2026-01-02
