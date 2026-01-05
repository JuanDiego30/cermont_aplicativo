/**
 * Exception: InvalidFormStructureException
 *
 * Lanzada cuando la estructura de un formulario es inválida
 */

import { BusinessRuleViolationError } from "../../../../common/domain/exceptions";

export class InvalidFormStructureException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = "InvalidFormStructureException";
  }
}
