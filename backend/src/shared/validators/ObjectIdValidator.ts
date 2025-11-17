export class ObjectIdValidationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ObjectIdValidationError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ObjectIdValidator {
  private static readonly OBJECTID_REGEX = /^[a-f\d]{24}$/i;
  private static readonly OBJECTID_LENGTH = 24;

  static validate(value: unknown, displayName: string): string {
    if (value === undefined || value === null) {
      throw new ObjectIdValidationError(`El ${displayName} es requerido`, 'REQUIRED');
    }

    if (typeof value !== 'string') {
      throw new ObjectIdValidationError(
        `El ${displayName} debe ser una cadena`,
        'INVALID_TYPE'
      );
    }

    const trimmed = value.trim();

    if (trimmed === '') {
      throw new ObjectIdValidationError(`El ${displayName} no puede estar vacío`, 'EMPTY');
    }

    if (trimmed.length !== this.OBJECTID_LENGTH) {
      throw new ObjectIdValidationError(
        `El ${displayName} debe tener exactamente ${this.OBJECTID_LENGTH} caracteres hexadecimales`,
        'INVALID_LENGTH'
      );
    }

    if (!this.OBJECTID_REGEX.test(trimmed)) {
      throw new ObjectIdValidationError(
        `El ${displayName} tiene un formato inválido: ${value}`,
        'INVALID_FORMAT'
      );
    }

    return trimmed;
  }
}
