/**
 * Value Object: CostoCategory
 * 
 * Categoría de costo (DIRECTO o INDIRECTO)
 */

import { ValidationError } from '../exceptions';

export enum CostoCategoryEnum {
  DIRECTO = 'DIRECTO',
  INDIRECTO = 'INDIRECTO',
}

export class CostoCategory {
  private constructor(private readonly _value: CostoCategoryEnum) {
    Object.freeze(this);
  }

  public static create(value: string): CostoCategory {
    const normalized = value.toUpperCase().trim();
    
    if (!Object.values(CostoCategoryEnum).includes(normalized as CostoCategoryEnum)) {
      throw new ValidationError(
        `Categoría inválida. Valores permitidos: ${Object.values(CostoCategoryEnum).join(', ')}`,
        'category',
        value,
      );
    }
    return new CostoCategory(normalized as CostoCategoryEnum);
  }

  public static directo(): CostoCategory {
    return new CostoCategory(CostoCategoryEnum.DIRECTO);
  }

  public static indirecto(): CostoCategory {
    return new CostoCategory(CostoCategoryEnum.INDIRECTO);
  }

  public getValue(): CostoCategoryEnum {
    return this._value;
  }

  public isDirecto(): boolean {
    return this._value === CostoCategoryEnum.DIRECTO;
  }

  public isIndirecto(): boolean {
    return this._value === CostoCategoryEnum.INDIRECTO;
  }

  public equals(other: CostoCategory): boolean {
    if (!other || !(other instanceof CostoCategory)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}

