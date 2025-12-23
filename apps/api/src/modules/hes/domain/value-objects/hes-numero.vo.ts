/**
 * Value Object: HESNumero
 * 
 * Número único de HES en formato: HES-YYYY-0001
 * 
 * Ejemplos:
 * - HES-2024-0001
 * - HES-2024-0002
 * - HES-2025-0001
 */

import { ValidationError } from '../../../../common/domain/exceptions';

export class HESNumero {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static create(value: string): HESNumero {
    HESNumero.validate(value);
    return new HESNumero(value);
  }

  public static generate(year: number, sequence: number): HESNumero {
    const numeroStr = `HES-${year}-${sequence.toString().padStart(4, '0')}`;
    return HESNumero.create(numeroStr);
  }

  private static validate(value: string): void {
    if (!value || value.trim() === '') {
      throw new ValidationError('Número HES no puede estar vacío');
    }

    const pattern = /^HES-\d{4}-\d{4}$/;
    if (!pattern.test(value)) {
      throw new ValidationError(
        `Formato de número HES inválido: ${value}. Debe ser HES-YYYY-0000`
      );
    }

    const parts = value.split('-');
    const year = parseInt(parts[1], 10);
    const currentYear = new Date().getFullYear();

    if (year < 2020 || year > currentYear + 1) {
      throw new ValidationError(
        `Año inválido en número HES: ${year}. Debe estar entre 2020 y ${currentYear + 1}`
      );
    }
  }

  public getValue(): string {
    return this._value;
  }

  public getYear(): number {
    const parts = this._value.split('-');
    return parseInt(parts[1], 10);
  }

  public getSequence(): number {
    const parts = this._value.split('-');
    return parseInt(parts[2], 10);
  }

  public equals(other: HESNumero): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

