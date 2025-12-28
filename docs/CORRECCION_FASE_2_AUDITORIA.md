# 🔍 FASE 2: CONSOLIDACIÓN DE AUDITORÍA Y ERROR HANDLING

**Versión:** 2.0  
**Fecha:** 28 de Diciembre de 2025  
**Prioridad:** 🟡 MEDIA (después de Fase 1)  
**Tiempo Estimado:** 4-6 horas  

---

## 🎯 PROBLEMAS A RESOLVER

### Problema 2.1: Auditoría Duplicada
- `auth/auth.service.ts` - método `createAuditLog()`
- `admin/admin.service.ts` - método `logAudit()`
- Ambos registran eventos pero con diferentes estructuras

### Problema 2.2: Error Handling No Centralizado
- Cada servicio tiene su propio try-catch
- Mensajes de error exponen detalles internos
- No hay filtro de excepciones global

### Problema 2.3: Logging Inconsistente
- Algunos logs en `console.log()`
- Otros en `Logger` de NestJS
- Sin contexto estandarizado

---

## ✅ SOLUCIÓN PROPUESTA

### Paso 2.1: Crear Servicio de Auditoría Centralizado

**Archivo:** `apps/api/src/lib/services/audit.service.ts` (NUEVO)

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * Tipos de eventos auditables
 */
export enum AuditAction {
  // AUTH
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_REGISTER = 'AUTH_REGISTER',
  AUTH_PASSWORD_RESET = 'AUTH_PASSWORD_RESET',
  AUTH_PASSWORD_CHANGE = 'AUTH_PASSWORD_CHANGE',
  AUTH_EMAIL_VERIFY = 'AUTH_EMAIL_VERIFY',

  // USERS
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ROLE_CHANGE = 'USER_ROLE_CHANGE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',
  USER_ACTIVATE = 'USER_ACTIVATE',

  // ORDERS
  ORDER_CREATE = 'ORDER_CREATE',
  ORDER_UPDATE = 'ORDER_UPDATE',
  ORDER_DELETE = 'ORDER_DELETE',
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  ORDER_ASSIGN_TECH = 'ORDER_ASSIGN_TECH',

  // PERMISSIONS
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
}

export interface AuditContext {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp?: Date;
}

/**
 * Servicio centralizado de auditoría
 * Aplica REGLA 1: NO DUPLICAR CÓDIGO
 * Aplica REGLA 6: LOGGER ESTRUCTURADO
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly AUDIT_ENABLED = true;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registra un evento auditable
   * @param context Contexto del evento
   */
  async log(context: AuditContext): Promise<void> {
    try {
      if (!this.AUDIT_ENABLED) {
        this.logger.debug('Auditoría deshabilitada', { action: context.action });
        return;
      }

      // Validar contexto
      if (!context.userId) {
        this.logger.warn('AuditService: userId requerido', { context });
        return;
      }

      // Log estructurado
      this.logger.log('Audit Event', {
        action: context.action,
        userId: context.userId,
        entityType: context.entityType,
        entityId: context.entityId,
        timestamp: new Date().toISOString(),
        ip: context.ip,
        userAgent: this.sanitizeUserAgent(context.userAgent),
      });

      // Guardar en BD si la tabla existe
      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId: context.userId,
            action: context.action,
            entityType: context.entityType,
            entityId: context.entityId,
            changes: context.changes ? JSON.stringify(context.changes) : null,
            ipAddress: context.ip || 'UNKNOWN',
            userAgent: this.sanitizeUserAgent(context.userAgent),
            timestamp: context.timestamp || new Date(),
          },
        });
      }
    } catch (error) {
      // NUNCA dejar que auditoría falle el flujo principal
      this.logger.error('Error logging audit event', {
        error: error.message,
        context,
        stack: error.stack,
      });
    }
  }

  /**
   * Registra intento de login fallido
   * @param email Email del usuario
   * @param reason Razón del fallo
   * @param ip IP del cliente
   * @param userAgent User agent
   */
  async logFailedLogin(
    email: string,
    reason: string,
    ip?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      this.logger.warn('Failed login attempt', {
        email,
        reason,
        ip,
        timestamp: new Date().toISOString(),
      });

      if (this.prisma.auditLog) {
        await this.prisma.auditLog.create({
          data: {
            userId: 'ANONYMOUS',
            action: AuditAction.AUTH_LOGIN_FAILED,
            entityType: 'AUTH',
            entityId: email,
            changes: JSON.stringify({ reason }),
            ipAddress: ip || 'UNKNOWN',
            userAgent: this.sanitizeUserAgent(userAgent),
            timestamp: new Date(),
          },
        });
      }
    } catch (error) {
      this.logger.error('Error logging failed login', {
        error: error.message,
        email,
        stack: error.stack,
      });
    }
  }

  /**
   * Obtiene historial de auditoría para un usuario
   * @param userId ID del usuario
   * @param limit Número de registros
   */
  async getUserAuditHistory(userId: string, limit = 50) {
    try {
      if (!this.prisma.auditLog) {
        this.logger.warn('auditLog table not configured');
        return [];
      }

      return await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (error) {
      this.logger.error('Error fetching audit history', {
        userId,
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Obtiene todos los eventos de auditoría
   * @param filters Filtros opcionales
   */
  async getAuditLog(filters?: {
    action?: AuditAction;
    entityType?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    try {
      if (!this.prisma.auditLog) {
        this.logger.warn('auditLog table not configured');
        return [];
      }

      const where: any = {};

      if (filters?.action) where.action = filters.action;
      if (filters?.entityType) where.entityType = filters.entityType;
      if (filters?.userId) where.userId = filters.userId;

      if (filters?.startDate || filters?.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      return await this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: filters?.limit || 100,
      });
    } catch (error) {
      this.logger.error('Error fetching audit log', {
        error: error.message,
        filters,
      });
      return [];
    }
  }

  /**
   * Sanitiza user agent para no almacenar información sensible
   */
  private sanitizeUserAgent(userAgent?: string): string {
    if (!userAgent) return 'UNKNOWN';

    // Preservar solo navegador y SO
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    const os = ['Windows', 'Mac', 'Linux', 'iOS', 'Android'];

    let sanitized = userAgent;
    for (const browser of browsers) {
      if (sanitized.includes(browser)) {
        return browser;
      }
    }
    for (const system of os) {
      if (sanitized.includes(system)) {
        return system;
      }
    }

    return 'UNKNOWN';
  }
}
```

---

### Paso 2.2: Crear Filtro de Excepciones Global

**Archivo:** `apps/api/src/lib/filters/http-exception.filter.ts` (NUEVO)

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  trace?: string;
}

/**
 * Filtro centralizado de excepciones HTTP
 * Aplica REGLA 5: TRY-CATCH EN TODO
 * Aplica REGLA 6: LOGGER ESTRUCTURADO
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message: this.getMessage(exceptionResponse),
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Agregar error si está disponible
    if (typeof exceptionResponse === 'object' && 'error' in exceptionResponse) {
      errorResponse.error = (exceptionResponse as any).error;
    }

    // Log del error
    this.logError({
      status,
      message: errorResponse.message,
      path: request.url,
      method: request.method,
      ip: this.getClientIp(request),
      userAgent: request.get('user-agent'),
      exception,
    });

    // Enviar respuesta
    response.status(status).json(errorResponse);
  }

  /**
   * Extrae el mensaje de la excepción
   */
  private getMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object') {
      if ('message' in exceptionResponse) {
        const msg = exceptionResponse.message;
        return Array.isArray(msg) ? msg[0] : msg;
      }
      if ('error' in exceptionResponse) {
        return exceptionResponse.error;
      }
    }

    return 'Internal Server Error';
  }

  /**
   * Obtiene IP del cliente
   */
  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      request.socket.remoteAddress ||
      'UNKNOWN'
    );
  }

  /**
   * Registra el error con logging estructurado
   */
  private logError(context: {
    status: number;
    message: string;
    path: string;
    method: string;
    ip: string;
    userAgent?: string;
    exception: HttpException;
  }) {
    // Determinar nivel de log basado en status
    const isServerError = context.status >= 500;
    const isClientError = context.status >= 400 && context.status < 500;

    const logData = {
      status: context.status,
      message: context.message,
      path: context.path,
      method: context.method,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString(),
    };

    if (isServerError) {
      this.logger.error(
        `[${context.method} ${context.path}] ${context.message}`,
        logData,
      );
    } else if (isClientError) {
      this.logger.warn(
        `[${context.method} ${context.path}] ${context.message}`,
        logData,
      );
    } else {
      this.logger.log(
        `[${context.method} ${context.path}] ${context.message}`,
        logData,
      );
    }
  }
}
```

---

### Paso 2.3: Crear Filtro para Excepciones No HTTP

**Archivo:** `apps/api/src/lib/filters/all-exceptions.filter.ts` (NUEVO)

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Filtro para TODAS las excepciones (incluidas no-HTTP)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = this.getErrorMessage(exception);

    // Loguear el error inesperado
    this.logger.error('Unhandled Exception', {
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // Responder sin exponer detalles internos
    response.status(status).json({
      statusCode: status,
      message: 'Error interno del servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }
    if (typeof exception === 'string') {
      return exception;
    }
    return 'Unknown error';
  }
}
```

---

### Paso 2.4: Actualizar AUTH SERVICE

**Archivo:** `apps/api/src/modules/auth/auth.service.ts`

**LÍNEA 1-10:** CAMBIAR imports

```typescript
import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
```

POR:

```typescript
import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
import { AuditService, AuditAction } from '../../lib/services/audit.service';
```

**LÍNEA 40:** CAMBIAR constructor

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly passwordService: PasswordService,
) { }
```

POR:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly passwordService: PasswordService,
  private readonly auditService: AuditService,
) { }

private readonly logger = new Logger(AuthService.name);
```

**LÍNEA 100-150:** ENCONTRAR y REEMPLAZAR método `login()`

BUSCAR:
```typescript
async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
  try {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordMatch = await this.comparePassword(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { access_token, refresh_token } = await this.generateTokens(user);
    await this.createAuditLog(user.id, AuditAction.AUTH_LOGIN, ip, userAgent);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    this.logger.error('Login error', error);
    throw error;
  }
}
```

REEMPLAZAR POR:

```typescript
async login(
  dto: LoginDto,
  ip?: string,
  userAgent?: string,
): Promise<AuthResponse> {
  try {
    // Validar entrada
    if (!dto.email || !dto.password) {
      await this.auditService.logFailedLogin(
        dto.email || 'EMPTY',
        'Credenciales vacías',
        ip,
        userAgent,
      );
      throw new BadRequestException('Email y contraseña requeridos');
    }

    // Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      await this.auditService.logFailedLogin(
        dto.email,
        'Usuario no existe',
        ip,
        userAgent,
      );
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si usuario está activo
    if (!user.active) {
      await this.auditService.logFailedLogin(
        dto.email,
        'Usuario inactivo',
        ip,
        userAgent,
      );
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar bloqueo temporal (por intentos fallidos)
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await this.auditService.logFailedLogin(
        dto.email,
        'Cuenta bloqueada temporalmente',
        ip,
        userAgent,
      );
      throw new UnauthorizedException(
        'Cuenta bloqueada. Inténtelo más tarde.',
      );
    }

    // Validar contraseña
    const passwordMatch = await this.comparePassword(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      // Incrementar intentos fallidos
      const newAttempts = (user.loginAttempts || 0) + 1;
      const shouldLock = newAttempts >= 5;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
            : null,
        },
      });

      await this.auditService.logFailedLogin(
        dto.email,
        `Contraseña incorrecta (intento ${newAttempts}/5)`,
        ip,
        userAgent,
      );

      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Resetear intentos fallidos
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Generar tokens
    const { access_token, refresh_token } = await this.generateTokens(user);

    // Auditar login exitoso
    await this.auditService.log({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: AuditAction.AUTH_LOGIN,
      entityType: 'AUTH',
      entityId: user.id,
      ip,
      userAgent,
    });

    this.logger.log(`Usuario ${user.email} login exitoso`, {
      userId: user.id,
      ip,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    this.logger.error('Error en login', {
      error: error.message,
      email: dto.email,
      stack: error.stack,
    });
    throw error;
  }
}
```

**LÍNEA 200-220:** ELIMINAR método `createAuditLog()`

BUSCAR y ELIMINAR:
```typescript
private async createAuditLog(
  userId: string,
  action: AuditAction,
  ip?: string,
  userAgent?: string,
): Promise<void> {
  try {
    // ... código de auditoría
  } catch (error) {
    this.logger.error('Error en auditoría', error);
  }
}
```

---

### Paso 2.5: Actualizar ADMIN SERVICE

**Archivo:** `apps/api/src/modules/admin/admin.service.ts`

**LÍNEA 1-20:** CAMBIAR imports

```typescript
import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
```

POR:

```typescript
import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
import { AuditService, AuditAction } from '../../lib/services/audit.service';
```

**LÍNEA 35:** CAMBIAR constructor

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly passwordService: PasswordService,
) { }
```

POR:

```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly passwordService: PasswordService,
  private readonly auditService: AuditService,
) { }
```

**LÍNEA 280-300:** ENCONTRAR y ELIMINAR método `logAudit()`

BUSCAR y ELIMINAR:
```typescript
private async logAudit(
  action: string,
  userId: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>,
): Promise<void> {
  try {
    // ... código de auditoría
  } catch (error) {
    this.logger.error('Error en auditoría', error);
  }
}
```

**LÍNEA 70-80:** REEMPLAZAR llamadas a `logAudit()` con `auditService.log()`

BUSCAR:
```typescript
await this.logAudit('USER_CREATE', userId, 'USER', dto.email);
```

REEMPLAZAR POR:
```typescript
await this.auditService.log({
  userId,
  userRole: 'admin',
  action: AuditAction.USER_CREATE,
  entityType: 'USER',
  entityId: dto.email,
});
```

---

### Paso 2.6: Registrar Filtros y Servicios en APP

**Archivo:** `apps/api/src/app.module.ts`

**CAMBIAR** la declaración de módulos:

```typescript
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './lib/filters/http-exception.filter';
import { AllExceptionsFilter } from './lib/filters/all-exceptions.filter';
import { AuditService } from './lib/services/audit.service';
import { PasswordService } from './lib/services/password.service';

@Module({
  imports: [
    // ... existing imports
  ],
  providers: [
    // Servicios compartidos
    PasswordService,
    AuditService,
    // Filtros globales
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

---

### Paso 2.7: Actualizar Módulos para Usar Servicios

**Archivo:** `apps/api/src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PasswordService } from '../../lib/services/password.service';
import { AuditService } from '../../lib/services/audit.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PasswordService,
    AuditService,
  ],
  exports: [AuthService, PasswordService, AuditService],
})
export class AuthModule {}
```

**Archivo:** `apps/api/src/modules/admin/admin.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PasswordService } from '../../lib/services/password.service';
import { AuditService } from '../../lib/services/audit.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PasswordService, AuditService],
  exports: [AdminService, PasswordService, AuditService],
})
export class AdminModule {}
```

---

## 📊 RESUMEN DE CAMBIOS

| Item | Acción | Archivos Afectados |
|------|--------|-------------------|
| Servicio Auditoría | Crear | `lib/services/audit.service.ts` |
| Filtro HTTP | Crear | `lib/filters/http-exception.filter.ts` |
| Filtro Global | Crear | `lib/filters/all-exceptions.filter.ts` |
| Auth Service | Actualizar | `modules/auth/auth.service.ts` |
| Admin Service | Actualizar | `modules/admin/admin.service.ts` |
| Auth Module | Actualizar | `modules/auth/auth.module.ts` |
| Admin Module | Actualizar | `modules/admin/admin.module.ts` |
| App Module | Actualizar | `app.module.ts` |

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Crear `lib/services/audit.service.ts`
- [ ] Crear `lib/filters/http-exception.filter.ts`
- [ ] Crear `lib/filters/all-exceptions.filter.ts`
- [ ] Actualizar `auth.service.ts` - agregar AuditService
- [ ] Actualizar `admin.service.ts` - agregar AuditService
- [ ] Actualizar `auth.module.ts` - exportar servicios
- [ ] Actualizar `admin.module.ts` - exportar servicios
- [ ] Actualizar `app.module.ts` - registrar filtros
- [ ] Ejecutar `npm test` - debe pasar
- [ ] Probar login - debe auditar
- [ ] Probar crear usuario - debe auditar
- [ ] Probar error - debe devolver respuesta limpia

---

## 🚀 SIGUIENTE: FASE 3

Ver `CORRECCION_FASE_3_MODULOS.md` para:
- Consolidar módulos `ordenes` y `orders`
- Crear base classes y mappers
- Eliminar duplicidad de código

