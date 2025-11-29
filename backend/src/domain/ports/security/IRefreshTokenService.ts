import type { RefreshToken } from '../../entities/RefreshToken.js';

/**
 * Port: Refresh Token Service
 * Define la interfaz para la gestión de tokens de refresh.
 */
export interface IRefreshTokenService {
  /**
   * Crea un nuevo refresh token.
   */
  create(data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshToken>;

  /**
   * Busca un token por su hash.
   */
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

  /**
   * Revoca todos los tokens de una familia.
   */
  revokeFamily(familyId: string): Promise<void>;

  /**
   * Revoca todos los tokens de un usuario.
   */
  revokeAllByUser(userId: string): Promise<void>;

  /**
   * Elimina tokens expirados.
   */
  pruneExpired(): Promise<number>;

  /**
   * Verifica si un token está revocado.
   */
  isRevoked(tokenHash: string): Promise<boolean>;
}
