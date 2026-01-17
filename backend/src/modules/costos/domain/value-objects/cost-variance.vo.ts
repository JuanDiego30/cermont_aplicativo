/**
 * Value Object: CostVariance
 *
 * Representa la desviación entre presupuesto y costo real
 */

import { Decimal } from '@/shared/utils/decimal.util';
import { Money } from './money.vo';

export class CostVariance {
  private constructor(
    private readonly _budgeted: Money,
    private readonly _actual: Money,
    private readonly _variance: Money,
    private readonly _variancePercentage: number | any
  ) {
    Object.freeze(this);
  }

  /**
   * Calcular varianza desde presupuesto y actual
   */
  public static calculate(budgeted: Money, actual: Money): CostVariance {
    // Calcular varianza absoluta
    let variance: Money;
    try {
      variance = actual.subtract(budgeted);
    } catch (error) {
      // Si actual < budgeted, la resta falla, usar valor absoluto
      if (actual.isLessThan(budgeted)) {
        variance = budgeted.subtract(actual);
        // Negativo para indicar que está bajo presupuesto
        variance = Money.create(-variance.toNumber(), variance.getCurrency());
      } else {
        throw error;
      }
    }

    // Calcular varianza porcentual
    let variancePercentage: number | any;
    if (budgeted.isZero()) {
      variancePercentage = new Decimal(0);
    } else {
      variancePercentage = variance.getAmount().dividedBy(budgeted.getAmount()).times(100);
    }

    return new CostVariance(budgeted, actual, variance, variancePercentage);
  }

  /**
   * Verificar si está sobre presupuesto
   */
  public isOverBudget(): boolean {
    return this._actual.isGreaterThan(this._budgeted);
  }

  /**
   * Verificar si está bajo presupuesto
   */
  public isUnderBudget(): boolean {
    return this._actual.isLessThan(this._budgeted);
  }

  /**
   * Verificar si está dentro del presupuesto
   */
  public isWithinBudget(): boolean {
    return this._actual.equals(this._budgeted) || this.isUnderBudget();
  }

  /**
   * Obtener varianza absoluta (siempre positiva)
   */
  public getAbsoluteVariance(): Money {
    if (this._variance.isZero()) {
      return this._variance;
    }

    const absValue = this._variance.getAmount().absoluteValue();

    return Money.create(absValue, this._variance.getCurrency());
  }

  /**
   * Obtener varianza porcentual como número
   */
  public getVariancePercentageAsNumber(): number {
    return this._variancePercentage.toNumber();
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getBudgeted(): Money {
    return this._budgeted;
  }

  public getActual(): Money {
    return this._actual;
  }

  public getVariance(): Money {
    return this._variance;
  }

  public getVariancePercentage(): number | any {
    return this._variancePercentage;
  }

  public equals(other: CostVariance): boolean {
    if (!other || !(other instanceof CostVariance)) {
      return false;
    }
    return this._budgeted.equals(other._budgeted) && this._actual.equals(other._actual);
  }

  public toJSON(): any {
    return {
      budgeted: this._budgeted.toJSON(),
      actual: this._actual.toJSON(),
      variance: this._variance.toJSON(),
      variancePercentage: this._variancePercentage.toString(),
      isOverBudget: this.isOverBudget(),
      isUnderBudget: this.isUnderBudget(),
    };
  }

  public toString(): string {
    const sign = this.isOverBudget() ? '+' : '';
    return `Variance: ${sign}${this._variance.format()} (${sign}${this.getVariancePercentageAsNumber().toFixed(2)}%)`;
  }
}
