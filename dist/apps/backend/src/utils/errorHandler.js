import { logger } from './logger';
export class AppError extends Error {
    statusCode;
    code;
    isOperational;
    status;
    details;
    constructor(message, statusCode = 500, details = { code: 'INTERNAL_ERROR' }, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = details.code || 'INTERNAL_ERROR';
        this.isOperational = isOperational;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.details = details;
        Object.defineProperty(this, 'message', { value: message, enumerable: false });
        Error.captureStackTrace(this, this.constructor);
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export const errorHandler = (err, req, res, next) => {
    let customError = err;
    if (!(err instanceof AppError)) {
        customError = new AppError(err.message || 'Error interno del servidor', 500, { code: 'INTERNAL_ERROR' }, false);
    }
    logger.error('Error Handler:', {
        message: customError.message,
        code: customError.code,
        statusCode: customError.statusCode,
        path: req.path,
        method: req.method,
        userId: req.user?._id?.toString() || 'anonymous',
        stack: customError.stack,
        isOperational: customError.isOperational,
    });
    if (err.name === 'CastError') {
        const message = 'Recurso no encontrado - ID inválido';
        customError = new AppError(message, 404, { code: 'INVALID_ID' });
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'unknown';
        const message = `Valor duplicado para el campo: ${field}`;
        customError = new AppError(message, 409, { code: 'DUPLICATE_FIELD' });
    }
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map((val) => val.message || 'Invalid field');
        const message = messages.join(', ');
        customError = new AppError(message, 400, { code: 'VALIDATION_ERROR' });
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token JWT inválido';
        customError = new AppError(message, 401, { code: 'INVALID_TOKEN' });
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token JWT expirado';
        customError = new AppError(message, 401, { code: 'TOKEN_EXPIRED' });
    }
    if (customError.code === 'VALIDATION_ERROR') {
    }
    const response = {
        success: false,
        error: {
            message: customError.message,
            code: customError.code,
            status: customError.status,
            ...(customError.details && Object.keys(customError.details).length > 0 && customError.details.code !== customError.code
                ? { details: customError.details }
                : {}),
        },
    };
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = customError.stack;
    }
    res.status(customError.statusCode).json(response);
};
//# sourceMappingURL=errorHandler.js.map