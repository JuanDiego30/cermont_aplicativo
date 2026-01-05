import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Response, Request } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Error interno del servidor";
    let errors: unknown = undefined;

    // HTTP Exception
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "object") {
        message =
          (exceptionResponse as { message?: string }).message ||
          exception.message;
        errors = (exceptionResponse as { errors?: unknown }).errors;
      } else {
        message = String(exceptionResponse);
      }
    }
    // Prisma Known Request Error (check by code property)
    else if (this.isPrismaKnownError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      const prismaError = exception as {
        code: string;
        meta?: { target?: unknown };
      };

      switch (prismaError.code) {
        case "P2002":
          message = "Ya existe un registro con estos datos únicos";
          errors = {
            field: prismaError.meta?.target,
            constraint: "unique_violation",
          };
          break;
        case "P2025":
          status = HttpStatus.NOT_FOUND;
          message = "Registro no encontrado";
          break;
        case "P2003":
          message = "Violación de restricción de clave foránea";
          break;
        default:
          message = "Error en la base de datos";
      }
    }
    // Prisma Validation Error
    else if (this.isPrismaValidationError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      message = "Error de validación en los datos";
    }
    // Unknown Error
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : String(exception),
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

  private isPrismaKnownError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as { code: unknown }).code === "string" &&
      (error as { code: string }).code.startsWith("P")
    );
  }

  private isPrismaValidationError(error: unknown): boolean {
    return (
      typeof error === "object" &&
      error !== null &&
      error.constructor?.name === "PrismaClientValidationError"
    );
  }
}
