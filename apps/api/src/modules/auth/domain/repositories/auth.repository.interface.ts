/**
 * @repository IAuthRepository
 * @description Interface del repositorio de autenticación
 * @layer Domain
 */
import { AuthSessionEntity } from '../entities';

export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

export interface IAuthRepository {
  // Session Management
  createSession(session: AuthSessionEntity): Promise<AuthSessionEntity>;
  findSessionByToken(token: string): Promise<AuthSessionEntity | null>;
  revokeSession(token: string): Promise<void>;
  revokeSessionFamily(family: string): Promise<void>;
  revokeAllUserSessions(userId: string): Promise<void>;

  // User Queries
  findUserByEmail(email: string): Promise<{
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    active: boolean;
    avatar?: string;
    phone?: string;
    lastLogin?: Date;
  } | null>;

  findUserById(id: string): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    active: boolean;
    avatar?: string;
    phone?: string;
  } | null>;

  // User Creation
  createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
  }): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
  }>;

  // User Updates
  updateLastLogin(userId: string): Promise<void>;

  // Audit
  createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void>;
}
