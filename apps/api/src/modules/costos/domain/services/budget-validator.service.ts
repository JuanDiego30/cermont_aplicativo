/**
 * Domain Service: BudgetValidatorService
 * 
 * Servicio de dominio para validación de presupuesto
 */

import { Money } from '../value-objects/money.vo';
import { BudgetLimit } from '../value-objects/budget-limit.vo';
import { BudgetExceededException } from '../exceptions';
import { BudgetAlertTriggeredEvent } from '../events';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  status: 'OK' | 'WARNING' | 'EXCEEDED';
  utilizationPercentage: number;
  remainingBudget: Money;
}

export class BudgetValidatorService {
  /**
   * Validar nuevo costo contra presupuesto
   */
  public static validateAgainstBudget(
    newCost: Money,
    currentTotal: Money,
    limit: BudgetLimit,
  ): ValidationResult {
    const newTotal = currentTotal.add(newCost);
    const utilizationPercentage = limit.utilizationPercentageAsNumber(newTotal);
    const remainingBudget = limit.remainingBudget(newTotal);
    const status = limit.getStatus(newTotal);

    // Si excede presupuesto
    if (limit.isExceeded(newTotal)) {
      return {
        isValid: false,
        error: 'El costo excede el límite presupuestal',
        status: 'EXCEEDED',
        utilizationPercentage,
        remainingBudget,
      };
    }

    // Si está en zona de alerta
    if (limit.alertRequired(newTotal)) {
      return {
        isValid: true,
        status: 'WARNING',
        utilizationPercentage,
        remainingBudget,
      };
    }

    return {
      isValid: true,
      status: 'OK',
      utilizationPercentage,
      remainingBudget,
    };
  }

  /**
   * Verificar estado del presupuesto
   */
  public static checkBudgetStatus(
    currentTotal: Money,
    limit: BudgetLimit,
  ): {
    status: 'OK' | 'WARNING' | 'EXCEEDED';
    utilizationPercentage: number;
    remainingBudget: Money;
    alertRequired: boolean;
  } {
    const status = limit.getStatus(currentTotal);
    const utilizationPercentage = limit.utilizationPercentageAsNumber(currentTotal);
    const remainingBudget = limit.remainingBudget(currentTotal);
    const alertRequired = limit.alertRequired(currentTotal);

    return {
      status,
      utilizationPercentage,
      remainingBudget,
      alertRequired,
    };
  }
}

