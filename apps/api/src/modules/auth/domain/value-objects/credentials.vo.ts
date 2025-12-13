/**
 * @valueObject Credentials
 * @description Value Object que representa credenciales de autenticación
 * @layer Domain
 */
import * as bcrypt from 'bcryptjs';

export class Credentials {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly MIN_PASSWORD_LENGTH = 6;

  private constructor(
    private readonly _email: string,
    private readonly _password: string,
    private readonly _isHashed: boolean = false,
  ) {
    Object.freeze(this);
  }

  get email(): string {
    return this._email;
  }

  get password(): string {
    return this._password;
  }

  get isHashed(): boolean {
    return this._isHashed;
  }

  static create(email: string, password: string): Credentials {
    const normalizedEmail = email.trim().toLowerCase();

    if (!Credentials.EMAIL_REGEX.test(normalizedEmail)) {
      throw new Error('Email inválido');
    }

    if (password.length < Credentials.MIN_PASSWORD_LENGTH) {
      throw new Error(`La contraseña debe tener al menos ${Credentials.MIN_PASSWORD_LENGTH} caracteres`);
    }

    return new Credentials(normalizedEmail, password, false);
  }

  static fromHashed(email: string, hashedPassword: string): Credentials {
    return new Credentials(email.trim().toLowerCase(), hashedPassword, true);
  }

  async hash(rounds: number = 12): Promise<Credentials> {
    if (this._isHashed) {
      return this;
    }
    const hashed = await bcrypt.hash(this._password, rounds);
    return new Credentials(this._email, hashed, true);
  }

  async verify(plainPassword: string): Promise<boolean> {
    if (!this._isHashed) {
      return this._password === plainPassword;
    }
    return bcrypt.compare(plainPassword, this._password);
  }

  static validateEmail(email: string): boolean {
    return Credentials.EMAIL_REGEX.test(email.trim().toLowerCase());
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < Credentials.MIN_PASSWORD_LENGTH) {
      errors.push(`Mínimo ${Credentials.MIN_PASSWORD_LENGTH} caracteres`);
    }

    return { valid: errors.length === 0, errors };
  }

  equals(other: Credentials): boolean {
    return this._email === other._email;
  }
}
