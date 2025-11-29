import type { RevokedToken } from '../entities/RevokedToken.js';

/**
 * Interfaz del repositorio de tokens revocados.
 * 
 * Maneja la persistencia de tokens JWT que han sido explícitamente invalidados
 * (por logout, revocación manual, etc.).
 */
export interface IRevokedTokenRepository {
  /**
   * Registra un token como revocado.
   * Acepta jti o tokenIdentifier como identificador.
   */
  create(data: Omit<RevokedToken, 'id' | 'revokedAt'>): Promise<RevokedToken>;

  /**
   * Verifica si un JTI está en la lista de revocados.
   */
  isRevoked(jti: string): Promise<boolean>;

  /**
   * Elimina tokens expirados (limpieza periódica).
   */
  pruneExpired(): Promise<number>;
  
  /**
   * Alias para pruneExpired (compatibilidad).
   */
  deleteExpired?(): Promise<number>;

  /**
   * Busca todos los tokens revocados de un usuario.
   */
  findByUser(userId: string): Promise<RevokedToken[]>;

  /**
   * Revoca todos los tokens de un usuario.
   */
  revokeAllByUser(userId: string, reason?: string): Promise<number>;
}
