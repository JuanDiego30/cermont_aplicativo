/**
 * Use Case: Refresh Access Token
 * Resuelve: Renovaci�n de tokens con detecci�n de reuso
 * 
 * @file backend/src/app/auth/use-cases/RefreshToken.ts
 */

import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { jwtService } from '../../../shared/security/jwtService.js';
import { logger } from '../../../shared/utils/logger.js';
import jwt from 'jsonwebtoken';

/**
 * Input del use case
 */
export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Output del use case
 */
export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

/**
 * Use Case: RefreshToken
 * @class RefreshToken
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Ejecuta el refresh de token
   */
  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { refreshToken } = input;

    try {
      // 1. Verificar firma del token
      jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
        userId: string;
        email: string;
      };

      // 2. Buscar token en BD
      const storedToken = await this.refreshTokenRepository.findByToken(refreshToken);

      if (!storedToken) {
        logger.warn('[RefreshToken] Token no encontrado');
        throw new Error('Token inv�lido');
      }

      // 3. Verificar si est� revocado
      if (storedToken.isRevoked) {
        logger.error('[RefreshToken] Token revocado reutilizado', {
          family: storedToken.family,
        });
        await this.refreshTokenRepository.revokeTokenFamily(storedToken.family);
        throw new Error('Token inv�lido');
      }

      // 4. Verificar expiraci�n
      if (storedToken.expiresAt < new Date()) {
        throw new Error('Token expirado');
      }

      // 5. Buscar usuario
      const user = await this.userRepository.findById(storedToken.userId);

      if (!user || !user.active) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // 6. Revocar token actual
      await this.refreshTokenRepository.revokeToken(refreshToken);

      // 7. Generar nuevos tokens
      const newAccessToken = await jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = await jwtService.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // 8. Guardar nuevo refresh token
      await this.refreshTokenRepository.create({
        token: newRefreshToken,
        userId: user.id,
        family: storedToken.family,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isRevoked: false,
      });

      logger.info('[RefreshToken] Token renovado', { userId: user.id });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('[RefreshToken] Error renovando token', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
