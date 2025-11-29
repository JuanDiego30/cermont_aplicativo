/**
 * Tipos de token revocables
 */
export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

/**
 * Entidad: Token Revocado
 * Registro de un token invalidado antes de su expiración natural.
 * Usado para Logout forzado o rotación de seguridad.
 */
export interface RevokedToken {
  id: string;

  /** 
   * Identificador único del token (JTI claim) o Hash del token.
   * Es más eficiente buscar por JTI que por el token completo.
   */
  tokenIdentifier: string;

  userId: string;
  type: TokenType;

  /** 
   * Fecha de expiración original.
   * Crítico: Este registro puede eliminarse automáticamente después de esta fecha.
   */
  expiresAt: Date;

  /** Auditoría de revocación */
  revokedAt: Date;
  revokedBy?: string; // 'SYSTEM', 'ADMIN', o userId
  reason?: string;    // 'LOGOUT', 'ROTATION', 'SECURITY_BREACH'

  /** Contexto de la solicitud de revocación */
  ipAddress?: string;
  userAgent?: string;
}

