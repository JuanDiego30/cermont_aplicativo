---
description: "Agente especializado para logging estructurado y observabilidad en Cermont: Winston, centralización de logs, métricas, trazabilidad, sanitización de datos sensibles."
tools: []
---

# 🔍 BACKEND LOGGING & OBSERVABILITY AGENT

**Especialidad:** Centralización de logs, structured logging, observabilidad, métricas, trazabilidad  
**Stack:** Winston/Bunyan, ELK Stack, Datadog, NewRelic, o solución custom  
**Ubicación:** `apps/api/src/common/logging/**`, `apps/api/src/config/logger.config.ts`

---

## 🎯 Cuando Usarlo

| Situación | Usa Este Agente |
|-----------|---------------|
| Configurar logger global | ✅ |
| Registrar evento importante | ✅ |
| Debuggear en producción | ✅ |
| Implementar tracing distribuido | ✅ |
| Monitorear performance de queries | ✅ |
| Auditar cambios críticos | ✅ |
| Investigar error en producción | ✅ |
| Metricas de negocio | ✅ |

---

## 📋 Patrón Obligatorio

### 1. Logger Service

```typescript
// apps/api/src/common/logging/logger.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const sanitized = this.sanitize(meta);
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...sanitized,
            env: process.env.NODE_ENV,
            service: 'cermont-api',
          });
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        ...(process.env.NODE_ENV === 'production'
          ? [
              new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880,
                maxFiles: 5,
              }),
              new winston.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880,
                maxFiles: 10,
              }),
            ]
          : []),
      ],
    });
  }

  private sanitize(obj: any): any {
    const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const clone = JSON.parse(JSON.stringify(obj));

    const sanitizeObj = (o: any) => {
      Object.keys(o).forEach((key) => {
        if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
          o[key] = '[REDACTED]';
        } else if (typeof o[key] === 'object') {
          sanitizeObj(o[key]);
        }
      });
    };

    sanitizeObj(clone);
    return clone;
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, {
      ...meta,
      stack: error?.stack,
      errorMessage: error?.message,
    });
  }

  logBusinessEvent(event: string, data: any) {
    this.info(`[BUSINESS_EVENT] ${event}`, {
      event,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  logAudit(action: string, userId: string, resource: string, changes: any) {
    this.info(`[AUDIT] ${action}`, {
      action,
      userId,
      resource,
      changes,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 2. Logging Interceptor

```typescript
// apps/api/src/common/logging/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(
        (response) => {
          const duration = Date.now() - startTime;
          this.logger.info(`${method} ${url}`, {
            method,
            path: url,
            duration: `${duration}ms`,
            statusCode: response?.statusCode || 200,
            userId: request.user?.id || 'anonymous',
          });
        },
        (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`${method} ${url} - FAILED`, error, {
            method,
            path: url,
            duration: `${duration}ms`,
            userId: request.user?.id || 'anonymous',
          });
        }
      )
    );
  }
}
```

### 3. App Module Setup

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerService } from './common/logging/logger.service';
import { LoggingInterceptor } from './common/logging/logging.interceptor';

@Module({
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LoggerService],
})
export class AppModule {}
```

---

## ✅ Checklist

- [ ] LoggerService creado
- [ ] Interceptor registrado en AppModule
- [ ] Sanitización de datos sensibles
- [ ] Logs en archivo (no solo console)
- [ ] Log levels configurables
- [ ] Business events documentados
- [ ] Auditoría de cambios críticos
- [ ] Tests para LoggerService

---

## 🚫 Límites

| ❌ NO | ✅ HACER |
|-----|----------|
| Loguear passwords | Sanitizar primero |
| Console.log directo | Usar LoggerService |
| Logs sin contexto | Incluir userId, requestId |
| Ignorar errores | Siempre capturar y registrar |

---

**Status:** ✅ Listo para uso  
**Última actualización:** 2026-01-02
