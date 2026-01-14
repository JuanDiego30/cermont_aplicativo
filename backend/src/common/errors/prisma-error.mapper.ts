/**
 * @file prisma-error.mapper.ts
 * @description Mapper centralizado de errores Prisma a HTTP
 *
 * Principio SRP: Separación de responsabilidades
 * - El filter captura la excepción
 * - El mapper traduce el código Prisma a HTTP
 */

import { HttpStatus } from "@nestjs/common";
import type {
  PrismaErrorCode,
  PrismaErrorMapping,
  PrismaErrorMeta,
  PrismaErrorResponse,
} from "../types/exception.types";
import { getHttpErrorName, isPrismaErrorMeta } from "../types/exception.types";
import { ErrorCodes } from "./error-codes";

/**
 * Mapeo de códigos Prisma a respuestas HTTP
 */
const PRISMA_ERROR_MAP: Record<PrismaErrorCode, PrismaErrorMapping> = {
  // Value too long for column
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: "El valor es demasiado largo para el campo",
    logLevel: "warn",
    appCode: ErrorCodes.VALIDATION_ERROR,
  },
  // Record not found in where condition
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: "Registro no encontrado en la condición de búsqueda",
    logLevel: "debug",
    appCode: ErrorCodes.ENTITY_NOT_FOUND,
  },
  // Unique constraint violation
  P2002: {
    status: HttpStatus.CONFLICT,
    message: "El registro ya existe (violación de unicidad)",
    logLevel: "warn",
    appCode: ErrorCodes.DUPLICATE_ENTITY,
  },
  // Foreign key constraint violation
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: "Referencia a registro inexistente",
    logLevel: "warn",
  },
  // Constraint violation on database
  P2004: {
    status: HttpStatus.BAD_REQUEST,
    message: "Violación de constraint en base de datos",
    logLevel: "warn",
  },
  // Invalid value stored
  P2005: {
    status: HttpStatus.BAD_REQUEST,
    message: "Valor almacenado inválido",
    logLevel: "warn",
  },
  // Invalid value for column type
  P2006: {
    status: HttpStatus.BAD_REQUEST,
    message: "Valor inválido para el tipo de campo",
    logLevel: "warn",
  },
  // Data validation error
  P2007: {
    status: HttpStatus.BAD_REQUEST,
    message: "Error de validación de datos",
    logLevel: "warn",
  },
  // Failed to parse query
  P2008: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Error al parsear la consulta",
    logLevel: "error",
  },
  // Failed to validate query
  P2009: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Error al validar la consulta",
    logLevel: "error",
  },
  // Raw query failed
  P2010: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Error en consulta SQL",
    logLevel: "error",
  },
  // Null constraint violation
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    message: "Campo requerido no puede ser nulo",
    logLevel: "warn",
  },
  // Missing required value
  P2012: {
    status: HttpStatus.BAD_REQUEST,
    message: "Campo requerido faltante",
    logLevel: "warn",
  },
  // Missing required argument
  P2013: {
    status: HttpStatus.BAD_REQUEST,
    message: "Argumento requerido faltante",
    logLevel: "warn",
  },
  // Required relation violation
  P2014: {
    status: HttpStatus.BAD_REQUEST,
    message: "Violación de relación requerida",
    logLevel: "warn",
  },
  // Related record not found
  P2015: {
    status: HttpStatus.NOT_FOUND,
    message: "Registro relacionado no encontrado",
    logLevel: "debug",
  },
  // Query interpretation error
  P2016: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Error de interpretación de consulta",
    logLevel: "error",
  },
  // Records not connected
  P2017: {
    status: HttpStatus.BAD_REQUEST,
    message: "Registros no conectados",
    logLevel: "warn",
  },
  // Required connected records not found
  P2018: {
    status: HttpStatus.NOT_FOUND,
    message: "Registros conectados requeridos no encontrados",
    logLevel: "debug",
  },
  // Input error
  P2019: {
    status: HttpStatus.BAD_REQUEST,
    message: "Error de entrada",
    logLevel: "warn",
  },
  // Value out of range
  P2020: {
    status: HttpStatus.BAD_REQUEST,
    message: "Valor fuera de rango",
    logLevel: "warn",
  },
  // Table does not exist
  P2021: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Tabla no existe",
    logLevel: "error",
  },
  // Column does not exist
  P2022: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Columna no existe",
    logLevel: "error",
  },
  // Inconsistent column data
  P2023: {
    status: HttpStatus.BAD_REQUEST,
    message: "Datos de columna inconsistentes",
    logLevel: "warn",
  },
  // Timeout waiting for connection pool
  P2024: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: "Timeout de conexión a base de datos",
    logLevel: "error",
  },
  // Record not found
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: "Registro no encontrado",
    logLevel: "debug",
    appCode: ErrorCodes.ENTITY_NOT_FOUND,
  },
  // Feature not supported
  P2026: {
    status: HttpStatus.NOT_IMPLEMENTED,
    message: "Funcionalidad no soportada",
    logLevel: "warn",
  },
  // Multiple errors
  P2027: {
    status: HttpStatus.BAD_REQUEST,
    message: "Múltiples errores en la operación",
    logLevel: "warn",
  },
  // Transaction API error
  P2028: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Error en transacción",
    logLevel: "error",
  },
  // Fulltext index not found
  P2030: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Índice fulltext no encontrado",
    logLevel: "error",
  },
  // Need Prisma to be configured for replica
  P2031: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Configuración de réplica requerida",
    logLevel: "error",
  },
  // Number outside 64-bit range
  P2033: {
    status: HttpStatus.BAD_REQUEST,
    message: "Número fuera del rango de 64 bits",
    logLevel: "warn",
  },
  // Transaction failed due to conflict
  P2034: {
    status: HttpStatus.CONFLICT,
    message: "Transacción fallida por conflicto",
    logLevel: "warn",
  },
};

/**
 * Mapping por defecto para códigos desconocidos
 */
const DEFAULT_ERROR_MAPPING: PrismaErrorMapping = {
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  message: "Error de base de datos",
  logLevel: "error",
};

/**
 * Clase PrismaErrorMapper
 *
 * Responsabilidad única: mapear errores de Prisma a respuestas HTTP
 */
export class PrismaErrorMapper {
  /**
   * Obtiene el mapping para un código de error Prisma
   */
  static getMapping(code: string): PrismaErrorMapping {
    return PRISMA_ERROR_MAP[code as PrismaErrorCode] ?? DEFAULT_ERROR_MAPPING;
  }

  /**
   * Extrae información del campo afectado desde metadata
   */
  static extractFieldInfo(meta: unknown): string | undefined {
    if (!isPrismaErrorMeta(meta)) {
      return undefined;
    }

    const typedMeta = meta as PrismaErrorMeta;

    if (typedMeta.target && typedMeta.target.length > 0) {
      return typedMeta.target.join(", ");
    }

    return typedMeta.field_name;
  }

  /**
   * Construye mensaje de error enriquecido con info del campo
   */
  static buildMessage(baseMessage: string, meta: unknown): string {
    const fieldInfo = this.extractFieldInfo(meta);

    if (fieldInfo) {
      return `${baseMessage} (campo: ${fieldInfo})`;
    }

    return baseMessage;
  }

  /**
   * Mapea un error Prisma a respuesta HTTP estructurada
   */
  static toHttpResponse(
    code: string,
    meta: unknown,
    path: string,
  ): PrismaErrorResponse {
    const mapping = this.getMapping(code);
    const message = this.buildMessage(mapping.message, meta);
    const field = this.extractFieldInfo(meta);

    return {
      statusCode: mapping.status,
      message,
      error: getHttpErrorName(mapping.status),
      code: mapping.appCode ?? code,
      timestamp: new Date().toISOString(),
      path,
      field,
    };
  }

  /**
   * Determina si el error debe ser logueado como error crítico
   */
  static isCriticalError(code: string): boolean {
    const mapping = this.getMapping(code);
    return mapping.logLevel === "error";
  }

  /**
   * Obtiene el nivel de log recomendado para el código
   */
  static getLogLevel(code: string): "warn" | "error" | "debug" {
    return this.getMapping(code).logLevel ?? "warn";
  }
}
