/**
 * Value Object: FieldValue
 *
 * Valor tipado de un campo de formulario con normalización
 */

export class FieldValue {
  private constructor(private readonly _value: any) {
    Object.freeze(this);
  }

  public static create(value: any): FieldValue {
    const normalized = FieldValue.normalize(value);
    return new FieldValue(normalized);
  }

  private static normalize(value: any): any {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' ? null : trimmed;
    }

    if (typeof value === 'number') {
      if (isNaN(value)) {
        return null;
      }
      return value;
    }

    if (Array.isArray(value)) {
      return value.filter(v => v !== null && v !== undefined && v !== '');
    }

    return value;
  }

  public getValue(): any {
    return this._value;
  }

  public isEmpty(): boolean {
    if (this._value === null || this._value === undefined) {
      return true;
    }

    if (typeof this._value === 'string') {
      return this._value === '';
    }

    if (Array.isArray(this._value)) {
      return this._value.length === 0;
    }

    return false;
  }

  public isNumber(): boolean {
    return typeof this._value === 'number' && !isNaN(this._value);
  }

  public isString(): boolean {
    return typeof this._value === 'string';
  }

  public isArray(): boolean {
    return Array.isArray(this._value);
  }

  public isBoolean(): boolean {
    return typeof this._value === 'boolean';
  }

  public toString(): string {
    if (this._value === null || this._value === undefined) {
      return '';
    }
    if (Array.isArray(this._value)) {
      return this._value.join(', ');
    }
    return String(this._value);
  }
}
