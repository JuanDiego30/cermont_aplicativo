import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * VALIDATION MIDDLEWARE (LEGACY)
 * ========================================
 * Middleware de validación con Zod.
 *
 * **DEPRECADO:** Usar validateRequest() en validation.schemas.ts
 *
 * @deprecated Use validateRequest() from validation.schemas.ts
 */

/**
 * Middleware de validación Zod (legacy)
 * @param schema - Schema Zod para validar
 */
export function validateMiddleware(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        logger.warn('Validation error', {
          path: req.path,
          errors: err.issues,
        });

        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Validation Error',
          status: 400,
          detail: 'Error de validación en los datos enviados',
          errors: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        });
      } else {
        next(err);
      }
    }
  };
}
