/**
 * @valueObject ComparisonResult
 * 
 * Representa el resultado de comparar un KPI entre dos períodos.
 */

import { KpiValue } from './kpi-value.vo';
import { TrendDirection, TrendDirectionEnum } from './trend-direction.vo';
import { Decimal } from 'decimal.js';

export class ComparisonResult {
  private constructor(
    private readonly _current: KpiValue,
    private readonly _previous: KpiValue,
    private readonly _difference: KpiValue,
    private readonly _percentageChange: Decimal,
    private readonly _trendDirection: TrendDirection,
  ) {
    Object.freeze(this);
  }

  /**
   * Calcula el resultado de comparación
   */
  public static calculate(current: KpiValue, previous: KpiValue): ComparisonResult {
    if (current.getType() !== previous.getType()) {
      throw new Error('Cannot compare KPI values of different types');
    }

    const currentValue = current.getValue();
    const previousValue = previous.getValue();
    const difference = current.subtract(previous);
    const percentageChange = previousValue.equals(0)
      ? new Decimal(0)
      : currentValue.minus(previousValue).dividedBy(previousValue).times(100);

    const trendDirection = TrendDirection.calculate(current, previous);

    return new ComparisonResult(
      current,
      previous,
      difference,
      percentageChange,
      trendDirection,
    );
  }

  /**
   * Obtiene el valor actual
   */
  public getCurrent(): KpiValue {
    return this._current;
  }

  /**
   * Obtiene el valor anterior
   */
  public getPrevious(): KpiValue {
    return this._previous;
  }

  /**
   * Obtiene la diferencia absoluta
   */
  public getDifference(): KpiValue {
    return this._difference;
  }

  /**
   * Obtiene el cambio porcentual
   */
  public getPercentageChange(): Decimal {
    return this._percentageChange;
  }

  /**
   * Obtiene la dirección de tendencia
   */
  public getTrendDirection(): TrendDirection {
    return this._trendDirection;
  }

  /**
   * Verifica si hay un cambio significativo
   */
  public hasSignificantChange(threshold: number = 5): boolean {
    return this._percentageChange.abs().greaterThanOrEqualTo(threshold);
  }

  /**
   * Formatea el resultado para mostrar
   */
  public format(): string {
    const percentage = this._percentageChange.toFixed(2);
    const direction = this._trendDirection.getIcon();
    const sign = this._percentageChange.greaterThan(0) ? '+' : '';

    return `${sign}${percentage}% vs período anterior ${direction}`;
  }

  /**
   * Serialización JSON
   */
  public toJSON(): any {
    return {
      current: this._current.toJSON(),
      previous: this._previous.toJSON(),
      difference: this._difference.toJSON(),
      percentageChange: this._percentageChange.toString(),
      trendDirection: this._trendDirection.toJSON(),
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

