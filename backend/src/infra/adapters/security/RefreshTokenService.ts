import { randomBytes, createHash } from 'crypto';
import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import type { RefreshTokenServiceInterface } from '../../../domain/services/AuthService.js';
import { logger } from '../../../shared/utils/logger.js';

/**
 * ========================================
 * REFRESH TOKEN SERVICE
 * ========================================
 * Servicio de gestión de refresh tokens con rotación automática y detección de reuso.
 */
export class RefreshTokenService implements RefreshTokenServiceInterface {
  private readonly REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días

  constructor(private readonly refreshTokenRepository: IRefreshTokenRepository) {}

  /**
   * Implementación de la interfaz RefreshTokenServiceInterface
   * Crea un token y retorna tanto el token como su hash
   */
  async createToken(userId: string): Promise<{ token: string; hash: string }> {
    const token = await this.generate(userId);
    const hash = this.hashToken(token);
    return { token, hash };
  }

  /**
   * Implementación de la interfaz RefreshTokenServiceInterface
   * Valida y rota un refresh token
   */
  async validateAndRotate(token: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const tokenData = await this.refreshTokenRepository.findByTokenHash(token);
      if (!tokenData || tokenData.isRevoked || tokenData.expiresAt < new Date()) {
        return null;
      }
      // Rotar el token
      const newToken = await this.rotate(token, tokenData.userId);
      // Nota: El accessToken debería ser generado por el JWTService en AuthService
      // Aquí retornamos placeholder que será reemplazado por el caller
      return { accessToken: '', refreshToken: newToken };
    } catch {
      return null;
    }
  }

  /**
   * Implementación de la interfaz RefreshTokenServiceInterface
   * Revoca todos los tokens de un usuario
   */
  async revokeUserTokens(userId: string): Promise<void> {
    await this.revokeAllUserTokens(userId);
  }

  /**
   * Hash helper para tokens
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Genera un nuevo refresh token para un usuario (Login inicial)
   */
  async generate(userId: string): Promise<string> {
    try {
      const token = this.generateTokenString();
      const familyId = this.generateFamily();
      const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL);

      // En un escenario real, aquí se debería hashear el token antes de guardarlo
      // const tokenHash = await this.hashToken(token);

      await this.refreshTokenRepository.create({
        token, // O tokenHash
        userId,
        familyId,
        expiresAt,
        isRevoked: false,
        generationNumber: 1
      });

      logger.info('Refresh token generated', { userId, familyId });
      return token;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      logger.error('Error generating refresh token', { error: msg, userId });
      throw new Error('Error al generar refresh token');
    }
  }

  /**
   * Rota un refresh token (Refresh Flow)
   * Implementa detección de reuso: Si el token ya fue usado/revocado, invalida toda la familia.
   */
  async rotate(oldToken: string, userId: string): Promise<string> {
    try {
      // Buscar token anterior
      const oldTokenData = await this.refreshTokenRepository.findByTokenHash(oldToken);

      // 1. Detección de Reuso / Robo
      if (!oldTokenData) {
        // Si no encontramos el token pero el cliente dice tenerlo, es sospechoso.
        // Podríamos intentar buscar por familia si el cliente la envía, 
        // pero por seguridad asumimos compromiso si es crítico.
        logger.warn('Suspicious refresh attempt with unknown token', { userId });
        throw new Error('Token inválido');
      }

      // Si el token existe pero ya estaba revocado o usado -> ALERTA DE ROBO
      if (oldTokenData.isRevoked) {
        logger.error('Security Alert: Reuse of revoked token detected. Invalidating family.', { 
          userId, 
          familyId: oldTokenData.familyId 
        });
        await this.refreshTokenRepository.revokeFamily(oldTokenData.familyId);
        throw new Error('Token reutilizado - Sesión invalidada por seguridad');
      }

      if (oldTokenData.userId !== userId) {
        throw new Error('Token no pertenece al usuario');
      }

      // 2. Rotación Normal
      // Revocar el token anterior (lo marcamos como usado)
      await this.refreshTokenRepository.revokeToken(oldToken);

      // Generar nuevo token en la misma familia
      const newToken = this.generateTokenString();
      const expiresAt = new Date(Date.now() + this.REFRESH_TOKEN_TTL);

      await this.refreshTokenRepository.create({
        tokenHash: newToken,
        userId,
        familyId: oldTokenData.familyId,
        expiresAt,
        isRevoked: false
      });

      logger.info('Refresh token rotated', { userId, familyId: oldTokenData.familyId });
      return newToken;

    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown';
      logger.error('Error rotating refresh token', { error: msg, userId });
      throw error; // Re-lanzar para que el controlador maneje el 401/403
    }
  }

  /**
   * Valida un refresh token sin rotarlo
   */
  async validate(token: string, userId: string): Promise<boolean> {
    try {
      const tokenData = await this.refreshTokenRepository.findByTokenHash(token);

      if (!tokenData) return false;

      const isValid = tokenData.userId === userId &&
                      !tokenData.isRevoked &&
                      tokenData.expiresAt > new Date();

      return isValid;
    } catch (error) {
      logger.error('Error validating refresh token', { error });
      return false;
    }
  }

  /**
   * Revoca un token específico
   */
  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.revokeToken(token);
    logger.info('Refresh token revoked manually');
  }

  /**
   * Revoca todas las sesiones de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const count = await this.refreshTokenRepository.revokeAllByUser(userId);
    logger.info('All user refresh tokens revoked', { userId, count });
    return count;
  }

  /**
   * Limpieza periódica
   */
  async cleanup(): Promise<number> {
    const count = await this.refreshTokenRepository.pruneExpired();
    logger.info('Expired refresh tokens cleaned up', { count });
    return count;
  }

  // --- Helpers Privados ---

  private generateTokenString(): string {
    return randomBytes(32).toString('hex');
  }

  private generateFamily(): string {
    return randomBytes(16).toString('hex');
  }
}
