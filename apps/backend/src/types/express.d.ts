import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        rol: string;
        tokenVersion?: number;
        email?: string;
      };
    }
  }
}

export {};