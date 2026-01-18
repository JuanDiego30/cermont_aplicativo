/**
 * Value Object: CostoId
 *
 * Identificador único de costo (UUID v4)
 */

import { randomUUID } from 'crypto';
import { ValidationError } from '../exceptions';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CostoId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): CostoId {
    return new CostoId(randomUUID());
  }

  public static create(value: string): CostoId {
    if (!value || typeof value !== 'string' || !UUID_REGEX.test(value)) {
      throw new ValidationError('CostoId debe ser un UUID válido', 'costoId', value);
    }
    return new CostoId(value.toLowerCase());
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: CostoId): boolean {
    if (!other || !(other instanceof CostoId)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
