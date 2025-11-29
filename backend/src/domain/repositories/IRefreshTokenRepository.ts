import type { RefreshToken } from '../entities/RefreshToken.js';

export interface RefreshTokenStats {
  total: number;
  active: number;
  revoked: number;
  expired: number;
}

/**
 * Repositorio: Refresh Tokens
 * Gestión de sesiones persistentes y seguridad de acceso.
 * Debe implementarse sobre un almacén rápido y seguro (ej: Redis o SQL indexado).
 */
export interface IRefreshTokenRepository {
  create(data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshToken>;

  /**
   * Busca un token por su hash seguro.
   * @param tokenHash Hash SHA-256 del token recibido
   */
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;

  /**
   * Busca tokens de una familia específica.
   * Crítico para implementar "Reuse Detection".
   */
  findByFamily(familyId: string): Promise<RefreshToken[]>;

  /**
   * Revoca un token específico por ID.
   */
  revoke(id: string, reason?: string): Promise<void>;

  /**
   * Revoca un token específico buscando por el hash del token.
   * Alternativa a revoke cuando solo se tiene el token, no el ID.
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Revoca toda una familia de tokens (Detección de robo).
   */
  revokeFamily(familyId: string, reason?: string): Promise<number>;

  /**
   * Revoca todos los tokens de un usuario (Logout Global).
   */
  revokeAllByUser(userId: string, reason?: string): Promise<number>;

  /**
   * Obtiene sesiones activas para mostrarlas al usuario.
   */
  findActiveByUser(userId: string): Promise<RefreshToken[]>;

  /**
   * Limpieza de tokens expirados (Job periódico).
   */
  pruneExpired(): Promise<number>;

  /**
   * Métricas de seguridad.
   */
  getStats(): Promise<RefreshTokenStats>;
}
