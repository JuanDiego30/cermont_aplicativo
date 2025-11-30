import { Request, Response, NextFunction } from 'express';
import { container } from '../container/index.js';

/**
 * Extender Request interface para incluir user
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        jti: string;
      };
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica el token JWT en el header Authorization
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await container.authMiddleware.handle(req, res, next);
}

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero inyecta usuario si existe
 */
export async function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  await container.authMiddleware.handleOptional(req, res, next);
}
