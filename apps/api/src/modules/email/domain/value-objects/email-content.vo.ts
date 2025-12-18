
import { DomainError } from '@/common/errors/domain-error.base';

export class EmptyContentError extends DomainError {
    constructor() {
        super('El contenido del correo no puede estar vacío');
    }
}

export class EmailContent {
    private constructor(private readonly value: string) {
        this.validate(value);
    }

    static create(value: string): EmailContent {
        return new EmailContent(value);
    }

    private validate(value: string): void {
        if (!value || value.trim().length === 0) {
            throw new EmptyContentError();
        }
    }

    getValue(): string {
        return this.value;
    }
}
