/**
 * Entidad: Password Reset Token
 * Token para recuperación de contraseña olvidada.
 * El token se envía por correo electrónico al usuario.
 */
export interface PasswordResetToken {
  id: string;

  /**
   * Token único de recuperación (generado con crypto.randomBytes).
   * Se envía como parte del enlace de recuperación.
   */
  token: string;

  /**
   * ID del usuario asociado.
   */
  userId: string;

  /**
   * Email del usuario (denormalizado para búsquedas rápidas).
   */
  email: string;

  /**
   * Fecha de expiración del token.
   * Típicamente 1-24 horas después de la creación.
   */
  expiresAt: Date;

  /**
   * Fecha en que se usó el token.
   * null si aún no se ha usado.
   */
  usedAt: Date | null;

  /**
   * Fecha de creación.
   */
  createdAt: Date;
}

/**
 * Verifica si un token de recuperación es válido.
 */
export function isValidResetToken(token: PasswordResetToken): boolean {
  // No ha sido usado
  if (token.usedAt !== null) {
    return false;
  }

  // No ha expirado
  if (new Date() > token.expiresAt) {
    return false;
  }

  return true;
}
