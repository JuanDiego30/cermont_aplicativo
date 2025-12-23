/**
 * Value Objects: CostoUnitario y CostoTotal
 * 
 * Manejo de costos con validación y operaciones
 */
import { ValidationError } from '../../../../common/domain/exceptions';

export class CostoUnitario {
    private constructor(private readonly _value: number) {
        Object.freeze(this);
    }

    public static create(value: number): CostoUnitario {
        if (value < 0) {
            throw new ValidationError('Costo no puede ser negativo', 'costoUnitario');
        }
        // Round to 2 decimals
        const rounded = Math.round(value * 100) / 100;
        return new CostoUnitario(rounded);
    }

    public static zero(): CostoUnitario {
        return new CostoUnitario(0);
    }

    public getValue(): number {
        return this._value;
    }

    public multiply(cantidad: number): number {
        return Math.round(this._value * cantidad * 100) / 100;
    }

    public equals(other: CostoUnitario): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return `$${this._value.toFixed(2)}`;
    }
}

export class CostoTotal {
    private constructor(private readonly _value: number) {
        Object.freeze(this);
    }

    public static create(value: number): CostoTotal {
        if (value < 0) {
            throw new ValidationError('Costo total no puede ser negativo', 'costoTotal');
        }
        const rounded = Math.round(value * 100) / 100;
        return new CostoTotal(rounded);
    }

    public static zero(): CostoTotal {
        return new CostoTotal(0);
    }

    public static fromUnitAndQuantity(costoUnitario: CostoUnitario, cantidad: number): CostoTotal {
        return CostoTotal.create(costoUnitario.multiply(cantidad));
    }

    public getValue(): number {
        return this._value;
    }

    public add(other: CostoTotal): CostoTotal {
        return CostoTotal.create(this._value + other._value);
    }

    public subtract(other: CostoTotal): CostoTotal {
        const result = this._value - other._value;
        if (result < 0) {
            throw new ValidationError('Resultado no puede ser negativo', 'costoTotal');
        }
        return CostoTotal.create(result);
    }

    public isZero(): boolean {
        return this._value === 0;
    }

    public isGreaterThan(other: CostoTotal): boolean {
        return this._value > other._value;
    }

    public equals(other: CostoTotal): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return `$${this._value.toFixed(2)}`;
    }

    public toFormattedString(currency: string = 'COP'): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency,
        }).format(this._value);
    }
}
