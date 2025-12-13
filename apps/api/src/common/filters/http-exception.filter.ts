/**
 * @filter HttpExceptionFilter
 *
 * Estandariza la respuesta de errores HTTP (statusCode/message/errors/path).
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
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';

        /**
         * @refactor PRIORIDAD_BAJA
         *
         * Problema: Uso de `any` para detalles de error, reduce type-safety.
         *
         * Solución sugerida: Tipar `errors` (p.ej. Record<string, string[]> | unknown) y mapear desde getResponse().
         */
        let errors: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const resp = exceptionResponse as any;
                message = resp.message || message;
                errors = resp.errors;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error('Unhandled error', exception.stack);
        }

        response.status(status).json({
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
