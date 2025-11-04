import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
export const errorHandler = (err, req, res, _next) => {
    void _next;
    const errorObj = err;
    const userId = req.userId;
    logger.error('Error capturado por errorHandler:', {
        message: errorObj.message,
        stack: process.env.NODE_ENV === 'development' ? errorObj.stack : undefined,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userId,
    });
    if (errorObj.name === 'ValidationError') {
        const mongooseErr = err;
        const errors = Object.values(mongooseErr.errors ?? {}).map((error) => ({
            field: error.path,
            message: error.message,
            value: error.value,
        }));
        errorResponse(res, 'Errores de validación en los datos enviados', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
        return;
    }
    if (err.code === 11000) {
        const mongooseErr = err;
        const field = Object.keys(mongooseErr.keyPattern ?? {})[0];
        const value = mongooseErr.keyValue?.[field];
        errorResponse(res, `El ${field} "${value}" ya existe en el sistema`, HTTP_STATUS.CONFLICT, [{ field, message: 'Valor duplicado', value }]);
        return;
    }
    if (errorObj.name === 'CastError') {
        const castErr = err;
        errorResponse(res, `ID inválido: ${castErr.value}`, HTTP_STATUS.BAD_REQUEST, [{ field: castErr.path, message: 'Formato de ID inválido' }]);
        return;
    }
    if (errorObj.name === 'JsonWebTokenError') {
        errorResponse(res, 'Token de autenticación inválido', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (errorObj.name === 'TokenExpiredError') {
        errorResponse(res, 'Token de autenticación expirado. Por favor, inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (errorObj.name === 'MulterError') {
        const multerErr = err;
        if (multerErr.code === 'LIMIT_FILE_SIZE') {
            errorResponse(res, 'El archivo es demasiado grande. Tamaño máximo permitido: 10MB', HTTP_STATUS.BAD_REQUEST);
            return;
        }
        if (multerErr.code === 'LIMIT_FILE_COUNT') {
            errorResponse(res, 'Demasiados archivos. Máximo permitido: 20 archivos', HTTP_STATUS.BAD_REQUEST);
            return;
        }
        if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
            errorResponse(res, 'Campo de archivo inesperado', HTTP_STATUS.BAD_REQUEST);
            return;
        }
        errorResponse(res, `Error al subir archivo: ${errorObj.message}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (typeof errorObj.message === 'string' && errorObj.message.includes('Tipo de archivo no permitido')) {
        errorResponse(res, errorObj.message, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (errorObj instanceof SyntaxError && errorObj.status === 400 && 'body' in errorObj) {
        errorResponse(res, 'JSON mal formado en el body de la petición', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (errorObj.name === 'MongoServerError' || errorObj.name === 'MongoError') {
        logger.error('Error de MongoDB:', errorObj);
        errorResponse(res, 'Error de base de datos. Intenta nuevamente', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        return;
    }
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = errorObj.message || 'Error interno del servidor';
    const errorDetails = process.env.NODE_ENV === 'development'
        ? { stack: errorObj.stack, error: errorObj }
        : undefined;
    errorResponse(res, message, statusCode, errorDetails);
};
export const notFound = (req, res) => {
    const userId = req.userId;
    logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userId,
    });
    errorResponse(res, `Ruta no encontrada: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND);
};
export const asyncErrorHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
export const unhandledRejectionHandler = () => {
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Promesa no manejada rechazada:', {
            reason,
            promise,
        });
    });
};
export const uncaughtExceptionHandler = () => {
    process.on('uncaughtException', (error) => {
        const err = error;
        logger.error('Excepción no capturada:', {
            message: err.message,
            stack: err.stack,
        });
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });
};
//# sourceMappingURL=errorHandler.js.map