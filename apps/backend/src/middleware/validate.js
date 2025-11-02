/**
 * Validation Middleware
 * @description Middleware de validación usando Joi para validar body, query y params
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// Configurar AJV para JSON Schema
const ajv = new Ajv({ allErrors: true, removeAdditional: 'all' });
addFormats(ajv);

/**
 * Validar el body del request contra un schema de Joi
 * @param {Object} schema - Schema de Joi para validación
 * @returns {Function} Middleware function
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    // Validar el body contra el schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: true, // Eliminar campos no definidos en el schema
      convert: true, // Convertir tipos automáticamente (ej: string a number)
    });

    // Si hay errores de validación
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Limpiar comillas de los mensajes
        type: detail.type,
      }));

      logger.warn('Errores de validación en body', {
        path: req.path,
        errors,
        body: req.body,
      });

      return errorResponse(
        res,
        'Errores de validación en los datos enviados',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        errors
      );
    }

    // Reemplazar req.body con el valor validado y sanitizado
    req.body = value;
    next();
  };
};

/**
 * Validar los query params del request contra un schema de Joi
 * @param {Object} schema - Schema de Joi para validación
 * @returns {Function} Middleware function
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    // Validar los query params contra el schema
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    // Si hay errores de validación
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
        type: detail.type,
      }));

      logger.warn('Errores de validación en query params', {
        path: req.path,
        errors,
        query: req.query,
      });

      return errorResponse(
        res,
        'Errores de validación en los parámetros de consulta',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        errors
      );
    }

    // Reemplazar req.query con el valor validado
    req.query = value;
    next();
  };
};

/**
 * Validar los params de la URL contra un schema de Joi
 * @param {Object} schema - Schema de Joi para validación
 * @returns {Function} Middleware function
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    // Validar los params contra el schema
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: false, // No eliminar params de la URL
      convert: true,
    });

    // Si hay errores de validación
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
        type: detail.type,
      }));

      logger.warn('Errores de validación en params de URL', {
        path: req.path,
        errors,
        params: req.params,
      });

      return errorResponse(
        res,
        'Errores de validación en los parámetros de la URL',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        errors
      );
    }

    // Reemplazar req.params con el valor validado
    req.params = value;
    next();
  };
};

/**
 * Validar múltiples partes del request (body, query, params) simultáneamente
 * @param {Object} schemas - Objeto con schemas para body, query y/o params
 * @param {Object} schemas.body - Schema para el body
 * @param {Object} schemas.query - Schema para query params
 * @param {Object} schemas.params - Schema para URL params
 * @returns {Function} Middleware function
 */
export const validateRequest = (schemas = {}) => {
  return (req, res, next) => {
    const errors = [];

    // helper para detectar Joi
    const isJoiSchema = (schema) => schema && typeof schema.validate === 'function';

    const validateWithJoi = (data, schema) => {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        return { valid: false, errors: error.details.map(d => d.message), sanitized: null };
      }

      return { valid: true, errors: [], sanitized: value };
    };

    const validateWithAjv = (data, schema) => {
      try {
        const validate = ajv.compile(schema);
        const valid = validate(data);

        if (!valid) {
          // For each AJV error we may return multiple detail strings (full message + short token)
          const errs = (validate.errors || []).flatMap(err => {
                const field = err.instancePath.replace(/^\//, '') || err.params?.missingProperty || '';

                const details = [];

                // Map AJV errors to friendly Spanish messages
                switch (err.keyword) {
                  case 'minLength': {
                    const min = err.params && err.params.limit ? err.params.limit : null;
                    const full = min ? `${field}: debe tener al menos ${min} caracteres` : `${field}: longitud mínima no válida`;
                    details.push(full);
                    if (min) details.push(`${min} caracteres`);
                    break;
                  }
                  case 'maxLength': {
                    const max = err.params && err.params.limit ? err.params.limit : null;
                    const full = max ? `${field}: debe tener como máximo ${max} caracteres` : `${field}: longitud máxima no válida`;
                    details.push(full);
                    if (max) details.push(`${max} caracteres`);
                    break;
                  }
                  case 'required': {
                    const prop = err.params && err.params.missingProperty ? err.params.missingProperty : '';
                    const full = prop ? `${field}: propiedad requerida: ${prop}` : `${field}: propiedad requerida`;
                    details.push(full);
                    break;
                  }
                  case 'pattern': {
                    details.push(`${field}: formato inválido`);
                    break;
                  }
                  case 'type': {
                    const expected = err.params && err.params.type ? err.params.type : '';
                    const full = expected ? `${field}: debe ser del tipo ${expected}` : `${field}: tipo inválido`;
                    details.push(full);
                    break;
                  }
                  default: {
                    // Fallback to AJV message (in English) but keep field context
                    details.push(`${field}: ${err.message || 'valor inválido'}`);
                  }
                }

                return details;
              });
          return { valid: false, errors: errs, sanitized: data };
        }

        return { valid: true, errors: [], sanitized: data };
      } catch (e) {
        logger.error('AJV validation error', { error: e.message });
        return { valid: false, errors: [e.message], sanitized: data };
      }
    };

    // Validar body
    if (schemas.body) {
      const result = isJoiSchema(schemas.body)
        ? validateWithJoi(req.body, schemas.body)
        : validateWithAjv(req.body, schemas.body);

      if (!result.valid) {
        errors.push(...result.errors);
      } else {
        req.body = result.sanitized;
      }
    }

    // Validar query
    if (schemas.query) {
      const result = isJoiSchema(schemas.query)
        ? validateWithJoi(req.query, schemas.query)
        : validateWithAjv(req.query, schemas.query);

      if (!result.valid) {
        errors.push(...result.errors);
      } else {
        req.query = result.sanitized;
      }
    }

    // Validar params
    if (schemas.params) {
      const result = isJoiSchema(schemas.params)
        ? validateWithJoi(req.params, schemas.params)
        : validateWithAjv(req.params, schemas.params);

      if (!result.valid) {
        errors.push(...result.errors);
      } else {
        req.params = result.sanitized;
      }
    }

    if (errors.length > 0) {
      logger.warn('Errores de validación en request', { path: req.path, errors });
      // Devolver estructura compatible con los tests: { success: false, error: { code, message, details } }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Errores de validación',
          details: errors,
        },
      });
    }

    next();
  };
};

/**
 * Validador de ObjectId de MongoDB
 * Valida que un parámetro sea un ObjectId válido
 * @param {string} paramName - Nombre del parámetro a validar (por defecto 'id')
 * @returns {Function} Middleware function
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];

    // Verificar formato de ObjectId (24 caracteres hexadecimales)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!id || !objectIdRegex.test(id)) {
      logger.warn('ObjectId inválido', {
        path: req.path,
        paramName,
        value: id,
      });

      return errorResponse(
        res,
        `El parámetro '${paramName}' es inválido. Debe ser un ObjectId de MongoDB.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    next();
  };
};

/**
 * Validador de paginación
 * Valida y normaliza parámetros de paginación (page, limit)
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxLimit - Límite máximo de items por página (default: 100)
 * @param {number} options.defaultLimit - Límite por defecto (default: 10)
 * @returns {Function} Middleware function
 */
export const validatePagination = (options = {}) => {
  const { maxLimit = 100, defaultLimit = 10 } = options;

  return (req, res, next) => {
    let { page = 1, limit = defaultLimit } = req.query;

    // Convertir a números
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validar page
    if (isNaN(page) || page < 1) {
      return errorResponse(
        res,
        'El parámetro "page" debe ser un número mayor o igual a 1',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validar limit
    if (isNaN(limit) || limit < 1) {
      return errorResponse(
        res,
        'El parámetro "limit" debe ser un número mayor o igual a 1',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Limitar el máximo de items por página
    if (limit > maxLimit) {
      limit = maxLimit;
    }

    // Agregar valores normalizados al request
    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
    };

    next();
  };
};
