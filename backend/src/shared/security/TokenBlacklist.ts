import { tokenBlacklistRepository } from '../../infra/db/repositories/TokenBlacklistRepository';
import { TokenType } from '../../domain/entities/TokenBlacklist';
import { logger } from '../utils/logger';

/**
 * ========================================
 * TOKEN BLACKLIST SERVICE
 * ========================================
 * Servicio para gestión de blacklist de JTI (JWT ID).
 * Permite invalidar access tokens antes de su expiración.
 *
 * **Uso:**
 * - Logout inmediato
 * - Revocación de tokens comprometidos
 * - Cambio de contraseña (invalidar todas las sesiones)
 */

class TokenBlacklist {
  /**
   * Agregar JTI a blacklist
   *
   * @param jti - JWT ID
   * @param userId - ID del usuario
   * @param type - Tipo de token
   * @param expiresAt - Fecha de expiración del token
   */
  async add(jti: string, userId: string, type: TokenType, expiresAt: Date): Promise<void> {
    try {
      await tokenBlacklistRepository.create({
        token: jti,
        userId,
        type,
        expiresAt,
        revokedAt: new Date(),
      });

      logger.info('JTI added to blacklist', { jti });
    } catch (error: any) {
      logger.error('Error adding JTI to blacklist', {
        error: error.message,
        jti,
      });
      throw new Error('Error al agregar token a blacklist');
    }
  }

  /**
   * Verificar si JTI está en blacklist
   *
   * @param jti - JWT ID
   * @returns true si está en blacklist
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    try {
      return await tokenBlacklistRepository.isBlacklisted(jti);
    } catch (error: any) {
      logger.error('Error checking blacklist', {
        error: error.message,
        jti,
      });
      return false; // En caso de error, no bloquear
    }
  }

  /**
   * Limpiar tokens expirados de blacklist
   * (Ejecutar periódicamente con cron job)
   */
  async cleanup(): Promise<number> {
    try {
      const count = await tokenBlacklistRepository.deleteExpired();

      logger.info('Token blacklist cleaned up', { removed: count });

      return count;
    } catch (error: any) {
      logger.error('Error cleaning up blacklist', {
        error: error.message,
      });
      return 0;
    }
  }

  /**
   * Revocar todos los tokens de un usuario
   *
   * @param userId - ID del usuario
   */
  async revokeAllByUserId(userId: string): Promise<number> {
    try {
      const count = await tokenBlacklistRepository.deleteByUser(userId);

      logger.info('All tokens revoked for user', { userId, revoked: count });

      return count;
    } catch (error: any) {
      logger.error('Error revoking tokens for user', {
        error: error.message,
        userId,
      });
      return 0;
    }
  }
}

/**
 * Instancia singleton
 */
export const tokenBlacklist = new TokenBlacklist();
