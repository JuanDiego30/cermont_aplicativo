
import { DomainError } from '@/common/errors/domain-error.base';

export class InvalidEmailError extends DomainError {
    constructor(email: string) {
        super(`Email inválido: ${email}`);
    }
}

export class Email {
    private constructor(private readonly value: string) { }

    static create(value: string): Email {
        const normalized = value.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalized)) {
            throw new InvalidEmailError(value);
        }
        return new Email(normalized);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.getValue();
    }
}
