/**
 * Port: Password Hasher
 * Define la interfaz para el hashing de contraseñas.
 */
export interface IPasswordHasher {
  /**
   * Genera un hash de la contraseña.
   */
  hash(password: string): Promise<string>;

  /**
   * Verifica si una contraseña coincide con un hash.
   */
  verify(password: string, hash: string): Promise<boolean>;

  /**
   * Genera un salt para el hashing.
   */
  generateSalt?(): string;
}
