/**
 * Value Object: HESId
 * 
 * Identificador único de una Hoja de Entrada de Servicio
 */

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { ValidationError } from '../../../../common/domain/exceptions';

export class HESId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): HESId {
    return new HESId(uuidv4());
  }

  public static create(value: string): HESId {
    if (!value || value.trim() === '') {
      throw new ValidationError('HES ID no puede estar vacío');
    }

    if (!uuidValidate(value)) {
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

