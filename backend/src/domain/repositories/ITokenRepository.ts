/**
 * Repositorio para gestión de blacklist de tokens
 */
export interface ITokenRepository {
  /**
   * Agrega un token a la blacklist
   * @param token - Token a blacklisted
   * @param userId - ID del usuario
   * @param type - Tipo de token ('access' | 'refresh')
   * @param expiresAt - Fecha de expiración
   */
  blacklistToken(
    token: string,
    userId: string,
    type: 'access' | 'refresh',
    expiresAt: Date
  ): Promise<void>;

  /**
   * Verifica si un token está en la blacklist
   * @param token - Token a verificar
   * @returns true si está blacklisted
   */
  isTokenBlacklisted(token: string): Promise<boolean>;
}