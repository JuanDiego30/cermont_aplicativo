/**
 * @filter PrismaExceptionFilters
 *
 * Captura errores de Prisma y los convierte a respuestas HTTP estándar.
 * Usa PrismaErrorMapper para separar responsabilidades (SRP).
 *
 * Incluye 3 filters especializados:
 * - PrismaExceptionFilter: Errores conocidos (P2xxx)
 * - PrismaValidationFilter: Errores de validación de query
 * - PrismaConnectionFilter: Errores de conexión
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response, Request } from "express";
import { PrismaErrorMapper } from "../errors/prisma-error.mapper";
import type { PrismaErrorResponse } from "../types/exception.types";

/**
 * Filter para errores conocidos de Prisma (PrismaClientKnownRequestError)
 *
 * Maneja códigos P2xxx que representan errores de constraints,
 * registros no encontrados, etc.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Usar el mapper para construir la respuesta
    const errorResponse = PrismaErrorMapper.toHttpResponse(
      exception.code,
      exception.meta,
      request.url,
    );

    // Log según nivel de criticidad
    this.logPrismaError(exception, errorResponse, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Registra el error con el nivel apropiado
   */
  private logPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    errorResponse: PrismaErrorResponse,
    request: Request,
  ): void {
    const logContext = {
      code: exception.code,
      path: request.url,
      method: request.method,
      meta: exception.meta,
    };

    const logLevel = PrismaErrorMapper.getLogLevel(exception.code);

    switch (logLevel) {
      case "error":
        this.logger.error(
          `Prisma Error [${exception.code}]: ${exception.message}`,
          exception.stack,
          logContext,
        );
        break;
      case "warn":
        this.logger.warn(
          `Prisma Error [${exception.code}]: ${errorResponse.message}`,
          logContext,
        );
        break;
      case "debug":
      default:
        this.logger.debug(
          `Prisma Error [${exception.code}]: ${errorResponse.message}`,
          logContext,
        );
        break;
    }
  }
}

/**
 * Filter para errores de validación de Prisma (queries malformadas)
 */
@Catch(Prisma.PrismaClientValidationError)
export class PrismaValidationFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaValidationFilter.name);

  catch(
    exception: Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Estos son errores de programación, logueamos como error
    this.logger.error("Prisma Validation Error: Query malformada", {
      message: exception.message,
      path: request.url,
      method: request.method,
    });

    const errorResponse: PrismaErrorResponse = {
      statusCode: HttpStatus.BAD_REQUEST,
      message: "Error de validación en consulta a base de datos",
      error: "Bad Request",
      code: "PRISMA_VALIDATION",
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(HttpStatus.BAD_REQUEST).json(errorResponse);
  }
}

/**
 * Filter para errores de conexión/inicialización de Prisma
 */
@Catch(Prisma.PrismaClientInitializationError)
export class PrismaConnectionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaConnectionFilter.name);

  catch(
    exception: Prisma.PrismaClientInitializationError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Error crítico de infraestructura
    this.logger.error(
      `Prisma Connection Error: ${exception.message}`,
      exception.stack,
      {
        errorCode: exception.errorCode,
        path: request.url,
      },
    );

    const errorResponse: PrismaErrorResponse = {
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      message: "Servicio de base de datos no disponible",
      error: "Service Unavailable",
      code: exception.errorCode ?? "PRISMA_CONNECTION",
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(HttpStatus.SERVICE_UNAVAILABLE).json(errorResponse);
  }
}

/**
 * Filter para errores de timeout/rust panic en Prisma
 */
@Catch(Prisma.PrismaClientRustPanicError)
export class PrismaPanicFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaPanicFilter.name);

  catch(
    exception: Prisma.PrismaClientRustPanicError,
    host: ArgumentsHost,
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Error crítico - requiere atención inmediata
    this.logger.error(`Prisma PANIC: ${exception.message}`, exception.stack, {
      path: request.url,
      method: request.method,
    });

    const errorResponse: PrismaErrorResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Error crítico en el servidor de base de datos",
      error: "Internal Server Error",
      code: "PRISMA_PANIC",
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorResponse);
  }
}
