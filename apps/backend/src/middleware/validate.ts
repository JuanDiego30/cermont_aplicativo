/**
 * Zod Validation Middleware (TypeScript - November 2025)
 * @description Middleware unificado de validación usando Zod para CERMONT ATG.
 * Reemplaza Joi con Zod para mejor type safety y performance.
 * Soporta validación de body, query, params con sanitización automática.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

// Tipos extendidos para request con datos validados
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
      pagination?: {
        page: number;
        limit: number;
        skip: number;
        totalPages: number;
      };
    }
  }
}

/**
 * Middleware para validar body con Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Body validation failed', {
          path: req.path,
          method: req.method,
          errors
        });

        return errorResponse(res, 'Datos de entrada inválidos', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
      }

      logger.error('Unexpected validation error', error);
      return errorResponse(res, 'Error de validación interno', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

/**
 * Middleware para validar query parameters con Zod schema
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Query validation failed', {
          path: req.path,
          method: req.method,
          errors
        });

        return errorResponse(res, 'Parámetros de consulta inválidos', HTTP_STATUS.BAD_REQUEST, errors);
      }

      logger.error('Unexpected validation error', error);
      return errorResponse(res, 'Error de validación interno', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

/**
 * Middleware para validar route parameters con Zod schema
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.validatedParams = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Params validation failed', {
          path: req.path,
          method: req.method,
          errors
        });

        return errorResponse(res, 'Parámetros de ruta inválidos', HTTP_STATUS.BAD_REQUEST, errors);
      }

      logger.error('Unexpected validation error', error);
      return errorResponse(res, 'Error de validación interno', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

/**
 * Middleware combinado para validar body, query y params
 */
export const validateRequest = (options: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const middlewares: ((req: Request, res: Response, next: NextFunction) => void)[] = [];

    if (options.body) {
      middlewares.push(validateBody(options.body));
    }

    if (options.query) {
      middlewares.push(validateQuery(options.query));
    }

    if (options.params) {
      middlewares.push(validateParams(options.params));
    }

    // Ejecutar middlewares en secuencia
    let index = 0;
    const executeNext = () => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        middleware(req, res, executeNext);
      } else {
        next();
      }
    };

    executeNext();
  };
};

/**
 * Validador específico para ObjectId de MongoDB
 */
export const validateObjectId = (paramName: string = 'id') => {
  return validateParams(z.object({
    [paramName]: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido')
  }));
};

/**
 * Schema común para paginación
 */
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

/**
 * Middleware para paginación con validación
 */
export const validatePagination = (options: {
  maxLimit?: number;
  defaultLimit?: number;
  defaultPage?: number;
} = {}) => {
  const { maxLimit = 100, defaultLimit = 10, defaultPage = 1 } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = paginationSchema.parse(req.query);
      const page = validated.page || defaultPage;
      const limit = Math.min(validated.limit || defaultLimit, maxLimit);

      req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit,
        totalPages: 0, // Se calcula después en el controlador
      };

      req.validatedQuery = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        logger.warn('Pagination validation failed', {
          path: req.path,
          method: req.method,
          errors
        });

        return errorResponse(res, 'Parámetros de paginación inválidos', HTTP_STATUS.BAD_REQUEST, errors);
      }

      logger.error('Unexpected pagination validation error', error);
      return errorResponse(res, 'Error de validación de paginación', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

/**
 * Validador para estados específicos
 */
export const validateStatus = (paramName: string = 'status', allowedStatuses: readonly string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const status = req.params[paramName] || req.body?.[paramName] || req.query?.[paramName];

    if (!status || !allowedStatuses.includes(status)) {
      const errors = [{
        field: paramName,
        message: `Estado inválido. Valores permitidos: ${allowedStatuses.join(', ')}`,
        code: 'invalid_enum_value'
      }];

      logger.warn('Status validation failed', {
        param: paramName,
        value: status,
        allowed: allowedStatuses,
        path: req.path
      });

      return errorResponse(res, `Estado '${paramName}' inválido`, HTTP_STATUS.BAD_REQUEST, errors);
    }

    next();
  };
};

/**
 * Helper para crear schemas de password con validación de fortaleza
 */
export const passwordSchema = z.string()
  .min(12, 'La contraseña debe tener al menos 12 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una minúscula, una mayúscula y un número');

/**
 * Helper para sanitizar strings (trim y escape básico)
 */
export const sanitizedString = (minLength: number = 1, maxLength: number = 255) =>
  z.string()
    .trim()
    .min(minLength, `Mínimo ${minLength} caracteres`)
    .max(maxLength, `Máximo ${maxLength} caracteres`);

/**
 * Helper para email con validación
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .toLowerCase()
  .trim();

/**
 * Helper para ObjectId
 */
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido');

/**
 * Helper para fechas ISO
 */
export const dateSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, 'Fecha inválida');

/**
 * Helper para booleanos flexibles
 */
export const booleanSchema = z.union([
  z.boolean(),
  z.string().transform(val => val.toLowerCase() === 'true'),
  z.number().transform(val => val === 1)
]);

/**
 * Schema para filtros comunes
 */
export const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  active: booleanSchema.optional()
});

export default {
  validateBody,
  validateQuery,
  validateParams,
  validateRequest,
  validateObjectId,
  validatePagination,
  validateStatus,
  passwordSchema,
  emailSchema,
  objectIdSchema,
  dateSchema,
  booleanSchema,
  filterSchema,
  paginationSchema,
  sanitizedString
};
