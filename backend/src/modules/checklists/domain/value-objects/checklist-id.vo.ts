/**
 * Value Object: ChecklistId
 *
 * Identificador único de checklist (UUID v4)
 */

import { randomUUID } from 'crypto';
import { ValidationError } from '../exceptions';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ChecklistId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): ChecklistId {
    return new ChecklistId(randomUUID());
  }

  public static create(value: string): ChecklistId {
    if (!value || typeof value !== 'string' || !UUID_REGEX.test(value)) {
      throw new ValidationError('ChecklistId debe ser un UUID válido', 'checklistId', value);
    }
    return new ChecklistId(value.toLowerCase());
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ChecklistId): boolean {
    if (!other || !(other instanceof ChecklistId)) {
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
