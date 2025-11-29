import type { RevokedToken } from '../entities/RevokedToken.js'; // Nombre actualizado

/**
 * Repositorio: Tokens Revocados (Blacklist)
 * Almacenamiento temporal de tokens invalidados hasta su expiración natural.
 * Ideal para Redis o caché en memoria.
 */
export interface IRevokedTokenRepository {
  /**
   * Registra un token revocado.
   * Si ya existe, debería ser idempotente.
   */
  create(data: Omit<RevokedToken, 'id' | 'revokedAt'>): Promise<RevokedToken>;

  /**
   * Verifica si un token está revocado.
   * Operación crítica de alto rendimiento.
   * @param tokenIdentifier JTI o Hash del token
   */
  isRevoked(tokenIdentifier: string): Promise<boolean>;

  /**
   * Limpieza de tokens cuya fecha de expiración original ya pasó.
   * (Una vez expirado, el token es inválido por sí mismo, no necesita estar en blacklist).
   */
  pruneExpired(): Promise<number>;

  // --- Métodos de soporte / Auditoría ---

  findByUser(userId: string): Promise<RevokedToken[]>;

  /**
   * Revoca masivamente tokens de un usuario (si el backend soporta revocación por patrón).
   * Útil para "Cerrar sesión en todos los dispositivos".
   */
  revokeAllByUser(userId: string): Promise<number>;
}
