import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio centralizado para manejo de contraseñas
 * Aplica REGLA 1: NO DUPLICAR CÓDIGO
 * Aplica REGLA 9: INYECCIÓN DE DEPENDENCIAS
 */
@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12; // OWASP recommendation

  constructor(private readonly configService: ConfigService) {}

  /**
   * Hashea contraseña con bcryptjs
   * @param password Contraseña en texto plano
   * @returns Hash seguro
   */
  async hash(password: string): Promise<string> {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? this.SALT_ROUNDS;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compara contraseña en texto plano con hash
   * @param plain Contraseña en texto plano
   * @param hashed Hash almacenado
   * @returns true si coinciden
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Valida fortaleza de contraseña
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Máximo 128 caracteres
   * - Al menos 1 mayúscula
   * - Al menos 1 minúscula
   * - Al menos 1 número
   * - Al menos 1 carácter especial
   */
  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (password.length > 128) errors.push('Máximo 128 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Requiere mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Requiere minúscula');
    if (!/\d/.test(password)) errors.push('Requiere número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Requiere carácter especial');

    return { isValid: errors.length === 0, errors };
  }
}
