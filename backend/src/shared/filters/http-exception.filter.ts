import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'Error';
    let errors: unknown = undefined;

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as { message?: string }).message || exception.message;
      errors = (exceptionResponse as { errors?: unknown }).errors;
    } else {
      message = String(exceptionResponse);
    }

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${message}`,
      exception.stack
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
