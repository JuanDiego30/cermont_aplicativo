/**
 * @file exception.types.ts
 * @description Tipos para manejo de excepciones - sin 'any'
 *
 * Incluye type guards para identificación segura de tipos de excepciones
 */

import { HttpStatus } from '@nestjs/common';

/**
 * Estructura de respuesta de HttpException de NestJS
 */
export interface HttpExceptionResponse {
    readonly statusCode?: number;
    readonly message?: string | string[];
    readonly error?: string;
}

/**
 * Respuesta extendida con errores de validación
 */
export interface ValidationExceptionResponse extends HttpExceptionResponse {
    readonly errors?: Array<{
        field: string;
        message: string;
    }>;
}

/**
 * Metadata de error de Prisma
 */
export interface PrismaErrorMeta {
    readonly target?: readonly string[];
    readonly field_name?: string;
    readonly model_name?: string;
    readonly argument_name?: string;
    readonly relation_name?: string;
}

/**
 * Códigos de error conocidos de Prisma
 */
export type PrismaErrorCode =
    | 'P2000' // Value too long
    | 'P2001' // Record not found in where condition
    | 'P2002' // Unique constraint violation
    | 'P2003' // Foreign key constraint violation
    | 'P2004' // Constraint violation on database
    | 'P2005' // Invalid value stored
    | 'P2006' // Invalid value for column type
    | 'P2007' // Data validation error
    | 'P2008' // Failed to parse query
    | 'P2009' // Failed to validate query
    | 'P2010' // Raw query failed
    | 'P2011' // Null constraint violation
    | 'P2012' // Missing required value
    | 'P2013' // Missing required argument
    | 'P2014' // Required relation violation
    | 'P2015' // Related record not found
    | 'P2016' // Query interpretation error
    | 'P2017' // Records not connected
    | 'P2018' // Required connected records not found
    | 'P2019' // Input error
    | 'P2020' // Value out of range
    | 'P2021' // Table does not exist
    | 'P2022' // Column does not exist
    | 'P2023' // Inconsistent column data
    | 'P2024' // Timeout waiting for connection pool
    | 'P2025' // Record not found
    | 'P2026' // Feature not supported
    | 'P2027' // Multiple errors
    | 'P2028' // Transaction API error
    | 'P2030' // Fulltext index not found
    | 'P2031' // Need Prisma to be configured for replica
    | 'P2033' // Number outside 64-bit range
    | 'P2034'; // Transaction failed due to conflict

/**
 * Configuración de mapeo de error Prisma a HTTP
 */
export interface PrismaErrorMapping {
    readonly status: HttpStatus;
    readonly message: string;
    readonly logLevel?: 'warn' | 'error' | 'debug';
}

/**
 * Respuesta estructurada de error Prisma
 */
export interface PrismaErrorResponse {
    readonly statusCode: number;
    readonly message: string;
    readonly error: string;
    readonly code: string;
    readonly timestamp: string;
    readonly path: string;
    readonly field?: string;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Verifica si un valor es un objeto plano
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Verifica si es una respuesta de HttpException
 */
export function isHttpExceptionResponse(value: unknown): value is HttpExceptionResponse {
    if (!isPlainObject(value)) {
        return false;
    }
    
    // Debe tener al menos message o statusCode
    const hasMessage = 'message' in value && (
        typeof value.message === 'string' || 
        Array.isArray(value.message)
    );
    const hasStatusCode = 'statusCode' in value && typeof value.statusCode === 'number';
    
    return hasMessage || hasStatusCode;
}

/**
 * Verifica si es una respuesta de validación
 */
export function isValidationExceptionResponse(value: unknown): value is ValidationExceptionResponse {
    if (!isHttpExceptionResponse(value)) {
        return false;
    }
    
    if ('errors' in value && value.errors !== undefined) {
        if (!Array.isArray(value.errors)) {
            return false;
        }
        return value.errors.every(
            (err) =>
                isPlainObject(err) &&
                typeof err.field === 'string' &&
                typeof err.message === 'string',
        );
    }
    
    return true;
}

/**
 * Verifica si es un código de error Prisma conocido
 */
export function isPrismaErrorCode(code: string): code is PrismaErrorCode {
    return /^P2\d{3}$/.test(code);
}

/**
 * Verifica si tiene metadata de Prisma válida
 */
export function isPrismaErrorMeta(value: unknown): value is PrismaErrorMeta {
    if (!isPlainObject(value)) {
        return false;
    }
    
    // Verificar propiedades opcionales con tipos correctos
    if ('target' in value && !Array.isArray(value.target)) {
        return false;
    }
    if ('field_name' in value && typeof value.field_name !== 'string') {
        return false;
    }
    if ('model_name' in value && typeof value.model_name !== 'string') {
        return false;
    }
    
    return true;
}

/**
 * Extrae mensaje de una respuesta de excepción
 */
export function extractExceptionMessage(
    exceptionResponse: string | HttpExceptionResponse,
): string {
    if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
    }
    
    if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
    }
    
    return exceptionResponse.message ?? 'Error desconocido';
}

/**
 * Obtiene nombre del error HTTP por status code
 */
export function getHttpErrorName(status: HttpStatus): string {
    const errorNames: Record<number, string> = {
        [HttpStatus.BAD_REQUEST]: 'Bad Request',
        [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
        [HttpStatus.FORBIDDEN]: 'Forbidden',
        [HttpStatus.NOT_FOUND]: 'Not Found',
        [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
        [HttpStatus.CONFLICT]: 'Conflict',
        [HttpStatus.GONE]: 'Gone',
        [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
        [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
        [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
        [HttpStatus.NOT_IMPLEMENTED]: 'Not Implemented',
        [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
        [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
        [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
    };
    
    return errorNames[status] ?? 'Error';
}
