/**
 * Value Object: Money
 * 
 * ⚠️ CRÍTICO: Representa una cantidad monetaria con precisión absoluta usando Decimal.js
 * 
 * NUNCA usar `number` para dinero - siempre usar Decimal.js
 * 
 * Invariantes:
 * - Monto debe usar Decimal.js (no number)
 * - Moneda debe ser válida (ISO 4217)
 * - Precisión de 2 decimales
 * - Operaciones aritméticas solo entre misma moneda
 */

// Decimal.js es open source y gratuito
let Decimal: any;
try {
  Decimal = require('decimal.js');
} catch (error) {
  // Si no está instalado, usar fallback (no recomendado para producción)
  console.warn('⚠️  decimal.js no está instalado. Instalar con: npm install decimal.js');
  console.warn('⚠️  Usando Number como fallback (NO RECOMENDADO para producción)');
}

import { ValidationError, BusinessRuleViolationError, InvalidCurrencyException } from '../exceptions';

export class Money {
  private static readonly VALID_CURRENCIES = ['COP', 'USD', 'EUR'];
  private static readonly DECIMAL_PLACES = 2;

  private constructor(
    private readonly _amount: any, // Decimal cuando está disponible
    private readonly _currency: string,
  ) {
    Object.freeze(this);
  }

  /**
   * Crear Money desde number, string o Decimal
   */
  public static create(amount: number | string | any, currency: string): Money {
    this.validate(amount, currency);

    if (Decimal) {
      const decimalAmount = new Decimal(amount).toDecimalPlaces(Money.DECIMAL_PLACES);
      return new Money(decimalAmount, currency.toUpperCase());
    } else {
      // Fallback sin Decimal.js (NO RECOMENDADO)
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
      const rounded = Math.round(numAmount * 100) / 100;
      return new Money(rounded, currency.toUpperCase());
    }
  }

  /**
   * Crear Money con valor cero
   */
  public static zero(currency: string): Money {
    return Money.create(0, currency);
  }

  /**
   * Validar monto y moneda
   */
  private static validate(amount: number | string | any, currency: string): void {
    if (Decimal) {
      const decimal = new Decimal(amount);
      if (decimal.isNaN()) {
        throw new ValidationError('Monto inválido', 'amount', amount);
      }
      if (decimal.isNegative()) {
        throw new ValidationError('Monto no puede ser negativo', 'amount', amount);
      }
    } else {
      const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));
      if (isNaN(numAmount)) {
        throw new ValidationError('Monto inválido', 'amount', amount);
      }
      if (numAmount < 0) {
        throw new ValidationError('Monto no puede ser negativo', 'amount', amount);
      }
    }

    if (!currency || typeof currency !== 'string') {
      throw new ValidationError('Moneda es requerida', 'currency');
    }
    if (!Money.VALID_CURRENCIES.includes(currency.toUpperCase())) {
      throw new InvalidCurrencyException(
        `Moneda inválida. Valores permitidos: ${Money.VALID_CURRENCIES.join(', ')}`,
        currency,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // OPERACIONES ARITMÉTICAS
  // ═══════════════════════════════════════════════════════════════

  public add(other: Money): Money {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      const result = this._amount.plus(other._amount);
      return new Money(result, this._currency);
    } else {
      const result = (this._amount as number) + (other._amount as number);
      return Money.create(result, this._currency);
    }
  }

  public subtract(other: Money): Money {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      const result = this._amount.minus(other._amount);
      if (result.isNegative()) {
        throw new BusinessRuleViolationError('El resultado no puede ser negativo');
      }
      return new Money(result, this._currency);
    } else {
      const result = (this._amount as number) - (other._amount as number);
      if (result < 0) {
        throw new BusinessRuleViolationError('El resultado no puede ser negativo');
      }
      return Money.create(result, this._currency);
    }
  }

  public multiply(factor: number | any): Money {
    if (Decimal) {
      const factorDecimal = factor instanceof Decimal ? factor : new Decimal(factor);
      const result = this._amount.times(factorDecimal);
      return new Money(result, this._currency);
    } else {
      const numFactor = typeof factor === 'number' ? factor : parseFloat(String(factor));
      const result = (this._amount as number) * numFactor;
      return Money.create(result, this._currency);
    }
  }

  public divide(divisor: number | any): Money {
    if (Decimal) {
      const divisorDecimal = divisor instanceof Decimal ? divisor : new Decimal(divisor);
      if (divisorDecimal.equals(0)) {
        throw new ValidationError('No se puede dividir por cero', 'divisor');
      }
      const result = this._amount.dividedBy(divisorDecimal);
      return new Money(result, this._currency);
    } else {
      const numDivisor = typeof divisor === 'number' ? divisor : parseFloat(String(divisor));
      if (numDivisor === 0) {
        throw new ValidationError('No se puede dividir por cero', 'divisor');
      }
      const result = (this._amount as number) / numDivisor;
      return Money.create(result, this._currency);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // COMPARACIONES
  // ═══════════════════════════════════════════════════════════════

  public isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      return this._amount.greaterThan(other._amount);
    } else {
      return (this._amount as number) > (other._amount as number);
    }
  }

  public isGreaterThanOrEqualTo(other: Money): boolean {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      return this._amount.greaterThanOrEqualTo(other._amount);
    } else {
      return (this._amount as number) >= (other._amount as number);
    }
  }

  public isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      return this._amount.lessThan(other._amount);
    } else {
      return (this._amount as number) < (other._amount as number);
    }
  }

  public isLessThanOrEqualTo(other: Money): boolean {
    this.assertSameCurrency(other);
    
    if (Decimal) {
      return this._amount.lessThanOrEqualTo(other._amount);
    } else {
      return (this._amount as number) <= (other._amount as number);
    }
  }

  public isZero(): boolean {
    if (Decimal) {
      return this._amount.equals(0);
    } else {
      return (this._amount as number) === 0;
    }
  }

  public equals(other: Money): boolean {
    if (!other || !(other instanceof Money)) {
      return false;
    }
    
    if (Decimal) {
      return (
        this._amount.equals(other._amount) &&
        this._currency === other._currency
      );
    } else {
      return (
        Math.abs((this._amount as number) - (other._amount as number)) < 0.01 &&
        this._currency === other._currency
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CONVERSIÓN DE MONEDA
  // ═══════════════════════════════════════════════════════════════

  public toCurrency(targetCurrency: string, exchangeRate: number | any): Money {
    if (this._currency === targetCurrency.toUpperCase()) {
      return this;
    }

    if (Decimal) {
      const rate = exchangeRate instanceof Decimal ? exchangeRate : new Decimal(exchangeRate);
      const convertedAmount = this._amount.times(rate);
      return Money.create(convertedAmount, targetCurrency);
    } else {
      const numRate = typeof exchangeRate === 'number' ? exchangeRate : parseFloat(String(exchangeRate));
      const convertedAmount = (this._amount as number) * numRate;
      return Money.create(convertedAmount, targetCurrency);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FORMATEO
  // ═══════════════════════════════════════════════════════════════

  public format(): string {
    let formatted: string;
    
    if (Decimal) {
      formatted = this._amount.toFixed(Money.DECIMAL_PLACES);
    } else {
      formatted = (this._amount as number).toFixed(Money.DECIMAL_PLACES);
    }

    const [integer, decimal] = formatted.split('.');
    
    // Agregar separadores de miles
    const integerWithCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `$ ${integerWithCommas}.${decimal} ${this._currency}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getAmount(): any {
    // Retornar Decimal si está disponible, sino number
    return this._amount;
  }

  public getCurrency(): string {
    return this._currency;
  }

  /**
   * Obtener monto como number (solo para compatibilidad, usar con precaución)
   */
  public toNumber(): number {
    if (Decimal) {
      return this._amount.toNumber();
    } else {
      return this._amount as number;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new BusinessRuleViolationError(
        `No se pueden operar monedas diferentes: ${this._currency} vs ${other._currency}`,
      );
    }
  }

  public toJSON(): any {
    return {
      amount: Decimal ? this._amount.toString() : this._amount,
      currency: this._currency,
    };
  }

  public toString(): string {
    return this.format();
  }
}

