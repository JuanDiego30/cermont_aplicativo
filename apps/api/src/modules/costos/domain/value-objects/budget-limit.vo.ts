/**
 * Value Object: BudgetLimit
 * 
 * Representa un límite presupuestal con umbral de alerta
 */

// Decimal.js es open source
let Decimal: any;
try {
  Decimal = require('decimal.js');
} catch (error) {
  // Fallback
}

import { Money } from './money.vo';
import { ValidationError } from '../exceptions';

export class BudgetLimit {
  private static readonly DEFAULT_ALERT_THRESHOLD = 0.8; // 80%

  private constructor(
    private readonly _limit: Money,
    private readonly _alertThreshold: number | any,
  ) {
    Object.freeze(this);
  }

  public static create(limit: Money, alertThreshold?: number | any): BudgetLimit {
    const threshold = alertThreshold !== undefined
      ? (Decimal ? new Decimal(alertThreshold) : alertThreshold)
      : (Decimal ? new Decimal(BudgetLimit.DEFAULT_ALERT_THRESHOLD) : BudgetLimit.DEFAULT_ALERT_THRESHOLD);

    // Validar threshold
    if (Decimal) {
      if (threshold.lessThan(0) || threshold.greaterThan(1)) {
        throw new ValidationError('Alert threshold debe estar entre 0 y 1', 'alertThreshold');
      }
    } else {
      const numThreshold = typeof threshold === 'number' ? threshold : parseFloat(String(threshold));
      if (numThreshold < 0 || numThreshold > 1) {
        throw new ValidationError('Alert threshold debe estar entre 0 y 1', 'alertThreshold');
      }
    }

    return new BudgetLimit(limit, threshold);
  }

  /**
   * Verificar si el presupuesto fue excedido
   */
  public isExceeded(currentTotal: Money): boolean {
    return currentTotal.isGreaterThan(this._limit);
  }

  /**
   * Verificar si se requiere alerta (umbral alcanzado)
   */
  public alertRequired(currentTotal: Money): boolean {
    const utilizationPercentage = this.utilizationPercentage(currentTotal);
    
    if (Decimal) {
      return utilizationPercentage.greaterThanOrEqualTo(this._alertThreshold);
    } else {
      const numUtilization = typeof utilizationPercentage === 'number'
        ? utilizationPercentage
        : parseFloat(String(utilizationPercentage));
      const numThreshold = typeof this._alertThreshold === 'number'
        ? this._alertThreshold
        : parseFloat(String(this._alertThreshold));
      return numUtilization >= numThreshold;
    }
  }

  /**
   * Calcular presupuesto restante
   */
  public remainingBudget(currentTotal: Money): Money {
    if (currentTotal.isGreaterThanOrEqualTo(this._limit)) {
      return Money.zero(this._limit.getCurrency());
    }
    return this._limit.subtract(currentTotal);
  }

  /**
   * Calcular porcentaje de utilización (0-1)
   */
  public utilizationPercentage(currentTotal: Money): number | any {
    if (this._limit.isZero()) {
      return Decimal ? new Decimal(0) : 0;
    }

    if (Decimal) {
      return currentTotal.getAmount().dividedBy(this._limit.getAmount());
    } else {
      return currentTotal.toNumber() / this._limit.toNumber();
    }
  }

  /**
   * Calcular porcentaje de utilización como número (0-100)
   */
  public utilizationPercentageAsNumber(currentTotal: Money): number {
    const percentage = this.utilizationPercentage(currentTotal);
    
    if (Decimal) {
      return percentage.times(100).toNumber();
    } else {
      return (typeof percentage === 'number' ? percentage : parseFloat(String(percentage))) * 100;
    }
  }

  /**
   * Obtener estado del presupuesto
   */
  public getStatus(currentTotal: Money): 'OK' | 'WARNING' | 'EXCEEDED' {
    if (this.isExceeded(currentTotal)) {
      return 'EXCEEDED';
    }
    if (this.alertRequired(currentTotal)) {
      return 'WARNING';
    }
    return 'OK';
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getLimit(): Money {
    return this._limit;
  }

  public getAlertThreshold(): number | any {
    return this._alertThreshold;
  }

  public equals(other: BudgetLimit): boolean {
    if (!other || !(other instanceof BudgetLimit)) {
      return false;
    }
    return (
      this._limit.equals(other._limit) &&
      (Decimal
        ? this._alertThreshold.equals(other._alertThreshold)
        : this._alertThreshold === other._alertThreshold)
    );
  }

  public toJSON(): any {
    return {
      limit: this._limit.toJSON(),
      alertThreshold: Decimal ? this._alertThreshold.toString() : this._alertThreshold,
    };
  }

  public toString(): string {
    return `BudgetLimit(${this._limit.format()}, threshold: ${this._alertThreshold})`;
  }
}

