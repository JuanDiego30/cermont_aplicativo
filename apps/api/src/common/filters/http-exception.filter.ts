/**
 * @filter HttpExceptionFilter
 *
 * Estandariza la respuesta de errores HTTP.
 * 100% type-safe - sin 'any'
 *
 * Uso: Registrado como APP_FILTER global en AppModule.
 */
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import {
    isHttpExceptionResponse,
    extractExceptionMessage,
    getHttpErrorName,
    type HttpExceptionResponse,
} from '../types/exception.types';
import type { ValidationErrorItem, ErrorResponse } from '../types/api-response.types';
import { ApplicationError } from '../errors/application-error.base';
import { DomainError, EntityNotFoundError, DuplicateEntityError } from '../errors/domain-error.base';

/**
 * Estructura de respuesta de error estándar
 */
interface ErrorResponseBody extends ErrorResponse {
    readonly success: false;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const path = request.url;

        const errorResponse = this.buildErrorResponse(exception, path);
        this.logError(exception, errorResponse, request);

        response.status(errorResponse.statusCode).json(errorResponse);
    }

    /**
     * Construye la respuesta de error según el tipo de excepción
     */
    private buildErrorResponse(exception: unknown, path: string): ErrorResponseBody {
        // ApplicationError (errores de capa de aplicación)
        if (exception instanceof ApplicationError) {
            return this.fromApplicationError(exception, path);
        }

        // DomainError (errores de dominio)
        if (exception instanceof DomainError) {
            return this.fromDomainError(exception, path);
        }

        // HttpException de NestJS
        if (exception instanceof HttpException) {
            return this.fromHttpException(exception, path);
        }

        // Error genérico de JavaScript
        if (exception instanceof Error) {
            return this.fromGenericError(exception, path);
        }

        // Unknown (no es una instancia de Error)
        return this.fromUnknownError(path);
    }

    /**
     * Maneja ApplicationError
     */
    private fromApplicationError(
        exception: ApplicationError,
        path: string,
    ): ErrorResponseBody {
        return {
            success: false,
            statusCode: exception.statusCode,
            message: exception.message,
            error: getHttpErrorName(exception.statusCode),
            code: exception.code,
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Maneja DomainError
     */
    private fromDomainError(exception: DomainError, path: string): ErrorResponseBody {
        const statusCode = this.mapDomainErrorToStatus(exception);

        return {
            success: false,
            statusCode,
            message: exception.message,
            error: getHttpErrorName(statusCode),
            code: exception.code,
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Mapea DomainError a HTTP status
     */
    private mapDomainErrorToStatus(exception: DomainError): HttpStatus {
        if (exception instanceof EntityNotFoundError) {
            return HttpStatus.NOT_FOUND;
        }
        if (exception instanceof DuplicateEntityError) {
            return HttpStatus.CONFLICT;
        }
        // Por defecto, los errores de dominio son BAD_REQUEST
        return HttpStatus.BAD_REQUEST;
    }

    /**
     * Maneja HttpException de NestJS
     */
    private fromHttpException(
        exception: HttpException,
        path: string,
    ): ErrorResponseBody {
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Si es string, es un mensaje simple
        if (typeof exceptionResponse === 'string') {
            return {
                success: false,
                statusCode: status,
                message: exceptionResponse,
                error: getHttpErrorName(status),
                timestamp: new Date().toISOString(),
                path,
            };
        }

        // Si es objeto, extraer detalles
        if (isHttpExceptionResponse(exceptionResponse)) {
            return this.parseHttpExceptionResponse(exceptionResponse, status, path);
        }

        // Fallback para objetos no reconocidos
        return {
            success: false,
            statusCode: status,
            message: exception.message,
            error: getHttpErrorName(status),
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Parsea respuesta de HttpException estructurada
     */
    private parseHttpExceptionResponse(
        response: HttpExceptionResponse,
        status: number,
        path: string,
    ): ErrorResponseBody {
        const message = extractExceptionMessage(response);
        const errors = this.extractValidationErrors(response);

        return {
            success: false,
            statusCode: status,
            message,
            error: response.error ?? getHttpErrorName(status),
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Extrae errores de validación de la respuesta
     */
    private extractValidationErrors(
        response: HttpExceptionResponse,
    ): ValidationErrorItem[] {
        // Si message es array de strings (class-validator)
        if (Array.isArray(response.message)) {
            return response.message.map((msg, index) => ({
                field: `field_${index}`,
                message: msg,
            }));
        }

        // Si tiene propiedad errors específica
        const responseWithErrors = response as HttpExceptionResponse & {
            errors?: Array<{ field: string; message: string }>;
        };

        if (Array.isArray(responseWithErrors.errors)) {
            return responseWithErrors.errors;
        }

        return [];
    }

    /**
     * Maneja Error genérico de JavaScript
     */
    private fromGenericError(exception: Error, path: string): ErrorResponseBody {
        return {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error interno del servidor',
            error: 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Maneja error desconocido
     */
    private fromUnknownError(path: string): ErrorResponseBody {
        return {
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error interno del servidor',
            error: 'Internal Server Error',
            timestamp: new Date().toISOString(),
            path,
        };
    }

    /**
     * Registra el error con nivel apropiado
     */
    private logError(
        exception: unknown,
        errorResponse: ErrorResponseBody,
        request: Request,
    ): void {
        const logContext = {
            statusCode: errorResponse.statusCode,
            path: errorResponse.path,
            method: request.method,
            code: errorResponse.code,
        };

        // 5xx son errores críticos
        if (errorResponse.statusCode >= 500) {
            this.logger.error(
                `${errorResponse.message}`,
                exception instanceof Error ? exception.stack : undefined,
                logContext,
            );
            return;
        }

        // 4xx son warnings
        if (errorResponse.statusCode >= 400) {
            this.logger.warn(`${errorResponse.message}`, logContext);
            return;
        }

        // Otros son debug
        this.logger.debug(`${errorResponse.message}`, logContext);
    }
}
