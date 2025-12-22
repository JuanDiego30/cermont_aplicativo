/**
 * @exception ValidationError
 * 
 * Excepción de dominio para errores de validación.
 * Se lanza cuando los datos no cumplen las reglas de negocio.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Serializa el error para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      value: this.value,
    };
  }
}

