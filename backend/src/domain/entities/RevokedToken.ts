/**
 * Entidad: Token Revocado
 * Representa un token que ha sido invalidado antes de su expiración natural.
 */
export interface RevokedToken {
  id: string;
  
  /** 
   * Identificador único del token (JTI claim).
   * Se usa para verificar si un token está en blacklist.
   * Opcional en create - se puede derivar de tokenIdentifier.
   */
  jti?: string;

  /**
   * Alias para jti (compatibilidad con código legacy).
   */
  tokenIdentifier?: string;
  
  /** 
   * Fecha de expiración original del token.
   * Permite limpiar la blacklist automáticamente.
   */
  expiresAt: Date;
  
  /** 
   * Fecha en que se creó el registro / fecha de revocación.
   * Opcional en create - se genera automáticamente.
   */
  createdAt?: Date;
  revokedAt?: Date;
  
  /** 
   * Razón de la revocación (logout, cambio de contraseña, etc.)
   */
  reason?: string;

  /**
   * ID del usuario al que pertenecía el token.
   */
  userId: string;
  
  /**
   * Tipo de token (access, refresh).
   */
  type?: string;
}