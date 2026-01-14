/**
 * @valueObject Password
 *
 * Password como Value Object con reglas de seguridad.
 * Encapsula hashing y validación de fortaleza.
 */

import { hash, compare } from "bcryptjs";
import { ValidationError } from "../exceptions";

export interface PasswordStrengthResult {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
}

export class Password {
  private readonly hashedValue: string;

  private static readonly SALT_ROUNDS = 12; // OWASP recomienda mínimo 12
  private static readonly MIN_LENGTH = 8;

  private constructor(hashedPassword: string) {
    this.hashedValue = hashedPassword;
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Crea password desde texto plano (para nuevos usuarios)
   * @throws Error si no cumple requisitos de seguridad
   */
  static async createFromPlainText(plainPassword: string): Promise<Password> {
    const validation = this.validatePasswordStrength(plainPassword);

    if (!validation.isValid) {
      throw new ValidationError(
        validation.feedback.join(". "),
        "password",
        "[PROTECTED]",
      );
    }

    const hashed = await hash(plainPassword, this.SALT_ROUNDS);
    return new Password(hashed);
  }

  /**
   * Crea password desde hash existente (reconstitución desde DB)
   */
  static fromHash(hashedPassword: string): Password {
    if (!hashedPassword || hashedPassword.length < 20) {
      throw new ValidationError("Hash de password inválido", "passwordHash");
    }
    return new Password(hashedPassword);
  }

  /**
   * Valida fortaleza de password
   */
  static validatePasswordStrength(password: string): PasswordStrengthResult {
    const feedback: string[] = [];
    let score = 0;

    if (!password) {
      return {
        isValid: false,
        score: 0,
        feedback: ["La contraseña es requerida"],
      };
    }

    // Longitud mínima
    if (password.length < this.MIN_LENGTH) {
      feedback.push(`Debe tener al menos ${this.MIN_LENGTH} caracteres`);
    } else {
      score++;
    }

    // Mayúsculas
    const hasUpperCase = /[A-Z]/.test(password);
    if (!hasUpperCase) {
      feedback.push("Debe contener al menos una mayúscula");
    } else {
      score++;
    }

    // Minúsculas
    const hasLowerCase = /[a-z]/.test(password);
    if (!hasLowerCase) {
      feedback.push("Debe contener al menos una minúscula");
    } else {
      score++;
    }

    // Números
    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
      feedback.push("Debe contener al menos un número");
    } else {
      score++;
    }

    // Caracteres especiales (bonus)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasSpecialChar) {
      score++;
    }

    // Se requiere al menos 3 criterios cumplidos
    const isValid = score >= 4;

    return {
      isValid,
      score: Math.min(score, 5),
      feedback: feedback.length > 0 ? feedback : ["Contraseña segura"],
    };
  }

  /**
   * Compara password con texto plano
   */
  async matches(plainPassword: string): Promise<boolean> {
    return compare(plainPassword, this.hashedValue);
  }

  /**
   * Obtiene el hash (para persistencia)
   */
  getHash(): string {
    return this.hashedValue;
  }

  /**
   * Genera una contraseña temporal segura
   */
  static generateTemporary(length: number = 12): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";

    // Asegurar al menos uno de cada tipo
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Completar longitud
    for (let i = password.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Mezclar caracteres
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * NO exponer valor hasheado en logs/JSON
   */
  toString(): string {
    return "[PROTECTED]";
  }

  toJSON(): string {
    return "[PROTECTED]";
  }

  /**
   * Para serializar a BD (alias de getHash)
   */
  toPersistence(): string {
    return this.hashedValue;
  }
}
