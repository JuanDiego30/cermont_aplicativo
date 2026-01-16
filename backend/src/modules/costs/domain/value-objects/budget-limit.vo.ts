/**
 * Value Object: BudgetLimit
 *
 * Representa un límite presupuestal con umbral de alerta
 */

import { Decimal } from '@/shared/utils';
import { ValidationError } from '../exceptions';
import { Money } from './money.vo';

export class BudgetLimit {
  private static readonly DEFAULT_ALERT_THRESHOLD = 0.8; // 80%

  private constructor(
    private readonly _limit: Money,
    private readonly _alertThreshold: number | any
  ) {
    Object.freeze(this);
  }

  public static create(limit: Money, alertThreshold?: number | any): BudgetLimit {
    const threshold =
      alertThreshold !== undefined
        ? new Decimal(alertThreshold)
        : new Decimal(BudgetLimit.DEFAULT_ALERT_THRESHOLD);

    // Validar threshold
    // Validar threshold
    if (threshold.lessThan(0) || threshold.greaterThan(1)) {
      throw new ValidationError('Alert threshold debe estar entre 0 y 1', 'alertThreshold');
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
    return utilizationPercentage.greaterThanOrEqualTo(this._alertThreshold);
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
      return new Decimal(0);
    }

    return currentTotal.getAmount().dividedBy(this._limit.getAmount());
  }

  /**
   * Calcular porcentaje de utilización como número (0-100)
   */
  public utilizationPercentageAsNumber(currentTotal: Money): number {
    const percentage = this.utilizationPercentage(currentTotal);
    return percentage.times(100).toNumber();
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
    return this._limit.equals(other._limit) && this._alertThreshold.equals(other._alertThreshold);
  }

  public toJSON(): any {
    return {
      limit: this._limit.toJSON(),
      alertThreshold: this._alertThreshold.toString(),
    };
  }

  public toString(): string {
    return `BudgetLimit(${this._limit.format()}, threshold: ${this._alertThreshold})`;
  }
}
