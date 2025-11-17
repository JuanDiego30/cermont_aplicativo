import { refreshTokenRepository } from '../../infra/db/repositories/RefreshTokenRepository.js';
import { logger } from '../utils/logger.js';
import { randomBytes } from 'crypto';

/**
 * ========================================
 * REFRESH TOKEN SERVICE
 * ========================================
 * Servicio de gestión de refresh tokens con rotación automática.
 *
 * **Características:**
 * - Token rotation (cada refresh genera nuevo token)
 * - Token families (detecta reuso de tokens)
 * - Automatic revocation (revoca familia si detecta ataque)
 *
 * **Security:**
 * - Si un token revocado se usa → Revoca toda la familia
 * - Si un token no existe se usa → Revoca todos los tokens del usuario
 *
 * @see RFC 6749 - OAuth 2.0 Refresh Token
 */

/**
 * Refresh Token Service Class
 */
export class RefreshTokenService {
  private static readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

  /**
   * Genera un string aleatorio para refresh token
   */
  private static generateTokenString(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Genera un family ID único
   */
  private static generateFamily(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Genera un nuevo refresh token para un usuario
   *
   * @param userId - ID del usuario
   * @returns Token de refresh generado
   *
   * @example
   * ```typescript
   * const refreshToken = await refreshTokenService.generate(userId);
   * ```
   */
  static async generate(userId: string): Promise<string> {
    try {
      const token = this.generateTokenString();
      const family = this.generateFamily();
      const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL);

      await refreshTokenRepository.save(token, userId, family, expiresAt);

      logger.info('Refresh token generated', {
        userId,
        family,
        expiresAt,
      });

      return token;
    } catch (error: any) {
      logger.error('Error generating refresh token', {
        error: error.message,
        userId,
      });
      throw new Error('Error al generar refresh token');
    }
  }

  /**
   * Valida y rota un refresh token
   *
   * @param oldToken - Token anterior
   * @param userId - ID del usuario
   * @returns Nuevo token de refresh
   */
  static async rotate(oldToken: string, userId: string): Promise<string> {
    try {
      // Verificar que el token anterior existe y no está revocado
      const oldTokenData = await refreshTokenRepository.findByToken(oldToken);

      if (!oldTokenData || oldTokenData.isRevoked || oldTokenData.userId !== userId) {
        throw new Error('Token inválido o revocado');
      }

      // Revocar el token anterior
      await refreshTokenRepository.revoke(oldToken);

      // Generar nuevo token en la misma familia
      const newToken = this.generateTokenString();
      const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL);

      await refreshTokenRepository.save(newToken, userId, oldTokenData.family, expiresAt);

      logger.info('Refresh token rotated', {
        userId,
        family: oldTokenData.family,
      });

      return newToken;
    } catch (error: any) {
      logger.error('Error rotating refresh token', {
        error: error.message,
        userId,
      });
      throw new Error('Error al rotar refresh token');
    }
  }

  /**
   * Valida un refresh token
   *
   * @param token - Token a validar
   * @param userId - ID del usuario
   * @returns true si es válido
   */
  static async validate(token: string, userId: string): Promise<boolean> {
    try {
      const tokenData = await refreshTokenRepository.findByToken(token);

      if (!tokenData) {
        return false;
      }

      // Verificar que pertenece al usuario y no está revocado
      const isValid = tokenData.userId === userId &&
                     !tokenData.isRevoked &&
                     tokenData.expiresAt > new Date();

      return isValid;
    } catch (error: any) {
      logger.error('Error validating refresh token', {
        error: error.message,
        userId,
      });
      return false;
    }
  }

  /**
   * Revoca un refresh token específico
   *
   * @param token - Token a revocar
   */
  static async revoke(token: string): Promise<void> {
    try {
      await refreshTokenRepository.revoke(token);

      logger.info('Refresh token revoked', { token: token.substring(0, 8) + '...' });
    } catch (error: any) {
      logger.error('Error revoking refresh token', {
        error: error.message,
        token: token.substring(0, 8) + '...',
      });
      throw new Error('Error al revocar refresh token');
    }
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   *
   * @param userId - ID del usuario
   */
  static async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const count = await refreshTokenRepository.revokeAllUserTokens(userId);

      logger.info('All user refresh tokens revoked', { userId, count });

      return count;
    } catch (error: any) {
      logger.error('Error revoking all user refresh tokens', {
        error: error.message,
        userId,
      });
      throw new Error('Error al revocar tokens del usuario');
    }
  }

  /**
   * Limpia tokens expirados
   *
   * @returns Número de tokens eliminados
   */
  static async cleanup(): Promise<number> {
    try {
      const count = await refreshTokenRepository.deleteExpired();

      logger.info('Expired refresh tokens cleaned up', { count });

      return count;
    } catch (error: any) {
      logger.error('Error cleaning up expired refresh tokens', {
        error: error.message,
      });
      return 0;
    }
  }
}

/**
 * Instancia singleton
 */
export const refreshTokenService = RefreshTokenService;
