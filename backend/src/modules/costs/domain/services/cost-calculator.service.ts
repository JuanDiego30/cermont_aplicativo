/**
 * Domain Service: CostCalculatorService
 *
 * Servicio de dominio para cálculos financieros complejos
 * ⚠️ CRÍTICO: Usa Decimal.js para precisión absoluta
 */

import { Decimal } from '@/shared/utils';
import { Costo } from '../entities/costo.entity';

import { CostoCategory } from '../value-objects/costo-category.vo';
import { CostoType } from '../value-objects/costo-type.vo';
import { Money } from '../value-objects/money.vo';

export class CostCalculatorService {
  /**
   * Calcular total por tipo de costo
   */
  public static calculateTotalByType(costos: Costo[], type: CostoType): Money {
    if (costos.length === 0) {
      return Money.zero('COP'); // Default currency
    }

    const currency = costos[0].getAmount().getCurrency();
    let total = Money.zero(currency);

    for (const costo of costos) {
      if (costo.getType().equals(type) && !costo.isDeleted()) {
        total = total.add(costo.getAmount());
      }
    }

    return total;
  }

  /**
   * Calcular total por categoría
   */
  public static calculateTotalByCategory(costos: Costo[], category: CostoCategory): Money {
    if (costos.length === 0) {
      return Money.zero('COP');
    }

    const currency = costos[0].getAmount().getCurrency();
    let total = Money.zero(currency);

    for (const costo of costos) {
      if (costo.getCategory().equals(category) && !costo.isDeleted()) {
        total = total.add(costo.getAmount());
      }
    }

    return total;
  }

  /**
   * Calcular total general de costos
   */
  public static calculateTotal(costos: Costo[]): Money {
    if (costos.length === 0) {
      return Money.zero('COP');
    }

    const currency = costos[0].getAmount().getCurrency();
    let total = Money.zero(currency);

    for (const costo of costos) {
      if (!costo.isDeleted()) {
        total = total.add(costo.getAmount());
      }
    }

    return total;
  }

  /**
   * Calcular margen de rentabilidad
   * @param revenue - Ingresos
   * @param costs - Costos totales
   * @returns Margen como porcentaje (0-100)
   */
  public static calculateProfitMargin(revenue: Money, costs: Money): number | any {
    if (revenue.isZero()) {
      return new Decimal(0);
    }

    const profit = revenue.getAmount().minus(costs.getAmount());
    const margin = profit.dividedBy(revenue.getAmount()).times(100);
    return margin;
  }

  /**
   * Calcular ROI (Return on Investment)
   * @param revenue - Ingresos
   * @param investment - Inversión (costos)
   * @returns ROI como porcentaje
   */
  public static calculateROI(revenue: Money, investment: Money): number | any {
    if (investment.isZero()) {
      return new Decimal(0);
    }

    const profit = revenue.getAmount().minus(investment.getAmount());
    const roi = profit.dividedBy(investment.getAmount()).times(100);
    return roi;
  }

  /**
   * Identificar costos atípicos (outliers) usando método IQR
   */
  public static identifyOutliers(costos: Costo[]): Costo[] {
    if (costos.length < 4) {
      return []; // Necesitamos al menos 4 puntos para calcular outliers
    }

    const amounts = costos
      .filter(c => !c.isDeleted())
      .map(c => c.getAmount().toNumber())
      .sort((a, b) => a - b);

    // Calcular Q1, Q3, IQR
    const q1Index = Math.floor(amounts.length * 0.25);
    const q3Index = Math.floor(amounts.length * 0.75);
    const q1 = amounts[q1Index];
    const q3 = amounts[q3Index];
    const iqr = q3 - q1;

    // Límites para outliers
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Identificar costos fuera de los límites
    return costos.filter(costo => {
      if (costo.isDeleted()) {
        return false;
      }
      const amount = costo.getAmount().toNumber();
      return amount < lowerBound || amount > upperBound;
    });
  }

  /**
   * Calcular estadísticas de costos
   */
  public static calculateStatistics(costos: Costo[]): {
    count: number;
    total: Money;
    average: Money;
    median: Money;
    min: Money;
    max: Money;
  } {
    const activeCostos = costos.filter(c => !c.isDeleted());

    if (activeCostos.length === 0) {
      const zero = Money.zero('COP');
      return {
        count: 0,
        total: zero,
        average: zero,
        median: zero,
        min: zero,
        max: zero,
      };
    }

    const currency = activeCostos[0].getAmount().getCurrency();
    const amounts = activeCostos.map(c => c.getAmount().toNumber()).sort((a, b) => a - b);

    const total = this.calculateTotal(activeCostos);
    const average = total.divide(activeCostos.length);
    const median = Money.create(amounts[Math.floor(amounts.length / 2)], currency);
    const min = Money.create(amounts[0], currency);
    const max = Money.create(amounts[amounts.length - 1], currency);

    return {
      count: activeCostos.length,
      total,
      average,
      median,
      min,
      max,
    };
  }
}
