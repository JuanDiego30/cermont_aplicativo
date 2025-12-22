/**
 * @valueObject ArchivedOrderId
 * 
 * Representa un identificador único de orden archivada (UUID v4)
 * 
 * Invariantes:
 * - Debe ser un UUID válido (formato 8-4-4-4-12)
 * - Inmutable
 * 
 * @example
 * const id = ArchivedOrderId.generate();
 * const id = ArchivedOrderId.create('123e4567-e89b-12d3-a456-426614174000');
 */

import { randomUUID } from 'crypto';
import { ValidationError } from '../exceptions';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ArchivedOrderId {
    private constructor(private readonly value: string) {
        Object.freeze(this);
    }

    /**
     * Generar un nuevo ID
     */
    static generate(): ArchivedOrderId {
        return new ArchivedOrderId(randomUUID());
    }

    /**
     * Crear desde UUID existente
     */
    static create(value: string): ArchivedOrderId {
        this.validate(value);
        return new ArchivedOrderId(value.toLowerCase());
    }

    private static validate(value: string): void {
        if (!value || !UUID_REGEX.test(value)) {
            throw new ValidationError('ArchivedOrderId debe ser un UUID válido', 'archivedOrderId', value);
        }
    }

    getValue(): string {
        return this.value;
    }

    equals(other: ArchivedOrderId): boolean {
        if (!other || !(other instanceof ArchivedOrderId)) {
            return false;
        }
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}
