/**
 * Value Object: CategoriaKit
 * 
 * Categoría del kit (ELECTRICIDAD, PLOMERIA, HVAC, etc.)
 */
import { ValidationError } from '../../../../common/domain/exceptions';

export enum CategoriaKitEnum {
    ELECTRICIDAD = 'ELECTRICIDAD',
    PLOMERIA = 'PLOMERIA',
    HVAC = 'HVAC',
    CARPINTERIA = 'CARPINTERIA',
    PINTURA = 'PINTURA',
    ELECTRONICA = 'ELECTRONICA',
    MECANICA = 'MECANICA',
    INSTRUMENTACION = 'INSTRUMENTACION',
    LINEA_VIDA = 'LINEA_VIDA',
    CCTV = 'CCTV',
    GENERAL = 'GENERAL',
}

export class CategoriaKit {
    private constructor(private readonly _value: CategoriaKitEnum) {
        Object.freeze(this);
    }

    public static create(value: string): CategoriaKit {
        const enumValue = CategoriaKitEnum[value.toUpperCase() as keyof typeof CategoriaKitEnum];
        if (!enumValue) {
            throw new ValidationError(
                `Categoría inválida: ${value}. Valores válidos: ${Object.keys(CategoriaKitEnum).join(', ')}`,
                'categoria',
            );
        }
        return new CategoriaKit(enumValue);
    }

    public static electricidad(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.ELECTRICIDAD);
    }

    public static plomeria(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.PLOMERIA);
    }

    public static hvac(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.HVAC);
    }

    public static instrumentacion(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.INSTRUMENTACION);
    }

    public static lineaVida(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.LINEA_VIDA);
    }

    public static cctv(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.CCTV);
    }

    public static general(): CategoriaKit {
        return new CategoriaKit(CategoriaKitEnum.GENERAL);
    }

    public getValue(): CategoriaKitEnum {
        return this._value;
    }

    public getCodigo(): string {
        // Return first 4 chars for code generation
        return this._value.substring(0, 4);
    }

    public equals(other: CategoriaKit): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value;
    }
}
