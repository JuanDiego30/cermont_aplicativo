import type { TokenBlacklist, TokenType } from '../entities/TokenBlacklist';

/**
 * Estadísticas de la blacklist
 * @interface TokenBlacklistStats
 */
export interface TokenBlacklistStats {
  /** Total de tokens invalidos */
  total: number;
  /** Distribución por tipo */
  byType: Record<TokenType, number>;
  /** Tokens expirados que pueden eliminarse */
  expired: number;
}

/**
 * Repositorio: Token Blacklist
 * Contrato para persistencia de tokens invalidos (access y refresh)
 * @interface ITokenBlacklistRepository
 * @since 1.0.0
 */
export interface ITokenBlacklistRepository {
  /**
   * Crea un registro en la blacklist
   * @param {Omit<TokenBlacklist, 'id' | 'createdAt'>} data - Datos del token sin createdAt
   * @returns {Promise<TokenBlacklist>} Token invalidado con createdAt generado por Mongo
   */
  create(data: Omit<TokenBlacklist, 'id' | 'createdAt'>): Promise<TokenBlacklist>;

  /**
   * Busca un token en la blacklist
   * @param {string} token - Token JWT
   * @returns {Promise<TokenBlacklist | null>} Token encontrado o null
   */
  findByToken(token: string): Promise<TokenBlacklist | null>;

  /**
   * Agrega un token a la blacklist (helper sobre create())
   * @param {string} token - Token JWT
   * @param {string} userId - ID del usuario
   * @param {TokenType} type - Tipo de token (ACCESS o REFRESH)
   * @param {Date} expiresAt - Fecha de expiración original
   * @returns {Promise<TokenBlacklist>} Token agregado
   */
  addToken(token: string, userId: string, type: TokenType, expiresAt: Date): Promise<TokenBlacklist>;

  /**
   * Verifica si un token está en la blacklist
   * @param {string} token - Token JWT
   * @returns {Promise<boolean>} True si está invalidado
   */
  isBlacklisted(token: string): Promise<boolean>;

  /**
   * Busca tokens blacklisteados de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<TokenBlacklist[]>} Lista ordenada por createdAt
   */
  findByUser(userId: string): Promise<TokenBlacklist[]>;

  /**
   * Busca tokens blacklisteados por tipo
   * @param {TokenType} type - Tipo de token
   * @returns {Promise<TokenBlacklist[]>} Lista ordenada por createdAt
   */
  findByType(type: TokenType): Promise<TokenBlacklist[]>;

  /**
   * Cuenta tokens blacklisteados de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Cantidad de tokens
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Elimina tokens expirados
   * @returns {Promise<number>} Cantidad eliminada
   */
  deleteExpired(): Promise<number>;

  /**
   * Elimina todos los tokens blacklisteados de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<number>} Cantidad eliminada
   */
  deleteByUser(userId: string): Promise<number>;

  /**
   * Obtiene estadísticas de la blacklist
   * @returns {Promise<TokenBlacklistStats>} Métricas para monitoreo
   */
  getStats(): Promise<TokenBlacklistStats>;
}