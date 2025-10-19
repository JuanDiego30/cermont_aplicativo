export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      userRole?: 'admin' | 'coordinador' | 'tecnico' | 'gerente' | 'cliente';
    }
  }
}

export {};
