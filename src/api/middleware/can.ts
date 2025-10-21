import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errorHandler';

const ACL: Record<string, Record<string, string[]>> = {
  usuarios: {
    read: ['admin', 'coordinador', 'gerente'],
    write: ['admin', 'gerente'],
  },
};

export function can(modulo: string, accion: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new HttpError(401, 'Autenticación requerida');
    }

    const allowedRoles = ACL[modulo]?.[accion];
    if (!allowedRoles || allowedRoles.includes(req.user.rol)) {
      return next();
    }

    throw new HttpError(403, 'No tienes permisos para realizar esta acción');
  };
}
