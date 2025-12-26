import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
            exception instanceof Error ? exception.message : 'Unknown error';

        this.logger.error(
            `[${request.method}] ${request.url}`,
            exception instanceof Error ? exception.stack : String(exception)
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: 'Error interno del servidor',
            error: 'Internal Server Error',
        });
    }
}
