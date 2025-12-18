import { EmailAddress } from '../value-objects/email-address.vo';

/**
 * Entidad: Email
 * Representa un email con toda su información y comportamiento
 */
export class Email {
    private constructor(
        public readonly id: string,
        public readonly from: EmailAddress,
        public readonly to: EmailAddress[],
        public readonly subject: string,
        public readonly body: string,
        public readonly html: string,
        public sentAt?: Date,
        public failedAt?: Date,
        public error?: string,
    ) { }

    /**
     * Factory: Crear nuevo email validado
     */
    static create(
        from: string,
        to: string[],
        subject: string,
        body: string,
        html: string,
    ): Email {
        // ✅ Validar emails usando Value Object
        const fromAddress = EmailAddress.create(from);
        const toAddresses = to.map(email => EmailAddress.create(email));

        // ✅ Validar subject
        if (!subject || subject.trim().length === 0) {
            throw new Error('Subject no puede estar vacío');
        }

        // ✅ Validar body o html
        if (!body && !html) {
            throw new Error('Body o HTML debe estar presente');
        }

        return new Email(
            Email.generateId(),
            fromAddress,
            toAddresses,
            subject.trim(),
            body || '',
            html || '',
        );
    }

    /**
     * Marcar como enviado exitosamente
     */
    markAsSent(): void {
        this.sentAt = new Date();
        this.failedAt = undefined;
        this.error = undefined;
    }

    /**
     * Marcar como fallido
     */
    markAsFailed(error: string): void {
        this.failedAt = new Date();
        this.error = error;
    }

    /**
     * ¿Fue enviado exitosamente?
     */
    get wasSent(): boolean {
        return !!this.sentAt && !this.failedAt;
    }

    /**
     * ¿Falló el envío?
     */
    get hasFailed(): boolean {
        return !!this.failedAt;
    }

    /**
     * Convertir a objeto para persistencia
     */
    toPersistence(): Record<string, unknown> {
        return {
            id: this.id,
            from: this.from.getValue(),
            to: this.to.map(email => email.getValue()),
            subject: this.subject,
            body: this.body,
            html: this.html,
            sentAt: this.sentAt,
            failedAt: this.failedAt,
            error: this.error,
        };
    }

    /**
     * Reconstruir desde persistencia
     */
    static fromPersistence(data: Record<string, unknown>): Email {
        return new Email(
            data.id as string,
            EmailAddress.create(data.from as string),
            (data.to as string[]).map((email: string) => EmailAddress.create(email)),
            data.subject as string,
            data.body as string,
            data.html as string,
            data.sentAt as Date | undefined,
            data.failedAt as Date | undefined,
            data.error as string | undefined,
        );
    }

    /**
     * Generar ID único para email
     */
    private static generateId(): string {
        return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
