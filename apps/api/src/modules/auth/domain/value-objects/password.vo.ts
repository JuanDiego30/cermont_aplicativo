
import { DomainError } from '../../../../common/errors/domain-error.base';

export class InvalidPasswordError extends DomainError {
    constructor() {
        super('La contraseña debe tener al menos 8 caracteres');
    }
}

export class Password {
    private constructor(private readonly value: string) { }

    /**
     * Create a password from plain text (for registration/login input)
     * Note: Validation only checks length, hash is done separately
     */
    static create(value: string): Password {
        if (!value || value.length < 8) {
            throw new InvalidPasswordError();
        }
        return new Password(value);
    }

    /**
     * Create from already hashed password (from DB)
     */
    static fromHashed(hashedValue: string): Password {
        return new Password(hashedValue);
    }

    getValue(): string {
        return this.value;
    }
}
