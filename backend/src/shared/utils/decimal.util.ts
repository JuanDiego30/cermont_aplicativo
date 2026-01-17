import Decimal from 'decimal.js';

export type DecimalValue = Decimal;

export function toDecimal(value: string | number): Decimal {
  return new Decimal(value);
}

export function fromDecimal(value: Decimal): number {
  return value.toNumber();
}

export function isDecimal(value: unknown): value is Decimal {
  return Decimal.isDecimal(value);
}

export { Decimal };
