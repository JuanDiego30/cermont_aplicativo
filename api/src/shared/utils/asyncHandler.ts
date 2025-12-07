import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wrapper para manejar errores de funciones async en Express
 * Evita tener que usar try/catch en cada controlador
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
