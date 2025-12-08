/**
 * Middleware de autenticación y autorización para Express en Cermont. Valida JWT tokens
 * en header Authorization, extrae y verifica payload, asigna usuario a req.user. Proporciona
 * three middlewares: authMiddleware (obligatorio), roleMiddleware (basado en roles admin/supervisor/técnico),
 * y optionalAuthMiddleware (autenticación opcional que no bloquea si falta token). Incluye
 * declaración de tipos TypeScript para extender Express.Request con propiedades de usuario.
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import type { UserRole } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = authService.validateToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Token inválido o expirado' });
      return;
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(401).json({ error: 'Error de autenticación' });
  }
}

export function roleMiddleware(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso',
        required: allowedRoles,
        current: req.user.role,
      });
      return;
    }

    next();
  };
}

export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = authService.validateToken(token);

      if (payload) {
        req.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };
      }
    }

    next();
  } catch (error) {
    next();
  }
}

