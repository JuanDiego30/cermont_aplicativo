/**
 * Exception: TemplateNotPublishableException
 *
 * Lanzada cuando un template no puede ser publicado
 */

import { BusinessRuleViolationError } from "../../../../shared/domain/exceptions";

export class TemplateNotPublishableException extends BusinessRuleViolationError {
  constructor(
    message: string,
    public readonly reasons?: string[],
  ) {
    super(message);
    this.name = "TemplateNotPublishableException";
  }
}

