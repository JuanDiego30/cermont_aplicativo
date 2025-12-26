import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let errors: any = undefined;

        // HTTP Exception
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || exception.message;
                errors = (exceptionResponse as any).errors;
            } else {
                message = String(exceptionResponse);
            }
        }
        // Prisma Exceptions (check by name since instanceof may not work with generated client)
        else if (exception instanceof Error) {
            const errorName = exception.constructor.name;

            if (errorName === 'PrismaClientKnownRequestError') {
                status = HttpStatus.BAD_REQUEST;
                const prismaError = exception as any;

                switch (prismaError.code) {
                    case 'P2002':
                        message = 'Ya existe un registro con estos datos únicos';
                        errors = {
                            field: prismaError.meta?.target,
                            constraint: 'unique_violation'
                        };
                        break;
                    case 'P2025':
                        status = HttpStatus.NOT_FOUND;
                        message = 'Registro no encontrado';
                        break;
                    case 'P2003':
                        message = 'Violación de restricción de clave foránea';
                        break;
                    default:
                        message = 'Error en la base de datos';
                }
            } else if (errorName === 'PrismaClientValidationError') {
                status = HttpStatus.BAD_REQUEST;
                message = 'Error de validación en los datos';
            } else {
                // Generic Error
                message = exception.message;
            }
        }

        // Log del error
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status}`,
            exception instanceof Error ? exception.stack : String(exception)
        );

        // Respuesta estructurada
        response.status(status).json({
            success: false,
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        });
    }
}
