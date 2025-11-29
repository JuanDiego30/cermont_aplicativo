import type { IRevokedTokenRepository } from '../../../domain/repositories/IRevokedTokenRepository.js';
// Ajusta la ruta de la entidad RevokedToken según tu estructura
import type { RevokedToken } from '../../../domain/entities/RevokedToken.js'; 
import { logger } from '../../../shared/utils/logger.js';

/**
 * ========================================
 * TOKEN BLACKLIST SERVICE
 * ========================================
 * Servicio para gestión de blacklist de JTI (JWT ID).
 */
export class TokenBlacklistService {
  constructor(private readonly revokedTokenRepository: IRevokedTokenRepository) {}

  /**
   * Agregar JTI a blacklist
   */
  async add(jti: string, userId: string, type: 'ACCESS' | 'REFRESH', expiresAt: Date): Promise<void> {
    try {
      await this.revokedTokenRepository.create({
        tokenIdentifier: jti,
        userId,
        type,
        expiresAt,
        // revokedAt se genera automáticamente en el repositorio
      });

      logger.info('JTI added to blacklist', { jti, userId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      logger.error('Error adding JTI to blacklist', { error: msg, jti });
      throw new Error('Error al agregar token a blacklist');
    }
  }

  /**
   * Verificar si JTI está en blacklist
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    try {
      return await this.revokedTokenRepository.isRevoked(jti);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      // FAIL-SAFE: Ante error de BD, asumimos blacklisted por seguridad o lanzamos error
      // Si retornamos false, podríamos permitir un token robado durante una caída de BD.
      // Lo mejor es lanzar error y que el middleware retorne 500.
      logger.error('Critical: Error checking blacklist', { error: msg, jti });
      throw new Error('Servicio de autenticación no disponible');
    }
  }

  /**
   * Limpiar tokens expirados de blacklist
   */
  async cleanup(): Promise<number> {
    try {
      const count = await this.revokedTokenRepository.pruneExpired();
      logger.info('Token blacklist cleaned up', { removed: count });
      return count;
    } catch (error) {
      logger.error('Error cleaning up blacklist', { error });
      return 0;
    }
  }

  /**
   * Revocar todos los tokens de un usuario
   */
  async revokeAllByUserId(userId: string): Promise<number> {
    try {
      const count = await this.revokedTokenRepository.revokeAllByUser(userId);
      logger.info('All tokens revoked for user', { userId, revoked: count });
      return count;
    } catch (error) {
      logger.error('Error revoking tokens for user', { error, userId });
      return 0;
    }
  }
}
