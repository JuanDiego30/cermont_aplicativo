/**
 * Domain Exceptions
 *
 * Consolidado: Excepciones base desde common, excepciones específicas del dominio aquí.
 */
export { ValidationError, BusinessRuleViolationError } from '../../../../shared/domain/exceptions';
export { BudgetExceededException } from './budget-exceeded.error';
export { InvalidCostAmountException } from './invalid-cost-amount.error';
export { CostNotEditableException } from './cost-not-editable.error';
export { InvalidCurrencyException } from './invalid-currency.error';
