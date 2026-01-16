/**
 * @exception BusinessRuleViolationError
 *
 * Excepción de dominio para violaciones de reglas de negocio.
 * Indica que una operación no puede completarse porque violaría las invariantes o reglas del dominio.
 */
export class BusinessRuleViolationError extends Error {
  constructor(
    message: string,
    public readonly rule?: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BusinessRuleViolationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      rule: this.rule,
      context: this.context,
    };
  }
}
