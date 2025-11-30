/**
 * API Response Helpers
 * 
 * Utilidades para generar respuestas HTTP consistentes según RFC 7807.
 * 
 * @see https://www.rfc-editor.org/rfc/rfc7807
 */

import type { Response } from 'express';

// ============================================
// Types
// ============================================

/**
 * RFC 7807 Problem Details structure
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  [key: string]: unknown; // Extension members
}

/**
 * Success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Error Response Helpers
// ============================================

/**
 * Creates a RFC 7807 Problem Details object
 */
export function createProblemDetails(
  status: number,
  title: string,
  detail: string,
  instance?: string,
  extensions?: Record<string, unknown>
): ProblemDetails {
  return {
    type: `https://httpstatuses.com/${status}`,
    title,
    status,
    detail,
    ...(instance && { instance }),
    ...extensions,
  };
}

/**
 * Sends a 400 Bad Request response
 */
export function sendBadRequest(
  res: Response,
  detail: string,
  extensions?: Record<string, unknown>
): void {
  const problem = createProblemDetails(400, 'Bad Request', detail, undefined, extensions);
  res.status(400).json(problem);
}

/**
 * Sends a 401 Unauthorized response
 */
export function sendUnauthorized(
  res: Response,
  detail = 'Autenticación requerida'
): void {
  const problem = createProblemDetails(401, 'Unauthorized', detail);
  res.status(401).json(problem);
}

/**
 * Sends a 403 Forbidden response
 */
export function sendForbidden(
  res: Response,
  detail = 'No tiene permisos para realizar esta acción'
): void {
  const problem = createProblemDetails(403, 'Forbidden', detail);
  res.status(403).json(problem);
}

/**
 * Sends a 404 Not Found response
 */
export function sendNotFound(
  res: Response,
  resource?: string,
  id?: string
): void {
  const detail = resource
    ? `${resource}${id ? ` con ID ${id}` : ''} no encontrado`
    : 'Recurso no encontrado';
  const problem = createProblemDetails(404, 'Not Found', detail);
  res.status(404).json(problem);
}

/**
 * Sends a 409 Conflict response
 */
export function sendConflict(
  res: Response,
  detail: string
): void {
  const problem = createProblemDetails(409, 'Conflict', detail);
  res.status(409).json(problem);
}

/**
 * Sends a 422 Unprocessable Entity response
 */
export function sendUnprocessable(
  res: Response,
  detail: string,
  errors?: Record<string, string>
): void {
  const problem = createProblemDetails(
    422,
    'Unprocessable Entity',
    detail,
    undefined,
    errors ? { errors } : undefined
  );
  res.status(422).json(problem);
}

/**
 * Sends a 500 Internal Server Error response
 */
export function sendInternalError(
  res: Response,
  detail = 'Ha ocurrido un error interno del servidor'
): void {
  const problem = createProblemDetails(500, 'Internal Server Error', detail);
  res.status(500).json(problem);
}

// ============================================
// Success Response Helpers
// ============================================

/**
 * Sends a success response with data
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  message?: string
): void {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  res.status(status).json(response);
}

/**
 * Sends a 201 Created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message?: string
): void {
  sendSuccess(res, data, 201, message);
}

/**
 * Sends a 204 No Content response
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Sends a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): void {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  res.json(response);
}

// ============================================
// Export Convenience Object
// ============================================

/**
 * Convenience object with all response helpers
 */
export const apiResponse = {
  // Errors
  badRequest: sendBadRequest,
  unauthorized: sendUnauthorized,
  forbidden: sendForbidden,
  notFound: sendNotFound,
  conflict: sendConflict,
  unprocessable: sendUnprocessable,
  internalError: sendInternalError,
  
  // Success
  success: sendSuccess,
  created: sendCreated,
  noContent: sendNoContent,
  paginated: sendPaginated,
  
  // Factory
  problem: createProblemDetails,
};
