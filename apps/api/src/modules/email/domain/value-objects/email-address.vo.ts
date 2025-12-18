/**
 * Value Object: EmailAddress
 * Representa una dirección de email válida con validación
 */
export class EmailAddress {
    private constructor(private readonly value: string) {
        this.validate(value);
    }

    /**
     * Factory method para crear EmailAddress validado
     */
    static create(email: string): EmailAddress {
        return new EmailAddress(email.toLowerCase().trim());
    }

    /**
     * Validar formato de email
     */
    private validate(email: string): void {
        if (!email) {
            throw new Error('Email no puede estar vacío');
        }

        // Regex estándar para email (RFC 5322 simplificado)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error(`Email inválido: ${email}`);
        }

        // Validar longitud máxima (RFC 5321)
        if (email.length > 254) {
            throw new Error('Email demasiado largo (máximo 254 caracteres)');
        }

        // Validar dominio existe
        const domain = email.split('@')[1];
        if (!domain || domain.length === 0) {
            throw new Error('Dominio de email inválido');
        }
    }

    /**
     * Obtener valor del email
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Obtener dominio del email
     */
    getDomain(): string {
        return this.value.split('@')[1];
    }

    /**
     * Obtener parte local (antes del @)
     */
    getLocalPart(): string {
        return this.value.split('@')[0];
    }

    /**
     * Comparar con otro EmailAddress (case-insensitive)
     */
    equals(other: EmailAddress): boolean {
        return this.value.toLowerCase() === other.value.toLowerCase();
    }

    /**
     * Convertir a string
     */
    toString(): string {
        return this.value;
    }
}
