/**
 * Value Object: KitId
 * 
 * Identificador único de un Kit (UUID)
 */
import { v4 as uuidv4 } from 'uuid';
import { ValidationError } from '../../../../common/domain/exceptions';

export class KitId {
    private constructor(private readonly _value: string) {
        Object.freeze(this);
    }

    public static generate(): KitId {
        return new KitId(uuidv4());
    }

    public static create(value: string): KitId {
        if (!value || value.trim().length === 0) {
            throw new ValidationError('Kit ID no puede estar vacío', 'kitId');
        }
        return new KitId(value);
    }

    public getValue(): string {
        return this._value;
    }

    public equals(other: KitId): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value;
    }
}
