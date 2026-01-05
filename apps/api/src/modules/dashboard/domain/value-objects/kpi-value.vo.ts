/**
 * @valueObject KpiValue
 *
 * Representa un valor de KPI tipado con validación y formateo.
 *
 * Invariantes:
 * - Valores no negativos (excepto porcentajes que pueden ser 0-100)
 * - Tipos válidos: NUMBER, MONEY, PERCENTAGE, COUNT
 * - Precisión usando Decimal.js para cálculos financieros
 */

import { Decimal } from "decimal.js";
import { ValidationError } from "../exceptions";

export enum KpiValueType {
  NUMBER = "NUMBER",
  MONEY = "MONEY",
  PERCENTAGE = "PERCENTAGE",
  COUNT = "COUNT",
}

export class KpiValue {
  private constructor(
    private readonly _value: Decimal,
    private readonly _type: KpiValueType,
    private readonly _currency?: string,
  ) {
    Object.freeze(this);
  }

  /**
   * Crea un KPI de tipo número
   */
  public static number(value: number | string | Decimal): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNaN()) {
      throw new ValidationError("KPI value must be a valid number", "kpiValue");
    }
    if (decimal.isNegative()) {
      throw new ValidationError("KPI value cannot be negative", "kpiValue");
    }
    return new KpiValue(decimal, KpiValueType.NUMBER);
  }

  /**
   * Crea un KPI de tipo dinero
   */
  public static money(
    value: number | string | Decimal,
    currency: string = "COP",
  ): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNaN()) {
      throw new ValidationError(
        "Money value must be a valid number",
        "kpiValue",
      );
    }
    if (decimal.isNegative()) {
      throw new ValidationError("Money value cannot be negative", "kpiValue");
    }
    if (!currency || typeof currency !== "string") {
      throw new ValidationError("Currency is required", "currency");
    }
    return new KpiValue(decimal, KpiValueType.MONEY, currency.toUpperCase());
  }

  /**
   * Crea un KPI de tipo porcentaje
   */
  public static percentage(value: number | string | Decimal): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNaN()) {
      throw new ValidationError(
        "Percentage value must be a valid number",
        "kpiValue",
      );
    }
    if (decimal.lessThan(0) || decimal.greaterThan(100)) {
      throw new ValidationError(
        "Percentage must be between 0 and 100",
        "kpiValue",
      );
    }
    return new KpiValue(decimal, KpiValueType.PERCENTAGE);
  }

  /**
   * Crea un KPI de tipo conteo
   */
  public static count(value: number | string | Decimal): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNaN()) {
      throw new ValidationError(
        "Count value must be a valid number",
        "kpiValue",
      );
    }
    if (!decimal.isInteger() || decimal.isNegative()) {
      throw new ValidationError(
        "Count must be a non-negative integer",
        "kpiValue",
      );
    }
    return new KpiValue(decimal, KpiValueType.COUNT);
  }

  /**
   * Formatea el valor según su tipo
   */
  public format(): string {
    switch (this._type) {
      case KpiValueType.MONEY:
        const formatted = this._value.toFixed(2);
        const [integer, decimal] = formatted.split(".");
        const integerWithCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return `$ ${integerWithCommas}.${decimal} ${this._currency}`;
      case KpiValueType.PERCENTAGE:
        return `${this._value.toFixed(2)}%`;
      case KpiValueType.COUNT:
        return this._value.toFixed(0);
      default:
        return this._value.toString();
    }
  }

  /**
   * Obtiene el valor como Decimal
   */
  public getValue(): Decimal {
    return this._value;
  }

  /**
   * Obtiene el tipo del KPI
   */
  public getType(): KpiValueType {
    return this._type;
  }

  /**
   * Obtiene la moneda (solo para tipo MONEY)
   */
  public getCurrency(): string | undefined {
    return this._currency;
  }

  /**
   * Compara con otro KpiValue
   */
  public equals(other: KpiValue): boolean {
    if (!other || !(other instanceof KpiValue)) {
      return false;
    }
    return (
      this._value.equals(other._value) &&
      this._type === other._type &&
      this._currency === other._currency
    );
  }

  /**
   * Suma dos valores (deben ser del mismo tipo)
   */
  public add(other: KpiValue): KpiValue {
    if (this._type !== other._type) {
      throw new ValidationError(
        `Cannot add KPI values of different types: ${this._type} and ${other._type}`,
        "kpiValue",
      );
    }
    if (
      this._type === KpiValueType.MONEY &&
      this._currency !== other._currency
    ) {
      throw new ValidationError(
        `Cannot add money values of different currencies: ${this._currency} and ${other._currency}`,
        "kpiValue",
      );
    }
    return new KpiValue(
      this._value.plus(other._value),
      this._type,
      this._currency,
    );
  }

  /**
   * Resta dos valores (deben ser del mismo tipo)
   */
  public subtract(other: KpiValue): KpiValue {
    if (this._type !== other._type) {
      throw new ValidationError(
        `Cannot subtract KPI values of different types: ${this._type} and ${other._type}`,
        "kpiValue",
      );
    }
    if (
      this._type === KpiValueType.MONEY &&
      this._currency !== other._currency
    ) {
      throw new ValidationError(
        `Cannot subtract money values of different currencies: ${this._currency} and ${other._currency}`,
        "kpiValue",
      );
    }
    const result = this._value.minus(other._value);
    if (result.isNegative() && this._type !== KpiValueType.NUMBER) {
      throw new ValidationError("Result cannot be negative", "kpiValue");
    }
    return new KpiValue(result, this._type, this._currency);
  }

  /**
   * Multiplica por un factor
   */
  public multiply(factor: number | Decimal): KpiValue {
    const result = this._value.times(factor);
    return new KpiValue(result, this._type, this._currency);
  }

  /**
   * Divide por un divisor
   */
  public divide(divisor: number | Decimal): KpiValue {
    if (new Decimal(divisor).equals(0)) {
      throw new ValidationError("Cannot divide by zero", "kpiValue");
    }
    const result = this._value.dividedBy(divisor);
    return new KpiValue(result, this._type, this._currency);
  }

  /**
   * Serialización JSON
   */
  public toJSON(): any {
    return {
      value: this._value.toString(),
      type: this._type,
      currency: this._currency,
      formatted: this.format(),
    };
  }

  /**
   * Representación string
   */
  public toString(): string {
    return this.format();
  }
}
