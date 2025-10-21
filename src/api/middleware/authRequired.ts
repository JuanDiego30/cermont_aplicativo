import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler';
import { verifyToken } from '../utils/jwt';

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || typeof header !== 'string') {
    throw new HttpError(401, 'Autenticación requerida');
  }

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError(401, 'Formato de token inválido');
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      correo: payload.correo,
      rol: payload.rol,
    };
    return next();
  } catch (error) {
    throw new HttpError(401, 'Token inválido o expirado', error instanceof Error ? error.message : undefined);
  }
}
