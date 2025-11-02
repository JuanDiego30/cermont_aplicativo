/**
 * Response Utility
 * @description Helpers para respuestas HTTP estandarizadas
 */

/**
 * Códigos de estado HTTP
 */
export const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Objeto de respuesta de Express
 * @param {*} data - Datos a retornar
 * @param {string} message - Mensaje de éxito
 * @param {number} statusCode - Código de estado HTTP
 * @param {Object} meta - Metadata adicional (paginación, etc.)
 */
export const successResponse = (
  res,
  data = null,
  message = 'Operación exitosa',
  statusCode = HTTP_STATUS.OK,
  meta = {}
) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  // Agregar metadata si existe
  if (Object.keys(meta).length > 0) {
    // Si hay paginación, agregarla al top level para compatibilidad con tests existentes
    if (meta.pagination) {
      response.pagination = meta.pagination;
    }
    // Agregar el resto de metadata
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Array} errors - Array de errores detallados
 * @param {string} errorCode - Código de error personalizado
 */
export const errorResponse = (
  res,
  message = 'Ha ocurrido un error',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors = [],
  errorCode = null
) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Agregar código de error si existe
  if (errorCode) {
    // Keep compatibility: top-level errorCode
    response.errorCode = errorCode;
  }

  // Agregar errores detallados si existen
  if (errors && (Array.isArray(errors) ? errors.length > 0 : true)) {
    // Normalize details into array
    response.error = response.error || {};
    response.error.details = Array.isArray(errors) ? errors : [errors];
  }

  // Ensure nested error object exists for consumers expecting { error: { message, code, details } }
  response.error = response.error || {};
  response.error.message = response.error.message || message;
  response.error.code = response.error.code || errorCode || null;

  // No exponer stack trace en producción
  if (process.env.NODE_ENV === 'development' && errors.length > 0) {
    response.stack = errors[0]?.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de validación fallida
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Array} errors - Array de errores de validación
 */
export const validationErrorResponse = (res, errors = []) => {
  return errorResponse(
    res,
    'Error de validación',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors,
    'VALIDATION_ERROR'
  );
};

/**
 * Respuesta de recurso no encontrado
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} resource - Nombre del recurso
 */
export const notFoundResponse = (res, resource = 'Recurso') => {
  return errorResponse(
    res,
    `${resource} no encontrado`,
    HTTP_STATUS.NOT_FOUND,
    [],
    'NOT_FOUND'
  );
};

/**
 * Respuesta de no autorizado
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje personalizado
 */
export const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(
    res,
    message,
    HTTP_STATUS.UNAUTHORIZED,
    [],
    'UNAUTHORIZED'
  );
};

/**
 * Respuesta de prohibido (sin permisos)
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje personalizado
 */
export const forbiddenResponse = (res, message = 'No tienes permisos para realizar esta acción') => {
  return errorResponse(
    res,
    message,
    HTTP_STATUS.FORBIDDEN,
    [],
    'FORBIDDEN'
  );
};

/**
 * Respuesta de conflicto (duplicado)
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje personalizado
 */
export const conflictResponse = (res, message = 'Ya existe un registro con estos datos') => {
  return errorResponse(
    res,
    message,
    HTTP_STATUS.CONFLICT,
    [],
    'CONFLICT'
  );
};

/**
 * Respuesta con paginación
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Array} data - Datos paginados
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @param {number} total - Total de registros
 * @param {string} message - Mensaje de éxito
 */
export const paginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message = 'Datos obtenidos exitosamente'
) => {
  const totalPages = Math.ceil(total / limit);
  
  const meta = {
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };

  return successResponse(res, data, message, HTTP_STATUS.OK, meta);
};

/**
 * Respuesta de creación exitosa
 * @param {Object} res - Objeto de respuesta de Express
 * @param {*} data - Datos creados
 * @param {string} message - Mensaje de éxito
 */
export const createdResponse = (res, data, message = 'Recurso creado exitosamente') => {
  return successResponse(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Respuesta sin contenido (para DELETE exitoso)
 * @param {Object} res - Objeto de respuesta de Express
 * @param {string} message - Mensaje de éxito
 */
export const noContentResponse = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

/**
 * Respuesta de rate limit excedido
 * @param {Object} res - Objeto de respuesta de Express
 */
export const rateLimitResponse = (res) => {
  return errorResponse(
    res,
    'Demasiadas solicitudes. Por favor, intenta más tarde',
    HTTP_STATUS.TOO_MANY_REQUESTS,
    [],
    'RATE_LIMIT_EXCEEDED'
  );
};

/**
 * Helper para formatear errores de Mongoose
 * @param {Object} error - Error de Mongoose
 * @returns {Array} Array de errores formateados
 */
export const formatMongooseErrors = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return [{
      field,
      message: `Ya existe un registro con este ${field}`,
      value: error.keyValue[field],
    }];
  }
  
  return [{
    message: error.message,
  }];
};

/**
 * Helper para formatear errores de Joi
 * @param {Object} error - Error de Joi
 * @returns {Array} Array de errores formateados
 */
export const formatJoiErrors = (error) => {
  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
  }));
};
