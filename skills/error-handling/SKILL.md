---
name: error-handling
description: Experto en manejo de errores para NestJS y Angular. Usar para excepciones personalizadas, filtros de error, interceptores, logging estructurado y recuperación de errores.
triggers:
  - error
  - exception
  - try catch
  - error handling
  - logging
  - exception filter
role: specialist
scope: quality
output-format: code
---

# Error Handling Patterns

Especialista en manejo robusto de errores para aplicaciones full-stack.

## Rol

Ingeniero de software con 7+ años de experiencia en sistemas resilientes. Experto en patrones de error handling, observabilidad y debugging.

## Cuándo Usar Este Skill

- Crear excepciones personalizadas
- Implementar filtros de excepciones
- Logging estructurado
- Manejo de errores HTTP
- Recuperación de errores
- Error boundaries en frontend
- Retry patterns
- Error tracking

## NestJS - Excepciones Personalizadas

### Base Exception

```typescript
// common/exceptions/base.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorDetails {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export class BaseException extends HttpException {
  public readonly code: string;
  public readonly details?: ErrorDetails[];
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: ErrorDetails[],
  ) {
    super(
      {
        statusCode: status,
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}
```

### Excepciones Específicas

```typescript
// common/exceptions/domain.exceptions.ts
import { HttpStatus } from '@nestjs/common';
import { BaseException, ErrorDetails } from './base.exception';

// Not Found
export class EntityNotFoundException extends BaseException {
  constructor(entity: string, id: string | number) {
    super(
      `${entity} with id '${id}' not found`,
      'ENTITY_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }
}

// Validation
export class ValidationException extends BaseException {
  constructor(errors: ErrorDetails[]) {
    super(
      'Validation failed',
      'VALIDATION_ERROR',
      HttpStatus.BAD_REQUEST,
      errors,
    );
  }
}

// Business Logic
export class BusinessRuleException extends BaseException {
  constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

// Conflict
export class ConflictException extends BaseException {
  constructor(message: string, field?: string) {
    super(
      message,
      'CONFLICT',
      HttpStatus.CONFLICT,
      field ? [{ code: 'DUPLICATE', message, field }] : undefined,
    );
  }
}

// Unauthorized
export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
  }
}

// Forbidden
export class ForbiddenException extends BaseException {
  constructor(resource?: string) {
    super(
      resource
        ? `You don't have permission to access ${resource}`
        : 'Access forbidden',
      'FORBIDDEN',
      HttpStatus.FORBIDDEN,
    );
  }
}

// External Service
export class ExternalServiceException extends BaseException {
  constructor(service: string, originalError?: Error) {
    super(
      `External service '${service}' failed`,
      'EXTERNAL_SERVICE_ERROR',
      HttpStatus.BAD_GATEWAY,
      originalError
        ? [{ code: 'ORIGINAL_ERROR', message: originalError.message }]
        : undefined,
    );
  }
}
```

### Filtro Global de Excepciones

```typescript
// common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseException } from '../exceptions/base.exception';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    
    // Log según severidad
    this.logException(exception, errorResponse, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const requestId = request.headers['x-request-id'] as string;

    // BaseException personalizada
    if (exception instanceof BaseException) {
      return {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
        timestamp,
        path,
        requestId,
      };
    }

    // HttpException de NestJS
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message =
        typeof response === 'string'
          ? response
          : (response as any).message || exception.message;

      return {
        statusCode: exception.getStatus(),
        code: this.getCodeFromStatus(exception.getStatus()),
        message: Array.isArray(message) ? message.join(', ') : message,
        timestamp,
        path,
        requestId,
      };
    }

    // Error genérico
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : (exception as Error)?.message || 'Unknown error',
      timestamp,
      path,
      requestId,
    };
  }

  private getCodeFromStatus(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
    };
    return statusMap[status] || 'UNKNOWN_ERROR';
  }

  private logException(
    exception: unknown,
    errorResponse: ErrorResponse,
    request: Request,
  ): void {
    const logContext = {
      path: errorResponse.path,
      method: request.method,
      statusCode: errorResponse.statusCode,
      code: errorResponse.code,
      requestId: errorResponse.requestId,
      userId: (request as any).user?.id,
      ip: request.ip,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${errorResponse.message}`,
        (exception as Error)?.stack,
        JSON.stringify(logContext),
      );
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn(
        `${errorResponse.message}`,
        JSON.stringify(logContext),
      );
    }
  }
}
```

## Logging Estructurado

### Logger Service

```typescript
// common/logger/logger.service.ts
import { Injectable, LoggerService, Scope } from '@nestjs/common';
import * as winston from 'winston';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === 'production'
          ? winston.format.json()
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
                return `${timestamp} [${level}] [${context || 'App'}]: ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
              }),
            ),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, ...meta: unknown[]): void {
    this.logger.info(message, { context: this.context, ...this.parseMeta(meta) });
  }

  error(message: string, trace?: string, ...meta: unknown[]): void {
    this.logger.error(message, {
      context: this.context,
      stack: trace,
      ...this.parseMeta(meta),
    });
  }

  warn(message: string, ...meta: unknown[]): void {
    this.logger.warn(message, { context: this.context, ...this.parseMeta(meta) });
  }

  debug(message: string, ...meta: unknown[]): void {
    this.logger.debug(message, { context: this.context, ...this.parseMeta(meta) });
  }

  private parseMeta(meta: unknown[]): Record<string, unknown> {
    if (meta.length === 0) return {};
    if (meta.length === 1 && typeof meta[0] === 'object') {
      return meta[0] as Record<string, unknown>;
    }
    return { data: meta };
  }
}
```

## Angular - Error Handling

### Global Error Handler

```typescript
// core/handlers/global-error.handler.ts
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly notification = inject(NotificationService);
  private readonly logger = inject(LoggingService);

  handleError(error: unknown): void {
    // Log error
    this.logger.error('Unhandled error', error);

    // Determinar tipo de error
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error);
    } else if (error instanceof Error) {
      this.handleClientError(error);
    } else {
      this.handleUnknownError(error);
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    const message = this.getHttpErrorMessage(error);
    this.notification.error(message);
  }

  private handleClientError(error: Error): void {
    if (error.message.includes('ChunkLoadError')) {
      // Error de lazy loading - recargar página
      this.notification.warn('Actualizando aplicación...');
      window.location.reload();
      return;
    }

    this.notification.error('Ha ocurrido un error inesperado');
  }

  private handleUnknownError(error: unknown): void {
    console.error('Unknown error:', error);
    this.notification.error('Ha ocurrido un error inesperado');
  }

  private getHttpErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor';
    }

    if (error.error?.message) {
      return error.error.message;
    }

    const statusMessages: Record<number, string> = {
      400: 'Solicitud inválida',
      401: 'Sesión expirada. Por favor, inicie sesión nuevamente',
      403: 'No tiene permisos para realizar esta acción',
      404: 'Recurso no encontrado',
      422: 'Los datos enviados no son válidos',
      429: 'Demasiadas solicitudes. Intente más tarde',
      500: 'Error del servidor. Intente más tarde',
      503: 'Servicio no disponible',
    };

    return statusMessages[error.status] || 'Error de conexión';
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
```

### HTTP Error Interceptor

```typescript
// core/interceptors/http-error.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      // Retry automático para errores de red
      retry({
        count: 2,
        delay: (error, retryCount) => {
          if (this.shouldRetry(error)) {
            return timer(retryCount * 1000);
          }
          return throwError(() => error);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error, request, next);
      }),
    );
  }

  private shouldRetry(error: HttpErrorResponse): boolean {
    // Solo retry para errores de red o 5xx
    return error.status === 0 || error.status >= 500;
  }

  private handleError(
    error: HttpErrorResponse,
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (error.status === 401) {
      return this.handle401(request, next);
    }

    if (error.status === 403) {
      this.router.navigate(['/forbidden']);
    }

    return throwError(() => error);
  }

  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Intentar refresh token
    return this.auth.refreshToken().pipe(
      switchMap(tokens => {
        // Reintentar request con nuevo token
        const newRequest = request.clone({
          headers: request.headers.set(
            'Authorization',
            `Bearer ${tokens.accessToken}`,
          ),
        });
        return next.handle(newRequest);
      }),
      catchError(refreshError => {
        // Refresh falló - logout
        this.auth.logout();
        this.router.navigate(['/login']);
        return throwError(() => refreshError);
      }),
    );
  }
}
```

### Error Boundary Component

```typescript
// shared/components/error-boundary/error-boundary.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  template: `
    @if (hasError) {
      <div class="error-boundary p-6 text-center bg-red-50 rounded-lg">
        <svg class="w-16 h-16 mx-auto text-red-400 mb-4">
          <!-- error icon -->
        </svg>
        <h3 class="text-lg font-semibold text-red-800 mb-2">
          {{ errorTitle }}
        </h3>
        <p class="text-red-600 mb-4">
          {{ errorMessage }}
        </p>
        <button
          (click)="retry()"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    } @else {
      <ng-content />
    }
  `,
})
export class ErrorBoundaryComponent implements OnInit, OnDestroy {
  @Input() errorTitle = 'Algo salió mal';
  @Input() errorMessage = 'No se pudo cargar este contenido';
  @Input() retryFn?: () => void;

  hasError = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Escuchar errores del componente hijo
    window.addEventListener('error', this.handleError.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('error', this.handleError.bind(this));
  }

  private handleError(event: ErrorEvent): void {
    this.hasError = true;
    event.preventDefault();
  }

  retry(): void {
    this.hasError = false;
    this.retryFn?.();
  }
}
```

## Result Pattern (Sin Excepciones)

```typescript
// common/result/result.ts
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  
  constructor(public readonly value: T) {}
  
  map<U>(fn: (value: T) => U): Result<U> {
    return new Success(fn(this.value));
  }
  
  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    return fn(this.value);
  }
}

export class Failure<E> {
  readonly isSuccess = false;
  readonly isFailure = true;
  
  constructor(public readonly error: E) {}
  
  map<U>(): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
  
  flatMap<U>(): Result<U, E> {
    return this as unknown as Result<U, E>;
  }
}

// Helpers
export const success = <T>(value: T): Result<T> => new Success(value);
export const failure = <E>(error: E): Result<never, E> => new Failure(error);

// Uso
class UserService {
  async createUser(dto: CreateUserDto): Promise<Result<User, DomainError>> {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      return failure(new DomainError('EMAIL_EXISTS', 'Email already registered'));
    }
    
    const user = await this.prisma.user.create({ data: dto });
    return success(user);
  }
}

// En controller
const result = await this.userService.createUser(dto);
if (result.isFailure) {
  throw new BusinessRuleException(result.error.message, result.error.code);
}
return result.value;
```

## Restricciones

### DEBE HACER
- Usar excepciones tipadas
- Logging estructurado con contexto
- Retry para errores transitorios
- Mostrar mensajes user-friendly
- Trackear errores en producción

### NO DEBE HACER
- Swallow errors silenciosamente
- Exponer stack traces en producción
- Usar console.log para errores
- Ignorar errores de validación
- Catch genérico sin rethrow

## Skills Relacionados

- **nestjs-expert** - Exception filters
- **angular-architect** - Error boundaries
- **security-hardening** - Error messages seguros
