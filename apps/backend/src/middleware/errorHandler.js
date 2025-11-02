/**
 * Middleware de Manejo de Errores
 * @description Captura y formatea errores de manera centralizada
 */

import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Manejador global de errores
 * Captura todos los errores que ocurren en la aplicación
 */
export const errorHandler = (err, req, res, _next) => {
  // Use _next to satisfy linter (Express requires 4 args for error handlers)
  void _next;
  // Registrar el error en los logs
  logger.error('Error capturado por errorHandler:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
  });

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value,
    }));

    return errorResponse(
      res,
      'Errores de validación en los datos enviados',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errors
    );
  }

  // Error de clave duplicada en MongoDB (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    
    return errorResponse(
      res,
      `El ${field} "${value}" ya existe en el sistema`,
      HTTP_STATUS.CONFLICT,
      [{ field, message: 'Valor duplicado', value }]
    );
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return errorResponse(
      res,
      `ID inválido: ${err.value}`,
      HTTP_STATUS.BAD_REQUEST,
      [{ field: err.path, message: 'Formato de ID inválido' }]
    );
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(
      res,
      'Token de autenticación inválido',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(
      res,
      'Token de autenticación expirado. Por favor, inicia sesión nuevamente',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Errores de Multer (subida de archivos)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(
        res,
        'El archivo es demasiado grande. Tamaño máximo permitido: 10MB',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(
        res,
        'Demasiados archivos. Máximo permitido: 20 archivos',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(
        res,
        'Campo de archivo inesperado',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    return errorResponse(
      res,
      `Error al subir archivo: ${err.message}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Error de tipo de archivo no permitido (custom)
  if (err.message && err.message.includes('Tipo de archivo no permitido')) {
    return errorResponse(
      res,
      err.message,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Errores de sintaxis en JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(
      res,
      'JSON mal formado en el body de la petición',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Error de conexión a la base de datos
  if (err.name === 'MongoServerError' || err.name === 'MongoError') {
    logger.error('Error de MongoDB:', err);
    return errorResponse(
      res,
      'Error de base de datos. Intenta nuevamente',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }

  // Error genérico de la aplicación
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Error interno del servidor';

  // En producción, no exponer detalles del error
  const errorDetails = process.env.NODE_ENV === 'development' 
    ? { stack: err.stack, error: err } 
    : undefined;

  return errorResponse(
    res,
    message,
    statusCode,
    errorDetails
  );
};

/**
 * Manejador de rutas no encontradas (404)
 * Debe ser el último en la cadena de middlewares
 */
export const notFound = (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userId: req.userId,
  });

  return errorResponse(
    res,
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Manejador de errores asíncronos
 * Wrapper para evitar try-catch en cada controlador
 */
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para capturar errores de promesas no manejadas
 */
export const unhandledRejectionHandler = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesa no manejada rechazada:', {
      reason,
      promise,
    });
  });
};

/**
 * Middleware para capturar excepciones no capturadas
 */
export const uncaughtExceptionHandler = () => {
  process.on('uncaughtException', (error) => {
    logger.error('Excepción no capturada:', {
      message: error.message,
      stack: error.stack,
    });

    // En producción, cerrar el proceso de forma ordenada
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
};
