/**
 * @exception ValidationError
 */
export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly field?: string,
    ) {
        super(message);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
