/**
 * Use Case: Logout de usuario
 * Resuelve: Cierre de sesi�n seguro con invalidaci�n de tokens
 * 
 * @file backend/src/app/auth/use-cases/Logout.ts
 */

import type { ITokenBlacklistRepository } from '../../../domain/repositories/ITokenBlacklistRepository.js';
import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { TokenType } from '../../../domain/entities/TokenBlacklist.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Input del use case
 */
export interface LogoutInput {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  ip: string;
  userAgent: string;
}

/**
 * Use Case: Logout
 * @class Logout
 */
export class Logout {
  constructor(
    private readonly tokenBlacklistRepository: ITokenBlacklistRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly auditService: AuditService
  ) {}

  /**
   * Ejecuta el logout
   */
  async execute(input: LogoutInput): Promise<void> {
    const { accessToken, refreshToken, userId, ip, userAgent } = input;

    logger.info('[Logout] Iniciando logout', { userId, ip });

    try {
      // 1. Decodificar access token
      const decoded = jwt.decode(accessToken) as { exp?: number } | null;
      
      if (!decoded?.exp) {
        throw new Error('Token inv�lido');
      }

      const expiresAt = new Date(decoded.exp * 1000);

      // 2. Agregar access token a blacklist
      await this.tokenBlacklistRepository.create({
        token: accessToken,
        userId,
        type: TokenType.ACCESS,
        expiresAt,
        revokedAt: new Date(),
      });

      // 3. Revocar refresh token si existe
      if (refreshToken) {
        await this.refreshTokenRepository.revokeToken(refreshToken);
      }

      // 4. Registrar en auditor�a
      await this.auditService.log({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.READ,
        userId,
        ip,
        userAgent,
        reason: 'Logout successful',
      });

      logger.info('[Logout] Logout exitoso', { userId });
    } catch (error) {
      logger.error('[Logout] Error durante logout', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
