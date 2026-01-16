/**
 * @file transform.interceptor.ts
 * @description Interceptor que transforma respuestas a formato estándar
 *
 * Envuelve automáticamente las respuestas exitosas en ApiSuccessResponseDto
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Reflector } from "@nestjs/core";
import { ApiSuccessResponseDto } from "../dto/api-response.dto";

/**
 * Metadata key para skipear el transform
 */
export const SKIP_TRANSFORM_KEY = "skipTransform";

/**
 * Interceptor que envuelve respuestas exitosas en ApiSuccessResponseDto
 *
 * Uso: Registrar globalmente o por controller
 *
 * Para skipear el transform en un endpoint específico:
 * @SkipTransform()
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponseDto<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponseDto<T> | T> {
    // Verificar si debe skipear el transform
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        // Si ya es ApiSuccessResponseDto, retornar tal cual
        if (this.isAlreadyWrapped(data)) {
          return data;
        }

        // Si es undefined/null, envolver con data vacía
        if (data === undefined || data === null) {
          return ApiSuccessResponseDto.of(null as T);
        }

        // Envolver data en ApiSuccessResponseDto
        return ApiSuccessResponseDto.of(data);
      }),
    );
  }

  /**
   * Verifica si la respuesta ya está envuelta
   */
  private isAlreadyWrapped(data: unknown): data is ApiSuccessResponseDto<T> {
    return (
      data !== null &&
      typeof data === "object" &&
      "success" in data &&
      (data as Record<string, unknown>).success === true &&
      "data" in data
    );
  }
}

/**
 * Interceptor que agrega timeout a las peticiones
 */
import { catchError, timeout } from "rxjs/operators";
import { throwError, TimeoutError } from "rxjs";
import { RequestTimeoutException } from "@nestjs/common";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30000) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException(
                `La petición excedió el tiempo límite de ${this.timeoutMs / 1000} segundos`,
              ),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
