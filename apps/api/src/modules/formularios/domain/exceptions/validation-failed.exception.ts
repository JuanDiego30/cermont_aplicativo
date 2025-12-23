/**
 * Exception: ValidationFailedException
 * 
 * Lanzada cuando la validación de una submission falla
 */

import { BusinessRuleViolationError } from '../../../../common/domain/exceptions';

export interface SubmissionValidationError {
  fieldId: string;
  message: string;
}

export class ValidationFailedException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly errors: SubmissionValidationError[],
  ) {
    super(message);
    this.name = 'ValidationFailedException';
  }
}

