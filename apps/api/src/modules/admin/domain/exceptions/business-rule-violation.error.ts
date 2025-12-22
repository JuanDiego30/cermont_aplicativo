/**
 * @exception BusinessRuleViolationError
 * 
 * Excepción de dominio para violaciones de reglas de negocio.
 * Se lanza cuando se intenta realizar una operación que viola una regla de negocio.
 */
export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public readonly rule?: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'BusinessRuleViolationError';
    Object.setPrototypeOf(this, BusinessRuleViolationError.prototype);
  }

  /**
   * Serializa el error para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      rule: this.rule,
      context: this.context,
    };
  }
}

