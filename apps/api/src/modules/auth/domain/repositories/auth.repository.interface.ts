import { AuthUserEntity, AuthUserProps } from "../entities/auth-user.entity";

export const AUTH_REPOSITORY = "AUTH_REPOSITORY";

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthUserEntity | null>;
  findById(id: string): Promise<AuthUserEntity | null>;
  findUserById(id: string): Promise<AuthUserEntity | null>;
  create(data: Omit<AuthUserProps, "id">): Promise<AuthUserEntity>;
  updateLastLogin(userId: string): Promise<void>;

  // Regla 7: lockout (5 intentos fallidos => 15 min)
  incrementLoginAttempts(
    userId: string,
    lockUntil?: Date,
  ): Promise<{ loginAttempts: number; lockedUntil: Date | null }>;
  resetLoginAttempts(userId: string): Promise<void>;
  createRefreshToken(data: {
    token: string;
    userId: string;
    family: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void>;
  findRefreshToken(token: string): Promise<{
    id: string;
    token: string;
    userId: string;
    family: string;
    expiresAt: Date;
    isRevoked: boolean;
    user: AuthUserEntity;
  } | null>;
  revokeRefreshToken(tokenId: string): Promise<void>;
  revokeTokenFamily(family: string): Promise<void>;
  createAuditLog(data: {
    userId: string;
    action: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void>;

  // Methods expected by existing use cases
  findSessionByToken(token: string): Promise<{
    id: string;
    userId: string;
    family: string;
    isRevoked: boolean;
    isExpired: boolean;
    rotate(ip?: string, userAgent?: string): { refreshToken: string };
  } | null>;
  revokeSessionFamily(family: string): Promise<void>;
  revokeSession(token: string): Promise<void>;
  createSession(session: { refreshToken: string }): Promise<void>;
}

// Alias for backward compatibility
export type AuthRepository = IAuthRepository;
