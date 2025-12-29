import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '@/lib/logging/logger.service';

interface ErrorResponse {
    statusCode: number;
    timestamp: string;
    path: string;
    message: string;
    method: string;
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal Server Error';
        let details: any = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const errObj = exceptionResponse as any;
                message = errObj.message || message;
                if (Array.isArray(errObj.message)) {
                    message = errObj.message[0];
                }
                details = errObj.details;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            // Log stack trace for debugging
            this.logger.error(
                `Unhandled ${exception.constructor.name}`,
                exception.stack,
                'GlobalExceptionFilter',
            );
        } else {
            this.logger.error(
                'Unknown exception',
                String(exception),
                'GlobalExceptionFilter',
            );
        }

        const errorResponse: ErrorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.path,
            method: request.method,
            message,
        };

        // Only include details if in development
        if (process.env.NODE_ENV === 'development' && details) {
            (errorResponse as any).details = details;
        }

        // Log the error
        if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `${request.method} ${request.path} - ${status}`,
                JSON.stringify(errorResponse),
                'GlobalExceptionFilter',
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.path} - ${status}`,
                'GlobalExceptionFilter',
            );
        }

        response.status(status).json(errorResponse);
    }
}
