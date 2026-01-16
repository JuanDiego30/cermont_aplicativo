/**
 * Value Object: FormTemplateId
 *
 * Identificador único de un template de formulario
 */

import { randomUUID } from 'node:crypto';
import { ValidationError } from '../../../../shared/domain/exceptions';

export class FormTemplateId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim() === '') {
      throw new ValidationError('FormTemplateId cannot be empty');
    }
    Object.freeze(this);
  }

  public static create(value: string): FormTemplateId {
    return new FormTemplateId(value);
  }

  public static generate(): FormTemplateId {
    // Usar UUID v4
    return new FormTemplateId(randomUUID());
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: FormTemplateId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
