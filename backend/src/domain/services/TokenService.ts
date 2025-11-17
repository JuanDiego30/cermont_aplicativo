import type { ITokenBlacklistRepository } from '../repositories/ITokenBlacklistRepository';
import type { IRefreshTokenRepository } from '../repositories/IRefreshTokenRepository';
import { TokenType } from '../entities/TokenBlacklist';
import type { RefreshToken } from '../entities/RefreshToken';
import { jwtService } from '@/shared/security/jwtService';
import { generateUniqueId } from '@/shared/utils/generateUniqueId';

/**
 * Resultado de limpieza de tokens expirados
 * @interface CleanupResult
 */
export interface CleanupResult {
  /** Tokens eliminados de la blacklist */
  blacklistCleaned: number;
  /** Refresh tokens eliminados */
  refreshTokensCleaned: number;
}

/**
 * Interface: Servicio de gestión de tokens
 * Contrato para el servicio que maneja blacklist y refresh tokens
 * @interface ITokenService
 * @since 1.0.0
 */
export interface ITokenService {
  /**
   * Agrega un token a la blacklist
   * @param {string} token - Token JWT
   * @param {string} userId - ID del usuario
   * @param {TokenType} type - Tipo de token
   * @param {Date} expiresAt - Fecha de expiración
   * @returns {Promise<void>}
   * @throws {Error} Si falla la operación
   */
  blacklistToken(
    token: string,
    userId: string,
    type: TokenType,
    expiresAt: Date
  ): Promise<void>;

  /**
   * Verifica si un token está en la blacklist
   * @param {string} token - Token JWT
   * @returns {Promise<boolean>} True si está blacklisteado
   */
  isTokenBlacklisted(token: string): Promise<boolean>;

  /**
   * Guarda un refresh token
   * @param {string} token - Token JWT
   * @param {string} userId - ID del usuario
   * @param {string} family - ID de la familia de tokens
   * @param {Date} expiresAt - Fecha de expiración
   * @returns {Promise<void>}
   * @throws {Error} Si falla la operación
   */
  saveRefreshToken(
    token: string,
    userId: string,
    family: string,
    expiresAt: Date,
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<void>;

  generateAccessToken(payload: { userId: string; email: string; role: string }): Promise<string>;

  generateRefreshToken(
    payload: { userId: string; email: string; role: string },
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<string>;

  /**
   * Verifica si un refresh token es válido
   * @param {string} token - Token JWT
   * @param {string} userId - ID del usuario
   * @returns {Promise<boolean>} True si es válido
   */
  isRefreshTokenValid(token: string, userId: string): Promise<boolean>;

  /**
   * Obtiene un refresh token
   * @param {string} token - Token JWT
   * @returns {Promise<RefreshToken | null>} Token o null
   */
  getRefreshToken(token: string): Promise<RefreshToken | null>;

  /**
   * Revoca un refresh token
   * @param {string} token - Token JWT
   * @returns {Promise<boolean>} True si se revocó correctamente
   * @throws {Error} Si falla la operación
   */
  revokeRefreshToken(token: string): Promise<boolean>;

  /**
   * Revoca todos los tokens de una familia
   * @param {string} family - ID de la familia
   * @returns {Promise<number>} Cantidad de tokens revocados
   * @throws {Error} Si falla la operación
   */
  revokeTokenFamily(family: string): Promise<number>;

  /**
   * Revoca todos los refresh tokens de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de tokens revocados
   * @throws {Error} Si falla la operación
   */
  revokeAllUserRefreshTokens(userId: string): Promise<number>;

  /**
   * Limpia tokens expirados
   * @returns {Promise<CleanupResult>} Resultado de la limpieza
   * @throws {Error} Si falla la operación
   */
  cleanupExpiredTokens(): Promise<CleanupResult>;
}

/**
 * Servicio: Gestión de tokens
 * Maneja blacklist, refresh tokens y rotación de tokens (Token Family)
 * @class TokenService
 * @implements {ITokenService}
 * @since 1.0.0
 */
export class TokenService implements ITokenService {
  constructor(
    private readonly tokenBlacklistRepository: ITokenBlacklistRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  private readonly refreshTtl = process.env.JWT_REFRESH_TTL || '7d';

  /**
   * Agrega un token a la blacklist (logout o revocación)
   * @param {string} token - Token JWT completo
   * @param {string} userId - ID del usuario propietario
   * @param {TokenType} type - Tipo de token (ACCESS o REFRESH)
   * @param {Date} expiresAt - Fecha de expiración original del token
   * @returns {Promise<void>}
   * @throws {Error} Si falla la operación de blacklist
   */
  async blacklistToken(
    token: string,
    userId: string,
    type: TokenType,
    expiresAt: Date
  ): Promise<void> {
    try {
      await this.tokenBlacklistRepository.addToken(token, userId, type, expiresAt);

      console.info(`[TokenService] ✅ Token blacklisted: user=${userId}, type=${type}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error blacklisting token: ${errorMessage}`, {
        userId,
        type,
        error,
      });

      throw new Error('Error al invalidar el token');
    }
  }

  /**
   * Verifica si un token está en la blacklist
   * @param {string} token - Token JWT completo
   * @returns {Promise<boolean>} True si está blacklisteado, false en caso contrario
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      return await this.tokenBlacklistRepository.isBlacklisted(token);
    } catch (error) {
      console.error('[TokenService] ❌ Error checking blacklist:', error);

      // Por seguridad, en caso de error asumimos que está blacklisteado
      return true;
    }
  }

  /**
   * Guarda un refresh token en el repositorio
   * @param {string} token - Token JWT firmado
   * @param {string} userId - ID del usuario
   * @param {string} family - ID de la familia de tokens (Token Family)
   * @param {Date} expiresAt - Fecha de expiración del token
   * @returns {Promise<void>}
   * @throws {Error} Si falla la operación de guardado
   */
  async saveRefreshToken(
    token: string,
    userId: string,
    family: string,
    expiresAt: Date,
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<void> {
    try {
      await this.refreshTokenRepository.create({
        token,
        userId,
        family,
        isRevoked: false,
        expiresAt,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined,
      });

      console.info(`[TokenService] ✅ Refresh token saved: user=${userId}, family=${family}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error saving refresh token: ${errorMessage}`, {
        userId,
        family,
        error,
      });

      throw new Error('Error al guardar el refresh token');
    }
  }

  async generateAccessToken(payload: { userId: string; email: string; role: string }): Promise<string> {
    return jwtService.generateAccessToken(payload);
  }

  async generateRefreshToken(
    payload: { userId: string; email: string; role: string },
    ipAddress?: string | null,
    userAgent?: string | null
  ): Promise<string> {
    const token = await jwtService.generateRefreshToken(payload);
    const familyId = generateUniqueId();
    const expiresAt = new Date(Date.now() + this.parseTtlToMs(this.refreshTtl));

    await this.saveRefreshToken(token, payload.userId, familyId, expiresAt, ipAddress, userAgent);

    return token;
  }

  private parseTtlToMs(ttl: string): number {
    const normalized = ttl.trim().toLowerCase();
    const match = /^([0-9]+)(ms|s|m|h|d)?$/.exec(normalized);
    if (!match) return 0;

    const value = Number(match[1]);
    const unit = (match[2] || 'ms').toLowerCase();

    switch (unit) {
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'm':
        return value * 60 * 1000;
      case 's':
        return value * 1000;
      case 'ms':
      default:
        return value;
    }
  }

  /**
   * Verifica si un refresh token es válido
   * Validaciones: pertenece al usuario, no revocado, no expirado
   * @param {string} token - Token JWT completo
   * @param {string} userId - ID del usuario esperado
   * @returns {Promise<boolean>} True si el token es válido
   */
  async isRefreshTokenValid(token: string, userId: string): Promise<boolean> {
    try {
      const found = await this.refreshTokenRepository.findByToken(token);

      if (!found) {
        return false;
      }

      // Validar pertenencia al usuario
      if (found.userId !== userId) {
        console.warn('[TokenService] ⚠️ Token userId mismatch', {
          expected: userId,
          found: found.userId,
        });
        return false;
      }

      // Validar que no esté revocado
      if (found.isRevoked) {
        console.warn('[TokenService] ⚠️ Token is revoked', { userId });
        return false;
      }

      // Validar expiración
      if (new Date() > found.expiresAt) {
        console.warn('[TokenService] ⚠️ Token expired', { userId, expiresAt: found.expiresAt });
        return false;
      }

      return true;
    } catch (error) {
      console.error('[TokenService] ❌ Error validating refresh token:', error);
      return false;
    }
  }

  /**
   * Obtiene un refresh token del repositorio
   * @param {string} token - Token JWT completo
   * @returns {Promise<RefreshToken | null>} Refresh token o null si no existe
   */
  async getRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      return await this.refreshTokenRepository.findByToken(token);
    } catch (error) {
      console.error('[TokenService] ❌ Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Revoca un refresh token (logout individual)
   * @param {string} token - Token JWT completo
   * @returns {Promise<boolean>} True si se revocó correctamente
   * @throws {Error} Si falla la operación de revocación
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      const revoked = await this.refreshTokenRepository.revokeToken(token);

      if (revoked) {
        console.info('[TokenService] ✅ Refresh token revoked');
      } else {
        console.warn('[TokenService] ⚠️ Token not found for revocation');
      }

      return revoked;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error revoking refresh token: ${errorMessage}`, { error });

      throw new Error('Error al revocar el refresh token');
    }
  }

  /**
   * Revoca todos los tokens de una familia (detección de reuso / ataque)
   * Usado cuando se detecta que un token revocado fue reutilizado
   * @param {string} family - ID de la familia de tokens
   * @returns {Promise<number>} Cantidad de tokens revocados
   * @throws {Error} Si falla la operación
   */
  async revokeTokenFamily(family: string): Promise<number> {
    try {
      const count = await this.refreshTokenRepository.revokeTokenFamily(family);

      console.warn(`[TokenService] 🔒 Token family revoked (security): family=${family}, count=${count}`);

      return count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error revoking token family: ${errorMessage}`, {
        family,
        error,
      });

      throw new Error('Error al revocar la familia de tokens');
    }
  }

  /**
   * Revoca todos los refresh tokens de un usuario (logout global)
   * Usado en cambio de contraseña o compromiso de cuenta
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de tokens revocados
   * @throws {Error} Si falla la operación
   */
  async revokeAllUserRefreshTokens(userId: string): Promise<number> {
    try {
      const count = await this.refreshTokenRepository.revokeAllUserTokens(userId);

      console.info(`[TokenService] 🔒 All refresh tokens revoked: user=${userId}, count=${count}`);

      return count;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error revoking all user tokens: ${errorMessage}`, {
        userId,
        error,
      });

      throw new Error('Error al revocar todos los tokens del usuario');
    }
  }

  /**
   * Limpia tokens expirados de ambos repositorios
   * Debe ejecutarse periódicamente (cron job diario recomendado)
   * @returns {Promise<CleanupResult>} Resultado de la limpieza
   * @throws {Error} Si falla la operación
   */
  async cleanupExpiredTokens(): Promise<CleanupResult> {
    try {
      const [blacklistCleaned, refreshTokensCleaned] = await Promise.all([
        this.tokenBlacklistRepository.deleteExpired(),
        this.refreshTokenRepository.deleteExpired(),
      ]);

      console.info(
        `[TokenService] 🧹 Expired tokens cleaned: blacklist=${blacklistCleaned}, refresh=${refreshTokensCleaned}`
      );

      return { blacklistCleaned, refreshTokensCleaned };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[TokenService] ❌ Error cleaning expired tokens: ${errorMessage}`, { error });

      throw new Error('Error al limpiar tokens expirados');
    }
  }
}

