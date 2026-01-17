import DecimalJs from 'decimal.js';

export type DecimalValue = DecimalJs;

export const Decimal = DecimalJs;

export function toDecimal(value: string | number | DecimalJs): DecimalJs {
  return new DecimalJs(value);
}

export function isDecimal(value: unknown): value is DecimalJs {
  return DecimalJs.isDecimal(value);
}

export function fromDecimal(value: DecimalJs): number {
  return value.toNumber();
}
