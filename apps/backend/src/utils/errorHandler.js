/**
 * Clase personalizada para manejo de errores estructurados
 * Extiende la clase Error nativa de JavaScript
 */
class AppError extends Error {
  /**
   * Constructor de la clase AppError
   * @param {string} message - Mensaje descriptivo del error
   * @param {number} statusCode - Código de estado HTTP
   * @param {string} code - Código de error único para identificación
   * @param {boolean} isOperational - Indica si es un error operacional (true) o de programación (false)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Función middleware para manejo centralizado de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para debugging
  console.error('Error Handler:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new AppError(message, 404, 'INVALID_ID');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Valor duplicado para el campo: ${field}`;
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Respuesta de error estructurada
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
      status: error.status || 'error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export { AppError, errorHandler };