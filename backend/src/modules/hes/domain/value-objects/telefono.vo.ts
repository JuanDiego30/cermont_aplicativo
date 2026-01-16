/**
 * Value Object: Telefono
 *
 * Número de teléfono con validación
 */

import { ValidationError } from '../../../../shared/domain/exceptions';

export class Telefono {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static create(value: string): Telefono {
    Telefono.validate(value);
    return new Telefono(value);
  }

  private static validate(value: string): void {
    if (!value || value.trim() === '') {
      throw new ValidationError('Teléfono no puede estar vacío');
    }

    // Remover espacios, guiones, paréntesis
    const cleaned = value.replace(/[\s\-\(\)]/g, '');

    // Validar formato colombiano: 10 dígitos o +57 seguido de 10 dígitos
    const colombianPattern = /^(\+57)?[0-9]{10}$/;
    if (!colombianPattern.test(cleaned)) {
      throw new ValidationError(
        `Formato de teléfono inválido: ${value}. Debe ser un número de 10 dígitos o +57 seguido de 10 dígitos`
      );
    }
  }

  public getValue(): string {
    return this._value;
  }

  public getFormatted(): string {
    const cleaned = this._value.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+57')) {
      const number = cleaned.substring(3);
      return `+57 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
    const number = cleaned;
    return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
  }

  public equals(other: Telefono): boolean {
    const thisCleaned = this._value.replace(/[\s\-\(\)]/g, '');
    const otherCleaned = other._value.replace(/[\s\-\(\)]/g, '');
    return thisCleaned === otherCleaned;
  }

  public toString(): string {
    return this._value;
  }
}
