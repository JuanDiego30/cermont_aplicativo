
import { DomainError } from '@/common/errors/domain-error.base';

export class EmptySubjectError extends DomainError {
    constructor() {
        super('El asunto del correo no puede estar vacío');
    }
}

export class EmailSubject {
    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(value: string): EmailSubject {
        return new EmailSubject(value);
    }

    private validate(value: string): void {
        if (!value || value.trim().length === 0) {
            throw new EmptySubjectError();
        }
    }

    getValue(): string {
        return this.value;
    }
}
