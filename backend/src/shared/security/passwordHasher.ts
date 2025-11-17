import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class PasswordHasher {
  /**
   * Hashea una contraseña usando bcrypt
   */
  async hash(plainPassword: string): Promise<string> {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  /**
   * Verifica si una contraseña coincide con su hash
   */
  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Genera un hash rápido para comparación temporal
   */
  async quickHash(data: string): Promise<string> {
    return await bcrypt.hash(data, 6); // Menos rounds para operaciones rápidas
  }
}

export const passwordHasher = new PasswordHasher();