/**
 * Entidad: Refresh Token
 * Representa un token de refresco válido y rastreador de estados
 */
export interface RefreshToken {
  /** ID único */
  id: string;

  /** Token JWT */
  token: string;

  /** ID del usuario */
  userId: string;

  /** ID de la familia de tokens (para rotación) */
  family: string;

  /** Indica si está revocado */
  isRevoked: boolean;

  /** Dirección IP desde la que se emitió */
  ipAddress?: string;

  /** User-Agent asociado a este token */
  userAgent?: string;

  /** Fecha de expiración */
  expiresAt: Date;

  /** Fecha de creación */
  createdAt: Date;

  /** Fecha de última actualización */
  updatedAt: Date;

  /** Fecha en que se usó por última vez */
  lastUsedAt?: Date;
}