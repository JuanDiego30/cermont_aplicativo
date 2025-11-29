/**
 * Entidad: Refresh Token
 * Gestiona la sesión de larga duración y la rotación de tokens.
 * Implementa detección de robo mediante familias de tokens.
 */
export interface RefreshToken {
  id: string;

  /** 
   * Hash del token real para almacenamiento seguro.
   * Nunca guardar el token JWT en texto plano.
   * Opcional en create - puede derivarse de token.
   */
  tokenHash?: string;
  
  /**
   * Alias para tokenHash (compatibilidad).
   */
  token?: string;

  userId: string;

  /** 
   * Identificador de familia para rotación de tokens (Reuse Detection).
   * Si un token de una familia vieja se usa, se invalida toda la familia.
   */
  familyId: string;

  isRevoked: boolean;

  /** Metadatos de seguridad y origen */
  ipAddress?: string;
  userAgent?: string;

  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  /** Auditoría de uso */
  lastUsedAt?: Date;
  
  /** Número de generación (para rotación legacy) */
  generationNumber?: number;
  
  /** Información adicional de revocación */
  revokedAt?: Date;
  revokedReason?: string;
  deviceInfo?: string;
  lastIpAddress?: string;
}
