/**
 * Specification: BudgetNotExceededSpecification
 *
 * Verifica que un costo no exceda el límite presupuestal
 */

import { Costo } from "../entities/costo.entity";
import { Money } from "../value-objects/money.vo";
import { BudgetLimit } from "../value-objects/budget-limit.vo";

export class BudgetNotExceededSpecification {
  /**
   * Verificar si se satisface la especificación
   */
  public isSatisfiedBy(
    cost: Costo,
    currentTotal: Money,
    limit: BudgetLimit,
  ): boolean {
    const newTotal = currentTotal.add(cost.getAmount());
    return !limit.isExceeded(newTotal);
  }
}
