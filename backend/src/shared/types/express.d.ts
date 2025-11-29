import type { Request } from 'express';

/**
 * Extensión global de tipos para Express Request
 * Define la estructura del usuario autenticado en todas las peticiones
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role: string;
        jti?: string;
        id?: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
