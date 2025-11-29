/**
 * Servicio de hash de contraseñas
 * Abstracción para operaciones criptográficas de contraseñas.
 */
export interface IPasswordHasher {
  /**
   * Genera un hash seguro de una contraseña.
   */
  hash(password: string): Promise<string>;

  /**
   * Compara una contraseña con su hash.
   */
  compare(password: string, hash: string): Promise<boolean>;

  /**
   * Verifica si un hash necesita ser actualizado (por cambio de algoritmo/rounds).
   */
  needsRehash?(hash: string): boolean;
}
