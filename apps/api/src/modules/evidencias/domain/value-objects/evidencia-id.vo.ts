/**
 * @valueObject EvidenciaId
 * @description Value Object for Evidencia unique identifier
 */

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class EvidenciaId {
    private constructor(private readonly _value: string) {
        Object.freeze(this);
    }

    public static generate(): EvidenciaId {
        return new EvidenciaId(uuidv4());
    }

    public static create(value: string): EvidenciaId {
        if (!value || !uuidValidate(value)) {
            throw new Error(`Invalid EvidenciaId: ${value}`);
        }
        return new EvidenciaId(value);
    }

    public getValue(): string {
        return this._value;
    }

    public equals(other: EvidenciaId): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value;
    }
}
