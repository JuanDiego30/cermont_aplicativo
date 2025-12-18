# Email Module

## Descripción
Módulo de envío de emails con arquitectura DDD.

## Arquitectura

```
email/
├── domain/
│   ├── entities/email.entity.ts        # Entidad Email
│   ├── value-objects/email-address.vo.ts # Value Object validado
│   └── repositories/                    # Interfaces
├── application/
│   ├── dto/send-email.dto.ts           # DTOs validados
│   └── use-cases/send-email.use-case.ts # Casos de uso
├── infrastructure/
│   ├── controllers/email.controller.ts  # API REST
│   └── services/nodemailer-email.service.ts # SMTP
└── email.module.ts                      # Configuración NestJS
```

## Uso

```typescript
// Inyectar Use Case
constructor(private readonly sendEmail: SendEmailUseCase) {}

// Enviar email
await this.sendEmail.execute({
  from: 'noreply@cermont.com',
  to: ['cliente@example.com'],
  subject: 'Orden completada',
  html: '<p>Su orden fue completada</p>',
});
```

## Configuración
Variables de entorno requeridas:
- `SMTP_HOST` - Servidor SMTP
- `SMTP_PORT` - Puerto (587/465)
- `SMTP_USER` - Usuario
- `SMTP_PASSWORD` - Contraseña

## Tests
```bash
pnpm test -- --testPathPattern="email"
```
