import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { LoggerService } from "../logging/logger.service";

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest();
    const response = http.getResponse();

    const start = Date.now();

    const method = request?.method as string | undefined;
    const url = request?.url as string | undefined;
    const requestId =
      (request?.requestId as string | undefined) || "no-request-id";

    const user = request?.user as { userId?: string } | undefined;
    const userId = user?.userId;

    return next.handle().pipe(
      tap(() => {
        const statusCode = (response?.statusCode as number | undefined) ?? 0;
        const durationMs = Date.now() - start;

        // Importante: no loguear body, headers ni PII (email, ip, user-agent).
        this.logger.logApiRequest(
          method ?? "UNKNOWN",
          url ?? "UNKNOWN",
          statusCode,
          durationMs,
          userId,
          {
            requestId,
            controller: context.getClass()?.name,
            handler: context.getHandler()?.name,
          },
        );
      }),
      catchError((error) => {
        const statusCode = (response?.statusCode as number | undefined) ?? 0;
        const durationMs = Date.now() - start;

        this.logger.logErrorWithStack(
          error instanceof Error ? error : new Error(String(error)),
          "HttpLoggingInterceptor",
          {
            requestId,
            method: method ?? "UNKNOWN",
            url: url ?? "UNKNOWN",
            statusCode,
            durationMs,
            userId,
            controller: context.getClass()?.name,
            handler: context.getHandler()?.name,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
