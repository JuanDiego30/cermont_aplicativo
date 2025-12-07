import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Middleware para validar el body de la request con un esquema Zod
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        res.status(400).json({
          error: 'Error de validación',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware para validar query params con un esquema Zod
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        res.status(400).json({
          error: 'Error de validación en query params',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Middleware para validar params de ruta con un esquema Zod
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        res.status(400).json({
          error: 'Error de validación en parámetros',
          details: errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Formatear errores de Zod a un formato más legible
 */
function formatZodErrors(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

/**
 * Validador de UUID
 */
export const uuidParamSchema = z.object({
  id: z.string().uuid('ID debe ser un UUID válido'),
});

/**
 * Middleware helper para validar que el ID es un UUID
 */
export const validateUuidParam = validateParams(uuidParamSchema);
