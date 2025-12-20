
import { DomainError } from '../../../../common/errors/domain-error.base';

export class InvalidEmailError extends DomainError {
    constructor(email: string) {
        super(`Email inválido: ${email}`);
    }
}

export class EmailAddress {
    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(value: string): EmailAddress {
        return new EmailAddress(value.trim().toLowerCase());
    }

    private validate(value: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            throw new InvalidEmailError(value);
        }
    }

    getValue(): string {
        return this.value;
    }
}
