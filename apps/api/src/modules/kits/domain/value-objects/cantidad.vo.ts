/**
 * Value Object: Cantidad
 * 
 * Cantidad de items con validación
 */
import { ValidationError } from '../../../../common/domain/exceptions';

export class Cantidad {
    private constructor(private readonly _value: number) {
        Object.freeze(this);
    }

    public static create(value: number): Cantidad {
        if (value < 0) {
            throw new ValidationError('Cantidad no puede ser negativa', 'cantidad');
        }
        if (!Number.isInteger(value)) {
            throw new ValidationError('Cantidad debe ser un número entero', 'cantidad');
        }
        return new Cantidad(value);
    }

    public static zero(): Cantidad {
        return new Cantidad(0);
    }

    public static one(): Cantidad {
        return new Cantidad(1);
    }

    public getValue(): number {
        return this._value;
    }

    public add(other: Cantidad): Cantidad {
        return Cantidad.create(this._value + other._value);
    }

    public subtract(other: Cantidad): Cantidad {
        const result = this._value - other._value;
        if (result < 0) {
            throw new ValidationError('Resultado de resta no puede ser negativo', 'cantidad');
        }
        return Cantidad.create(result);
    }

    public multiply(factor: number): Cantidad {
        if (!Number.isInteger(factor) || factor < 0) {
            throw new ValidationError('Factor debe ser entero positivo', 'cantidad');
        }
        return Cantidad.create(this._value * factor);
    }

    public isZero(): boolean {
        return this._value === 0;
    }

    public isGreaterThan(other: Cantidad): boolean {
        return this._value > other._value;
    }

    public isGreaterThanOrEqual(other: Cantidad): boolean {
        return this._value >= other._value;
    }

    public isLessThan(other: Cantidad): boolean {
        return this._value < other._value;
    }

    public equals(other: Cantidad): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value.toString();
    }
}
