/**
 * Use Case: Logout de usuario
 * Resuelve: Cierre de sesión seguro con invalidación de tokens
 * 
 * @file backend/src/app/auth/use-cases/Logout.ts
 */

import type { IRevokedTokenRepository } from '../../../domain/repositories/ITokenBlacklistRepository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { TokenType } from '../../../domain/entities/TokenBlacklist.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import jwt from 'jsonwebtoken';

const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Token de acceso inválido o malformado',
  MISSING_EXPIRATION: 'Token sin fecha de expiración',
  TOKEN_MISMATCH: 'El token no pertenece al usuario especificado',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[LogoutUseCase]',
} as const;

interface LogoutInput {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  ip: string;
  userAgent: string;
}

interface DecodedToken {
  exp?: number;
  userId?: string;
  [key: string]: unknown;
}

export class LogoutUseCase {
  constructor(
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: LogoutInput): Promise<void> {
    const { accessToken, refreshToken, userId, ip, userAgent } = input;

    const tokenExpiration = this.extractTokenExpiration(accessToken, userId);

    await this.revokeAccessToken(accessToken, userId, tokenExpiration);
    await this.revokeRefreshTokenIfPresent(refreshToken);
    await this.logLogoutEvent(userId, ip, userAgent, !!refreshToken);

    logger.info(`${LOG_CONTEXT.USE_CASE} Logout exitoso`, { userId, ip });
  }

  private extractTokenExpiration(token: string, expectedUserId: string): Date {
    let decoded: DecodedToken;

    try {
      decoded = jwt.decode(token) as DecodedToken;
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Token malformado`, { expectedUserId });
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    if (!decoded) {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    this.validateTokenOwnership(decoded, expectedUserId);
    return this.extractExpirationDate(decoded);
  }

  private validateTokenOwnership(decoded: DecodedToken, expectedUserId: string): void {
    if (decoded.userId && decoded.userId !== expectedUserId) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de logout con token ajeno`, {
        tokenUserId: decoded.userId,
        expectedUserId,
      });
      throw new Error(ERROR_MESSAGES.TOKEN_MISMATCH);
    }
  }

  private extractExpirationDate(decoded: DecodedToken): Date {
    if (!decoded.exp) {
      throw new Error(ERROR_MESSAGES.MISSING_EXPIRATION);
    }

    return new Date(decoded.exp * 1000);
  }

  private async revokeAccessToken(
    token: string,
    userId: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      await this.revokedTokenRepository.create({
        tokenIdentifier: token, // In production, use JTI or hash
        userId,
        expiresAt,
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error revocando access token`, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async revokeRefreshTokenIfPresent(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      await this.refreshTokenRepository.revokeToken(refreshToken);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error revocando refresh token`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private async logLogoutEvent(
    userId: string,
    ip: string,
    userAgent: string,
    hadRefreshToken: boolean
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.LOGOUT,
        userId,
        ip,
        userAgent,
        reason: hadRefreshToken
          ? 'Logout con revocación de refresh token'
          : 'Logout sin refresh token',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

