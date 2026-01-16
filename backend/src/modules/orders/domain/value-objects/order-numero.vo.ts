/**
 * @valueObject OrderNumero
 * @description Value Object que representa el número único de una Order
 * @layer Domain
 */
export class OrderNumero {
  private static readonly PATTERN = /^ORD-\d{6}$/;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  static create(sequence: number): OrderNumero {
    const numero = `ORD-${String(sequence).padStart(6, "0")}`;
    return new OrderNumero(numero);
  }

  static fromString(value: string): OrderNumero | null {
    if (!OrderNumero.PATTERN.test(value)) {
      return null;
    }
    return new OrderNumero(value);
  }

  static isValid(value: string): boolean {
    return OrderNumero.PATTERN.test(value);
  }

  getSequence(): number {
    const match = this._value.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  equals(other: OrderNumero): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
