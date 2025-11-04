/**
 * Zod Validation Middleware for Auth Routes
 * @description Middleware específico para validación de autenticación usando Zod
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

/**
 * Middleware para validar body con Zod schema (específico para auth)
 */
export const validateZod = (schema: z.ZodSchema) => {
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

        logger.warn('Auth validation failed', {
          path: req.path,
          method: req.method,
          errors
        });

        return errorResponse(res, 'Datos de entrada inválidos', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
      }

      logger.error('Unexpected auth validation error', error);
      return errorResponse(res, 'Error de validación interno', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};