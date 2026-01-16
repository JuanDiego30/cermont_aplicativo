/**
 * @exception BudgetExceededException
 *
 * Excepción cuando un costo excede el límite presupuestal.
 */
import { BusinessRuleViolationError } from "../../../../shared/domain/exceptions";

export class BudgetExceededException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly budgetLimit: unknown,
    public readonly currentTotal: unknown,
    public readonly exceedAmount: unknown,
  ) {
    super(message, "BUDGET_EXCEEDED", {
      budgetLimit,
      currentTotal,
      exceedAmount,
    });
    this.name = "BudgetExceededException";
    Object.setPrototypeOf(this, BudgetExceededException.prototype);
  }
}

