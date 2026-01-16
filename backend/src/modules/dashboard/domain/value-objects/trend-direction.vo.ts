/**
 * @valueObject TrendDirection
 *
 * Representa la dirección de una tendencia (UP, DOWN, STABLE).
 */

import { ValidationError } from '../exceptions';
import { KpiValue } from './kpi-value.vo';
import { EnumValueObject } from '../../../../shared/base/enum-value-object';

export enum TrendDirectionEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  STABLE = 'STABLE',
}

export class TrendDirection extends EnumValueObject<TrendDirectionEnum> {
  private constructor(value: TrendDirectionEnum) {
    super(value);
  }

  /**
   * Calcula la dirección de tendencia comparando dos valores
   */
  public static calculate(
    current: KpiValue,
    previous: KpiValue,
    threshold: number = 5 // Porcentaje mínimo para considerar cambio significativo
  ): TrendDirection {
    if (current.getType() !== previous.getType()) {
      throw new ValidationError('Cannot compare KPI values of different types', 'trendDirection');
    }

    const currentValue = current.getValue();
    const previousValue = previous.getValue();

    if (previousValue.equals(0)) {
      // Si el valor anterior es 0, cualquier valor positivo es UP
      return currentValue.greaterThan(0)
        ? new TrendDirection(TrendDirectionEnum.UP)
        : new TrendDirection(TrendDirectionEnum.STABLE);
    }

    const percentageChange = currentValue
      .minus(previousValue)
      .dividedBy(previousValue)
      .times(100)
      .abs();

    if (percentageChange.lessThan(threshold)) {
      return new TrendDirection(TrendDirectionEnum.STABLE);
    }

    return currentValue.greaterThan(previousValue)
      ? new TrendDirection(TrendDirectionEnum.UP)
      : new TrendDirection(TrendDirectionEnum.DOWN);
  }

  /**
   * Crea desde enum
   */
  public static fromEnum(value: TrendDirectionEnum): TrendDirection {
    return new TrendDirection(value);
  }

  /**
   * Obtiene el valor
   */
  public getIcon(): string {
    switch (this._value) {
      case TrendDirectionEnum.UP:
        return '↑';
      case TrendDirectionEnum.DOWN:
        return '↓';
      case TrendDirectionEnum.STABLE:
        return '→';
    }
  }

  /**
   * Obtiene el color
   */
  public getColor(): string {
    switch (this._value) {
      case TrendDirectionEnum.UP:
        return 'green';
      case TrendDirectionEnum.DOWN:
        return 'red';
      case TrendDirectionEnum.STABLE:
        return 'gray';
    }
  }
}
