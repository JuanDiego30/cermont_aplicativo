/**
 * Entidad: Token en Blacklist
 * Representa un token (ACCESS o REFRESH) invalidado de forma explícita
 */
export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
}

export interface TokenBlacklist {
  /** ID único del registro */
  id: string;

  /** Token JWT completo que dejó de ser válido */
  token: string;

  /** ID del usuario dueño del token */
  userId: string;

  /** Tipo de token (access/refresh) */
  type: TokenType;

  /** Fecha de expiración original del token */
  expiresAt: Date;

  /** Fecha en que fue invalidado */
  revokedAt: Date;

  /** Usuario que solicitó la revocación */
  revokedBy?: string;

  /** Motivo o contexto de la revocación */
  reason?: string;

  /** Estado de la lista donde fue registrado */
  createdAt: Date;

  /** Dirección IP desde la que se revocó */
  ipAddress?: string;

  /** User-Agent asociado al token */
  userAgent?: string;
}
