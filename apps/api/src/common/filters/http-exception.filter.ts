import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        const message =
            typeof exceptionResponse === 'object'
                ? (exceptionResponse as any).message
                : exceptionResponse;

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: message || 'Error interno del servidor',
            error:
                status === HttpStatus.INTERNAL_SERVER_ERROR
                    ? 'Internal Server Error'
                    : (exceptionResponse as any).error || 'Error',
        };

        this.logger.error(
            `[${request.method}] ${request.url}`,
            JSON.stringify(errorResponse)
        );

        response.status(status).json(errorResponse);
    }
}
