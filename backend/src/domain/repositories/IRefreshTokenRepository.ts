import type { RefreshToken } from '../entities/RefreshToken';

/**
 * Estadísticas de los refresh tokens
 * @interface RefreshTokenStats
 */
export interface RefreshTokenStats {
  /** Tokens totales registrados */
  total: number;
  /** Tokens activos (no revocados y no expirados) */
  active: number;
  /** Tokens revocados manualmente */
  revoked: number;
  /** Tokens expirados */
  expired: number;
}

/**
 * Repositorio: Refresh tokens
 * Maneja persistencia, revocación y rotación segura
 * @interface IRefreshTokenRepository
 * @since 1.0.0
 */
export interface IRefreshTokenRepository {
  /**
   * Crea un refresh token
   * @param {Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>} data - Datos del token sin timestamps
   * @returns {Promise<RefreshToken>} Token creado con timestamps asignados por la base de datos
   * @throws {Error} Si la creación falla
   */
  create(data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshToken>;

  /**
   * Busca un refresh token por su string completo
   * @param {string} token - Token JWT
   * @returns {Promise<RefreshToken | null>} Token encontrado o null si no existe
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Revoca un refresh token específico
   * @param {string} token - Token JWT
   * @returns {Promise<boolean>} True si se revocó
   */
  revokeToken(token: string): Promise<boolean>;

  /**
   * Revoca todos los tokens de una familia (rotación segura)
   * @param {string} family - ID de la familia de tokens
   * @returns {Promise<number>} Tokens revocados
   */
  revokeTokenFamily(family: string): Promise<number>;

  /**
   * Revoca todos los tokens de un usuario (logout global/cambio contraseña)
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Tokens revocados
   */
  revokeAllUserTokens(userId: string): Promise<number>;

  /**
   * Lista los tokens activos de un usuario
   * Activo = !isRevoked && expiresAt > now
   * @param {string} userId - ID del usuario
   * @returns {Promise<RefreshToken[]>} Tokens activos
   */
  findActiveByUser(userId: string): Promise<RefreshToken[]>;

  /**
   * Cuenta los tokens activos de un usuario (para limitar sesiones)
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Tokens activos
   */
  countActiveByUser(userId: string): Promise<number>;

  /**
   * Elimina tokens expirados o revocados (limpieza periódica)
   * @returns {Promise<number>} Cantidad eliminada
   */
  deleteExpired(): Promise<number>;

  /**
   * Estadísticas agregadas de los refresh tokens
   * @returns {Promise<RefreshTokenStats>} Estadísticas para dashboards
   */
  getStats(): Promise<RefreshTokenStats>;
}