/**
 * @valueObject Email
 * 
 * Representa un email válido del sistema Cermont.
 * 
 * Invariantes:
 * - Debe tener formato válido (RFC 5322)
 * - Debe estar en lowercase
 * - Máximo 255 caracteres
 * - No permite emails desechables
 */

import { ValidationError } from '../exceptions';

export class Email {
    // RFC 5322 compliant regex for email validation
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    private static readonly MAX_LENGTH = 255;

    // Dominios desechables bloqueados
    private static readonly DISPOSABLE_DOMAINS = [
        'tempmail.com',
        '10minutemail.com',
        'guerrillamail.com',
        'mailinator.com',
        'throwaway.email',
        'temp-mail.org',
    ];

    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
        Object.freeze(this);
    }

    /**
     * Factory method para crear Email validado
     * @throws {ValidationError} si el email es inválido
     */
    static create(email: string): Email {
        this.validate(email);
        const normalized = email.toLowerCase().trim();
        return new Email(normalized);
    }

    /**
     * Validación completa de email
     */
    private static validate(value: string): void {
        // 1. Validar no vacío
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new ValidationError('Email es requerido', 'email');
        }

        // 2. Validar longitud
        if (value.length > this.MAX_LENGTH) {
            throw new ValidationError(
                `Email no puede exceder ${this.MAX_LENGTH} caracteres`,
                'email',
                value,
            );
        }

        // 3. Validar formato RFC 5322
        if (!this.EMAIL_REGEX.test(value)) {
            throw new ValidationError('Formato de email inválido', 'email', value);
        }

        // 4. Validar dominio no desechable
        const domain = value.split('@')[1]?.toLowerCase();
        if (domain && this.DISPOSABLE_DOMAINS.includes(domain)) {
            throw new ValidationError('No se permiten emails desechables', 'email', value);
        }
    }

    /**
     * Obtiene el valor del email
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Obtiene el dominio del email
     */
    getDomain(): string {
        return this.value.split('@')[1] || '';
    }

    /**
     * Obtiene la parte local del email (antes del @)
     */
    getLocalPart(): string {
        return this.value.split('@')[0] || '';
    }

    /**
     * Verifica si es email corporativo
     */
    isCorporate(corporateDomains: string[]): boolean {
        return corporateDomains.includes(this.getDomain());
    }

    /**
     * Comparación por valor
     */
    equals(other: Email): boolean {
        if (!other || !(other instanceof Email)) {
            return false;
        }
        return this.value === other.value;
    }

    /**
     * Representación string
     */
    toString(): string {
        return this.value;
    }

    /**
     * Serialización JSON
     */
    toJSON(): string {
        return this.value;
    }
}
