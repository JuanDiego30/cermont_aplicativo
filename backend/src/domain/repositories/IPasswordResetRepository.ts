import type { PasswordResetToken } from '../entities/PasswordResetToken.js';

/**
 * Repositorio: Password Reset Tokens
 * Gestión de tokens para recuperación de contraseña.
 */
export interface IPasswordResetRepository {
  /**
   * Crea un nuevo token de recuperación.
   */
  create(data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'>): Promise<PasswordResetToken>;

  /**
   * Busca un token por su valor.
   */
  findByToken(token: string): Promise<PasswordResetToken | null>;

  /**
   * Busca tokens activos (no usados y no expirados) por email.
   */
  findActiveByEmail(email: string): Promise<PasswordResetToken | null>;

  /**
   * Marca un token como usado.
   */
  markAsUsed(id: string): Promise<void>;

  /**
   * Invalida todos los tokens de un usuario.
   * Útil cuando el usuario cambia la contraseña exitosamente.
   */
  invalidateAllByUser(userId: string): Promise<number>;

  /**
   * Limpia tokens expirados.
   * Para mantenimiento programado.
   */
  cleanupExpired(): Promise<number>;
}
