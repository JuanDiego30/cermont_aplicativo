import bcrypt from 'bcrypt';

// Interfaz local para el servicio de hashing
interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

const DEFAULT_SALT_ROUNDS = 12; // Aumentado a 12 para mayor seguridad en 2025

export class PasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || DEFAULT_SALT_ROUNDS;
  }

  /**
   * Hashea una contraseña de forma segura.
   * @param password Texto plano
   * @returns Hash bcrypt
   */
  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error('Error generating password hash');
    }
  }

  /**
   * Compara texto plano con hash.
   * @param plainPassword Texto plano
   * @param hashedPassword Hash almacenado
   */
  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      // Si el hash es inválido o corrupto, retornamos false por seguridad en vez de romper el flujo
      return false;
    }
  }

  /**
   * Alias para cumplir con la interfaz definida en algunos UseCases antiguos
   * (si la interfaz define 'verify' en lugar de 'compare')
   */
  async verify(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return this.compare(plainPassword, hashedPassword);
  }
}

export const passwordHasher = new PasswordHasher();
