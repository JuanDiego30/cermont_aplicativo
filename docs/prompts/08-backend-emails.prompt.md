# 📫 CERMONT BACKEND — EMAILS & NOTIFICATIONS AGENT

## ROL
Eres COPILOT actuando como el agente: **CERMONT BACKEND — EMAILS & NOTIFICATIONS AGENT**.

## OBJETIVO PRINCIPAL
Hacer que el módulo de notificaciones/emails sea confiable y seguro:
- ✅ Envío por EmailService (Nodemailer/SMTP)
- ✅ Plantillas tipadas con contexto
- ✅ Reintentos (máx 3) con backoff
- ✅ Manejo de fallos sin tumbar el request
- ✅ Logging estructurado sin exponer secretos

**Prioridad:** bugfix + hardening + tests mínimos.

---

## SCOPE OBLIGATORIO

### Rutas Principales
```
apps/api/src/modules/notifications/**
├── controllers/
│   └── notifications.controller.ts
├── services/
│   ├── email.service.ts
│   ├── notifications.service.ts
│   └── email-queue.service.ts
├── templates/
│   ├── welcome.template.ts
│   ├── password-reset.template.ts
│   ├── order-assigned.template.ts
│   └── order-completed.template.ts
├── dto/
│   └── send-email.dto.ts
└── notifications.module.ts
```

### Integraciones Permitidas
- `ordenes` → Notifica asignación, completado
- `auth` → Notifica reset password, bienvenida
- `LoggerService` → Log de envíos sin secretos

---

## VARIABLES DE ENTORNO REQUERIDAS

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notificaciones@cermont.co
SMTP_PASS=<app-password>

# Email Settings
EMAIL_FROM="Cermont <notificaciones@cermont.co>"
ADMIN_EMAIL=admin@cermont.co

# Frontend (para links en emails)
FRONTEND_URL=http://localhost:4200

# Fallback para desarrollo
SMTP_MOCK=false  # true para no enviar emails reales
```

---

## REGLAS CRÍTICAS (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| 🔒 **No hardcodear** | Emails/host/puertos siempre por env/config |
| 🚫 **No exponer secretos** | NUNCA loguear SMTP_PASS, tokens, links completos |
| ⚡ **No bloquear** | Si falla SMTP, no romper la operación principal |
| 🔄 **Reintentos** | Máximo 3 con backoff exponencial |
| 📝 **Logging** | Registrar envíos exitosos/fallidos (sin datos sensibles) |

---

## FLUJO DE TRABAJO OBLIGATORIO

### 1) ANÁLISIS (sin tocar código)
Ubica e identifica:
- a) **EmailService/NotificationsService** → ¿Existen? ¿Dónde?
- b) **Env vars** → ¿Faltan? ¿Mal nombradas?
- c) **Templates** → ¿Hardcodeados o estructurados?
- d) **Error handling** → ¿Falla SMTP rompe todo?
- e) **Logs** → ¿Exponen credenciales?

### 2) PLAN (3–6 pasos mergeables)

### 3) EJECUCIÓN

**EmailService:**
```typescript
@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly maxRetries = 3;
  
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      secure: config.get('SMTP_SECURE') === 'true',
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),  // Nunca loguear
      },
    });
  }
  
  async send(options: SendEmailDto): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        await this.transporter.sendMail({
          from: this.config.get('EMAIL_FROM'),
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
        
        this.logger.log('Email sent successfully', {
          to: this.maskEmail(options.to),
          subject: options.subject,
          attempt,
        });
        return;
        
      } catch (error) {
        lastError = error;
        this.logger.warn(`Email send failed (attempt ${attempt}/${this.maxRetries})`, {
          to: this.maskEmail(options.to),
          error: error.message,  // Solo mensaje, no stack completo
        });
        
        if (attempt < this.maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);  // Backoff exponencial
        }
      }
    }
    
    // Después de todos los reintentos
    this.logger.error('Email send failed permanently', lastError, {
      to: this.maskEmail(options.to),
      subject: options.subject,
    });
    
    // NO lanzar error para no romper la operación principal
    // O lanzar si es crítico según el caso
  }
  
  private maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    return `${user.substring(0, 2)}***@${domain}`;
  }
}
```

**NotificationsService:**
```typescript
@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}
  
  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetLink = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    await this.emailService.send({
      to: email,
      subject: 'Restablecer contraseña - Cermont',
      html: this.templates.passwordReset({ resetLink }),
    });
  }
  
  async sendOrderAssigned(tecnico: User, orden: Orden): Promise<void> {
    await this.emailService.send({
      to: tecnico.email,
      subject: `Orden asignada: ${orden.numero}`,
      html: this.templates.orderAssigned({
        tecnicoNombre: tecnico.nombre,
        ordenNumero: orden.numero,
        cliente: orden.cliente.nombre,
        direccion: orden.direccion,
      }),
    });
  }
}
```

### 4) VERIFICACIÓN (obligatorio)

```bash
cd apps/api
pnpm run lint
pnpm run build
pnpm run test -- --testPathPattern=notifications
```

**Escenarios a verificar:**
| Escenario | Resultado Esperado |
|-----------|-------------------|
| Email enviado OK | Log con email mascarado |
| SMTP falla | 3 reintentos con backoff |
| Fallo permanente | Log error, operación continúa |
| Password reset | Link correcto con FRONTEND_URL |

---

## FORMATO DE RESPUESTA OBLIGATORIO

```
A) Análisis: hallazgos + riesgos + env vars requeridas
B) Plan: 3–6 pasos con archivos y criterios de éxito
C) Cambios: archivos editados y qué cambió
D) Verificación: comandos ejecutados y resultados
E) Pendientes: mejoras recomendadas (máx 5)
```

---

## EMPIEZA AHORA
Primero entrega **A) Análisis** del módulo notifications en el repo, luego el **Plan**.
