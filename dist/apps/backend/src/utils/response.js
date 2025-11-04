import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from './constants';
import { logUserAction } from './logger';
export const successResponse = (res, data = null, message = ERROR_MESSAGES.SUCCESS, statusCode = HTTP_STATUS.OK, meta = {}) => {
    const response = {
        success: true,
        message,
        data: data || undefined,
        timestamp: new Date().toISOString(),
    };
    if (meta.pagination) {
        response.pagination = meta.pagination;
        delete meta.pagination;
    }
    if (Object.keys(meta).length > 0) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
};
export const errorResponse = (res, message = ERROR_MESSAGES.INTERNAL_ERROR, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = [], code = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        error: {
            code: code || null,
            details: details.length > 0 ? details : undefined,
            message: details.length > 0 ? undefined : message,
        },
    };
    if (code) {
        response.errorCode = code;
    }
    if (process.env.NODE_ENV === 'development' && details.length > 0 && details[0].value instanceof Error) {
        response.stack = details[0].value.stack;
    }
    if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        logUserAction('system', 'CRITICAL_ERROR_RESPONSE', { statusCode, message, code });
    }
    return res.status(statusCode).json(response);
};
export const validationErrorResponse = (res, details = []) => errorResponse(res, ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY, details, ERROR_CODES.VALIDATION_ERROR);
export const notFoundResponse = (res, resource = 'Resource') => errorResponse(res, `${resource} not found`, HTTP_STATUS.NOT_FOUND, [], ERROR_CODES.NOT_FOUND);
export const unauthorizedResponse = (res, message = ERROR_MESSAGES.UNAUTHORIZED) => errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED, [], ERROR_CODES.AUTHENTICATION_ERROR);
export const forbiddenResponse = (res, message = ERROR_MESSAGES.FORBIDDEN) => errorResponse(res, message, HTTP_STATUS.FORBIDDEN, [], ERROR_CODES.AUTHORIZATION_ERROR);
export const conflictResponse = (res, message = ERROR_MESSAGES.CONFLICT) => errorResponse(res, message, HTTP_STATUS.CONFLICT, [], ERROR_CODES.CONFLICT_ERROR);
export const rateLimitResponse = (res, retryAfter = 900) => {
    res.set('Retry-After', String(retryAfter));
    return errorResponse(res, ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS, [], ERROR_CODES.RATE_LIMIT_ERROR);
};
export const createdResponse = (res, data, message = ERROR_MESSAGES.CREATED_SUCCESS) => successResponse(res, data, message, HTTP_STATUS.CREATED);
export const noContentResponse = (res) => res.status(HTTP_STATUS.NO_CONTENT).send();
export const paginatedResponse = (res, data, pagination, message = ERROR_MESSAGES.SUCCESS) => {
    const page = 'page' in pagination ? pagination.page : 1;
    const limit = pagination.limit;
    const total = 'total' in pagination ? pagination.total : undefined;
    const totalPages = total ? Math.ceil(total / limit) : undefined;
    const hasNextPage = 'hasMore' in pagination ? pagination.hasMore : page < totalPages;
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
export const formatMongooseErrors = (error) => {
    if (error.name === 'ValidationError') {
        return Object.values(error.errors).map((err) => ({
            field: err.path,
            message: err.message,
            value: err.value,
            type: err.kind,
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
    return [{
            message: error.message,
            type: error.name,
        }];
};
export const formatJoiErrors = (error) => {
    if (!error || !error.details)
        return [{ message: 'Validation failed' }];
    return error.details.map((detail) => ({
        field: Array.isArray(detail.path) ? detail.path.join('.') : String(detail.path),
        message: detail.message,
        type: detail.type,
        value: detail.context?.value,
    }));
};
export const formatAppError = (appError) => {
    if (Array.isArray(appError.details)) {
        return appError.details.map((detail) => typeof detail === 'string' ? { message: detail } : detail);
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
//# sourceMappingURL=response.js.map