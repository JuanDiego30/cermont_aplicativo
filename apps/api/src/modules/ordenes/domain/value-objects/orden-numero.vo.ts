/**
 * @valueObject OrdenNumero
 * @description Value Object que representa el número único de una orden
 * @layer Domain
 */
export class OrdenNumero {
  private static readonly PATTERN = /^ORD-\d{6}$/;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  get value(): string {
    return this._value;
  }

  static create(sequence: number): OrdenNumero {
    const numero = `ORD-${String(sequence).padStart(6, "0")}`;
    return new OrdenNumero(numero);
  }

  static fromString(value: string): OrdenNumero | null {
    if (!OrdenNumero.PATTERN.test(value)) {
      return null;
    }
    return new OrdenNumero(value);
  }

  static isValid(value: string): boolean {
    return OrdenNumero.PATTERN.test(value);
  }

  getSequence(): number {
    const match = this._value.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  equals(other: OrdenNumero): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
