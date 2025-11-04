/**
 * Response Utility (TypeScript - November 2025)
 * @description Helpers estandarizados para respuestas HTTP en CERMONT ATG: successResponse (success:true, data, message, timestamp, meta.pagination/top-level), errorResponse (success:false, message, timestamp, error { code, details: array, message }), specialized (notFound, unauthorized, etc.). Pagination: Aligns with autoPaginate metadata (cursor/offset compatible). Formatters: formatMongooseErrors (ValidationError/dupe key), formatJoiErrors (details array). Secure: No stack/prod, sanitize data? (integrate sanitizer), consistent AppError shape { statusCode, code, status, details }. Constants: HTTP_STATUS imported from constants.ts.
 * Uso: import { successResponse, errorResponse, paginatedResponse } from '../utils/response.ts'; En controller: return successResponse(res, { id: newOrder._id }, 'Order created', HTTP_STATUS.CREATED); Para error: return errorResponse(res, 'Invalid input', HTTP_STATUS.BAD_REQUEST, formatJoiErrors(validationError), ERROR_CODES.VALIDATION_ERROR); Para paginación: const { docs, pagination } = await autoPaginate(...); return paginatedResponse(res, docs, pagination); (auto meta).
 * Integra con: errorHandler.ts (global: errorResponse con AppError), constants.ts (HTTP_STATUS, ERROR_CODES), validation (Joi: formatJoiErrors en validationMiddleware), pagination.ts (meta.pagination), logger (log on errorResponse critical). Performance: Inline, no overhead. Secure: Prod no stack/expose internals, details array no PII (sanitize en formatters), rateLimitResponse (429 + header Retry-After).
 * Extensible: Add corsResponse (pre-flight), downloadResponse (file stream), websocketResponse (no HTTP). Types: SuccessResponse, ErrorResponse, ErrorDetails, PaginationMeta. Fixes: Typed Response, any → unknown/Record, parseInt safe (Number/NaN handle), paginatedResponse uses successResponse, noContent 204 no body.
 * Integrate: En asyncHandler: } catch (err) { if (err instanceof AppError) { return errorResponse(res, err.message, err.statusCode, err.details || [], err.code); } return errorResponse(res, 'Internal error', HTTP_STATUS.INTERNAL_SERVER_ERROR, [], ERROR_CODES.INTERNAL_ERROR); } En routes: app.get('/orders', authMiddleware, asyncHandler(async (req, res) => { const { docs, pagination } = await autoPaginate(Order, req.filters, req.pagination); return paginatedResponse(res, docs, pagination); })); En validationMiddleware: const errors = formatJoiErrors(validationError); return validationErrorResponse(res, errors);
 * Missing: Sanitizer: export const sanitizeResponseData = <T>(data: T): T => { if (Array.isArray(data)) return data.map(sanitizeResponseData); if (data && typeof data === 'object') { const sanitized = { ...data }; ['password', 'token', 'email'].forEach(key => { if (key in sanitized) sanitized[key as keyof T] = '[REDACTED]'; }); return sanitized; } return data; }; En successResponse: data: sanitizeResponseData(data). Download: export const downloadResponse = (res: Response, filename: string, data: Buffer | string, contentType: string = 'application/octet-stream') => { res.set({ 'Content-Type': contentType, 'Content-Disposition': `attachment; filename="${filename}"` }).send(data); }; Tests: __tests__/utils/response.spec.ts (mock res, test shapes, formatters).
 * Usage: npm run build (tsc utils/response.ts), import { type SuccessResponse } from '../utils/response.ts'. Barrel: utils/index.ts export * from './response.ts'; export type { SuccessResponse, ErrorResponse } from './response.ts'.
 */

import { Response } from 'express';
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import { AppError } from './errorHandler';
import { logUserAction } from './logger'; // Optional log on critical errors
import type { CursorPaginationMetadata, OffsetPaginationMetadata } from './pagination';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
  timestamp: string;
  pagination?: CursorPaginationMetadata | OffsetPaginationMetadata;
  meta?: Record<string, unknown>;
}

export interface ErrorDetails {
  field?: string;
  message: string;
  value?: unknown;
  type?: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  timestamp: string;
  errorCode?: string;
  error: {
    message?: string;
    code?: string | null;
    details?: ErrorDetails[];
  };
  stack?: string; // Dev only
}

export type ResponseShape = SuccessResponse | ErrorResponse;

// ============================================================================
// CORE RESPONSE HELPERS
// ============================================================================

/**
 * Respuesta exitosa estándar
 * @param res - Response de Express
 * @param data - Datos (sanitized if needed)
 * @param message - Mensaje
 * @param statusCode - HTTP status
 * @param meta - Metadata (pagination top-level)
 * @returns Response sent
 */
export const successResponse = <T>(
  res: Response,
  data: T | null = null,
  message: string = ERROR_MESSAGES.SUCCESS,
  statusCode: number = HTTP_STATUS.OK,
  meta: { pagination?: any; [key: string]: unknown } = {}
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data: data || undefined,
    timestamp: new Date().toISOString(),
  };

  // Pagination top-level for compatibility
  if (meta.pagination) {
    response.pagination = meta.pagination;
    delete meta.pagination; // Move to top
  }

  // Rest to meta
  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar (AppError compatible)
 * @param res - Response
 * @param message - Mensaje
 * @param statusCode - Status
 * @param details - ErrorDetails array
 * @param code - Error code
 * @returns Response sent
 */
export const errorResponse = (
  res: Response,
  message: string = ERROR_MESSAGES.INTERNAL_ERROR,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details: ErrorDetails[] = [],
  code: string | null = null
): Response => {
  const response: ErrorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    error: {
      code: code || null,
      details: details.length > 0 ? details : undefined,
      message: details.length > 0 ? undefined : message, // Nested if details
    },
  };

  if (code) {
    response.errorCode = code; // Top-level compat
  }

  // Dev stack (first error)
  if (process.env.NODE_ENV === 'development' && details.length > 0 && details[0].value instanceof Error) {
    response.stack = (details[0].value as Error).stack;
  }

  // Log critical (500+)
  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logUserAction('system', 'CRITICAL_ERROR_RESPONSE', { statusCode, message, code });
  }

  return res.status(statusCode).json(response);
};

// ============================================================================
// SPECIALIZED ERROR RESPONSES
// ============================================================================

/**
 * Respuesta de validación fallida
 */
export const validationErrorResponse = (res: Response, details: ErrorDetails[] = []): Response =>
  errorResponse(res, ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY, details, ERROR_CODES.VALIDATION_ERROR);

/**
 * Respuesta de recurso no encontrado
 */
export const notFoundResponse = (res: Response, resource: string = 'Resource'): Response =>
  errorResponse(res, `${resource} not found`, HTTP_STATUS.NOT_FOUND, [], ERROR_CODES.NOT_FOUND);

/**
 * Respuesta de no autorizado
 */
export const unauthorizedResponse = (res: Response, message: string = ERROR_MESSAGES.UNAUTHORIZED): Response =>
  errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED, [], ERROR_CODES.AUTHENTICATION_ERROR);

/**
 * Respuesta de prohibido
 */
export const forbiddenResponse = (res: Response, message: string = ERROR_MESSAGES.FORBIDDEN): Response =>
  errorResponse(res, message, HTTP_STATUS.FORBIDDEN, [], ERROR_CODES.AUTHORIZATION_ERROR);

/**
 * Respuesta de conflicto
 */
export const conflictResponse = (res: Response, message: string = ERROR_MESSAGES.CONFLICT): Response =>
  errorResponse(res, message, HTTP_STATUS.CONFLICT, [], ERROR_CODES.CONFLICT_ERROR);

/**
 * Respuesta de rate limit
 */
export const rateLimitResponse = (res: Response, retryAfter: number = 900): Response => {
  res.set('Retry-After', String(retryAfter)); // Seconds
  return errorResponse(res, ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS, [], ERROR_CODES.RATE_LIMIT_ERROR);
};

// ============================================================================
// SUCCESS SPECIALIZED
// ============================================================================

/**
 * Respuesta de creación
 */
export const createdResponse = (res: Response, data: unknown, message: string = ERROR_MESSAGES.CREATED_SUCCESS): Response =>
  successResponse(res, data, message, HTTP_STATUS.CREATED);

/**
 * Respuesta sin contenido (DELETE)
 */
export const noContentResponse = (res: Response): Response => res.status(HTTP_STATUS.NO_CONTENT).send();

/**
 * Respuesta paginada (compatible cursor/offset)
 * @param res - Response
 * @param data - Docs array
 * @param pagination - From autoPaginate (CursorPaginationMetadata | OffsetPaginationMetadata)
 * @param message - Message
 * @returns Response with pagination meta
 */
export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: CursorPaginationMetadata | OffsetPaginationMetadata,
  message: string = ERROR_MESSAGES.SUCCESS
): Response => {
  const page = 'page' in pagination ? pagination.page : 1;
  const limit = pagination.limit;
  const total = 'total' in pagination ? pagination.total : undefined;
  const totalPages = total ? Math.ceil(total / limit) : undefined;
  const hasNextPage = 'hasMore' in pagination ? pagination.hasMore : page < totalPages!;
  const hasPrevPage = page > 1;
  const nextCursor = 'nextCursor' in pagination ? pagination.nextCursor : undefined;
  const cursor = 'cursor' in pagination ? pagination.cursor : null;

  const metaPagination = {
    ...pagination,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextCursor,
    cursor,
  };

  return successResponse(res, data, message, HTTP_STATUS.OK, { pagination: metaPagination });
};

// ============================================================================
// ERROR FORMATTERS
// ============================================================================

/**
 * Formatea errores de Mongoose (ValidationError, 11000 dupe)
 * @param error - MongooseError
 * @returns ErrorDetails[]
 */
export const formatMongooseErrors = (error: any): ErrorDetails[] => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map((err: any): ErrorDetails => ({
      field: err.path,
      message: err.message,
      value: err.value,
      type: err.kind, // required, minlength, etc.
    }));
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'unknown';
    return [{
      field,
      message: `${field} already exists`,
      value: error.keyValue?.[field],
      type: 'duplicate_key',
    }];
  }

  // CastError, etc.
  return [{
    message: error.message,
    type: error.name,
  }];
};

/**
 * Formatea errores de Joi/Zod
 * @param error - Joi Error object
 * @returns ErrorDetails[]
 */
export const formatJoiErrors = (error: any): ErrorDetails[] => {
  if (!error || !error.details) return [{ message: 'Validation failed' }];
  return error.details.map((detail: any): ErrorDetails => ({
    field: Array.isArray(detail.path) ? detail.path.join('.') : String(detail.path),
    message: detail.message,
    type: detail.type,
    value: detail.context?.value,
  }));
};

/**
 * Convierte AppError a ErrorDetails array
 * @param appError - AppError instance
 * @returns ErrorDetails[]
 */
export const formatAppError = (appError: AppError): ErrorDetails[] => {
  if (Array.isArray(appError.details)) {
    return appError.details.map((detail: any) => typeof detail === 'string' ? { message: detail } : detail);
  }
  return [{ message: appError.message, field: 'general', code: appError.code }];
};

export default {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  rateLimitResponse,
  createdResponse,
  noContentResponse,
  paginatedResponse,
  formatMongooseErrors,
  formatJoiErrors,
  formatAppError,
};
