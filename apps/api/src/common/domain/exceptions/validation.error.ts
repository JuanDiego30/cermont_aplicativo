/**
 * @exception ValidationError
 * 
 * Excepción de dominio para errores de validación de datos.
 * Usada principalmente por Value Objects y Entidades al validar invariantes.
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

    toJSON(): Record<string, unknown> {
        return {
            name: this.name,
            message: this.message,
            field: this.field,
        };
    }
}
