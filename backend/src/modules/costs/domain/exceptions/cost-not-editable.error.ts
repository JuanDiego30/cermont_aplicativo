/**
 * @exception CostNotEditableException
 *
 * Excepción cuando se intenta editar un costo que no es editable.
 */
import { BusinessRuleViolationError } from '../../../../shared/domain/exceptions';

export class CostNotEditableException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly costoId: string,
    public readonly registeredAt: Date
  ) {
    super(message, 'COST_NOT_EDITABLE', {
      costoId,
      registeredAt,
    });
    this.name = 'CostNotEditableException';
    Object.setPrototypeOf(this, CostNotEditableException.prototype);
  }
}
