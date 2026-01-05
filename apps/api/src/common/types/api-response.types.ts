/**
 * @file api-response.types.ts
 * @description Tipos estrictos para respuestas API - 100% type-safe, sin 'any'
 *
 * Principios:
 * - Eliminación total de 'any'
 * - Propiedades readonly para inmutabilidad
 * - Type guards para validación en runtime
 * - Compatibilidad con Swagger/OpenAPI
 */

/**
 * Metadata de paginación
 */
export interface PaginationMeta {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/**
 * Detalles de error HTTP estructurado
 */
export interface HttpErrorDetails {
  readonly statusCode: number;
  readonly message: string;
  readonly error?: string;
  readonly code?: string;
  readonly timestamp: string;
  readonly path: string;
}

/**
 * Error de validación individual
 */
export interface ValidationErrorItem {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Respuesta exitosa genérica
 */
export interface SuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message?: string;
  readonly timestamp?: string;
}

/**
 * Respuesta de error estructurada
 */
export interface ErrorResponse {
  readonly success: false;
  readonly statusCode: number;
  readonly message: string;
  readonly error?: string;
  readonly code?: string;
  readonly errors?: readonly ValidationErrorItem[];
  readonly timestamp: string;
  readonly path: string;
}

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  readonly success: true;
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

/**
 * Respuesta de operación simple (create/update/delete)
 */
export interface OperationResult {
  readonly success: boolean;
  readonly message: string;
  readonly id?: string | number;
}

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Verifica si un valor es un objeto plano
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Verifica si es una respuesta exitosa
 */
export function isSuccessResponse<T>(
  response: unknown,
): response is SuccessResponse<T> {
  return (
    isPlainObject(response) &&
    response["success"] === true &&
    "data" in response
  );
}

/**
 * Verifica si es una respuesta de error
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    isPlainObject(response) &&
    response["success"] === false &&
    typeof response["statusCode"] === "number" &&
    typeof response["message"] === "string"
  );
}

/**
 * Verifica si es una respuesta paginada
 */
export function isPaginatedResponse<T>(
  response: unknown,
): response is PaginatedResponse<T> {
  return (
    isPlainObject(response) &&
    response["success"] === true &&
    Array.isArray(response["data"]) &&
    isPlainObject(response["meta"]) &&
    typeof (response["meta"] as Record<string, unknown>)["total"] === "number"
  );
}

/**
 * Verifica si es un error de validación
 */
export function isValidationErrorItem(
  value: unknown,
): value is ValidationErrorItem {
  return (
    isPlainObject(value) &&
    typeof value["field"] === "string" &&
    typeof value["message"] === "string"
  );
}

/**
 * Verifica si es array de errores de validación
 */
export function isValidationErrorArray(
  value: unknown,
): value is ValidationErrorItem[] {
  return Array.isArray(value) && value.every(isValidationErrorItem);
}

// =====================================================
// FACTORY FUNCTIONS
// =====================================================

/**
 * Crea metadata de paginación
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Crea respuesta de error
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  path: string,
  options?: {
    error?: string;
    code?: string;
    errors?: ValidationErrorItem[];
  },
): ErrorResponse {
  return {
    success: false,
    statusCode,
    message,
    error: options?.error,
    code: options?.code,
    errors: options?.errors,
    timestamp: new Date().toISOString(),
    path,
  };
}

/**
 * Crea respuesta exitosa
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Crea respuesta paginada
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    meta: createPaginationMeta(total, page, limit),
  };
}
