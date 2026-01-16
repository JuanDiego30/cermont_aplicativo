/**
 * Exception: FieldTypeMismatchException
 *
 * Lanzada cuando el tipo de valor no coincide con el tipo de campo
 */

import { BusinessRuleViolationError } from '../../../../shared/domain/exceptions';

export class FieldTypeMismatchException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly fieldId: string,
    public readonly expectedType: string,
    public readonly actualType: string
  ) {
    super(message);
    this.name = 'FieldTypeMismatchException';
  }
}
