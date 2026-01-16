/**
 * Value Object: HESId
 *
 * Identificador único de una Hoja de Entrada de Servicio
 */

import { randomUUID } from 'crypto';
import { ValidationError } from '../../../../shared/domain/exceptions';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_REGEX.test(value);

export class HESId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): HESId {
    return new HESId(randomUUID());
  }

  public static create(value: string): HESId {
    if (!value || value.trim() === '') {
      throw new ValidationError('HES ID no puede estar vacío');
    }

    if (!isUuid(value)) {
      throw new ValidationError(`HES ID inválido: ${value}. Debe ser un UUID válido`);
    }

    return new HESId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: HESId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
