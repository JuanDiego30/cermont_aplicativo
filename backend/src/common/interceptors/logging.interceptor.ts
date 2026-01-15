/**
 * @interceptor LoggingInterceptor
 *
 * Registra método/URL/status, duración y contexto por request.
 * Incluye requestId para correlación en sistemas distribuidos.
 *
 * Uso: Registrado como APP_INTERCEPTOR global en AppModule.
 *
 * Mejoras aplicadas:
 * - Logging estructurado (JSON format ready)
 * - Request ID para tracing
 * - Información de usuario autenticado
 * - IP del cliente
 * - User-Agent
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { throwError } from "rxjs";
import { LoggerService } from "../../lib/logging/logger.service";

interface LogContext {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const requestId = request.requestId || "no-request-id";

    // Log inicial de request entrante (solo en desarrollo)
    if (process.env.NODE_ENV !== "production") {
      this.logger.debug(
        `[${requestId}] → ${method} ${url}`,
        "LoggingInterceptor",
        {
          requestId,
          type: "http_request_start",
        },
      );
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const logContext = this.buildLogContext(
          request,
          response,
          now,
          requestId,
        );
        this.logSuccess(logContext);
      }),
      catchError((error) => {
        const response = context.switchToHttp().getResponse();
        const logContext = this.buildLogContext(
          request,
          response,
          now,
          requestId,
        );
        this.logError(logContext, error);
        return throwError(() => error);
      }),
    );
  }

  private buildLogContext(
    request: Record<string, unknown>,
    response: Record<string, unknown>,
    startTime: number,
    requestId: string,
  ): LogContext {
    const user = request.user as
      | { userId?: string; email?: string }
      | undefined;

    return {
      requestId,
      method: request.method as string,
      url: request.url as string,
      statusCode: (response.statusCode as number) || 0,
      duration: Date.now() - startTime,
      userId: user?.userId,
      userEmail: user?.email,
      ip: this.getClientIp(request),
      userAgent: this.getHeader(request, "user-agent"),
    };
  }

  private logSuccess(ctx: LogContext): void {
    // Usar método especializado de LoggerService para logging de API
    this.logger.logApiRequest(
      ctx.method,
      ctx.url,
      ctx.statusCode,
      ctx.duration,
      ctx.userId,
      {
        requestId: ctx.requestId,
        userEmail: ctx.userEmail,
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      },
    );
  }

  private logError(ctx: LogContext, error: Error): void {
    // Usar método especializado de LoggerService para logging de errores
    this.logger.logErrorWithStack(error, "LoggingInterceptor", {
      requestId: ctx.requestId,
      method: ctx.method,
      url: ctx.url,
      statusCode: ctx.statusCode,
      duration: ctx.duration,
      userId: ctx.userId,
      userEmail: ctx.userEmail,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }

  private getClientIp(request: Record<string, unknown>): string {
    const headers = request.headers as
      | Record<string, string | string[]>
      | undefined;
    if (!headers) return "unknown";

    // Verificar headers de proxy
    const forwarded = headers["x-forwarded-for"];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      return ips.split(",")[0].trim();
    }

    return (request.ip as string) || "unknown";
  }

  private getHeader(
    request: Record<string, unknown>,
    header: string,
  ): string | undefined {
    const headers = request.headers as
      | Record<string, string | string[]>
      | undefined;
    if (!headers) return undefined;

    const value = headers[header];
    return Array.isArray(value) ? value[0] : value;
  }
}
