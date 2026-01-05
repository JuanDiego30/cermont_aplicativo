/**
 * Value Object: CostoType
 *
 * Tipo de costo en el sistema
 */

import { ValidationError } from "../exceptions";

export enum CostoTypeEnum {
  MATERIAL = "material",
  MANO_OBRA = "mano_obra",
  TRANSPORTE = "transporte",
  EQUIPO = "equipo",
  SUBCONTRATO = "subcontrato",
  OTROS = "otro",
}

export class CostoType {
  private constructor(private readonly _value: CostoTypeEnum) {
    Object.freeze(this);
  }

  public static create(value: string): CostoType {
    const normalized = value.toLowerCase().trim();

    if (!Object.values(CostoTypeEnum).includes(normalized as CostoTypeEnum)) {
      throw new ValidationError(
        `Tipo de costo inválido. Valores permitidos: ${Object.values(CostoTypeEnum).join(", ")}`,
        "tipo",
        value,
      );
    }
    return new CostoType(normalized as CostoTypeEnum);
  }

  public getValue(): CostoTypeEnum {
    return this._value;
  }

  /**
   * Verificar si es mano de obra
   */
  public isLabor(): boolean {
    return this._value === CostoTypeEnum.MANO_OBRA;
  }

  /**
   * Verificar si requiere factura
   */
  public requiresInvoice(): boolean {
    return [
      CostoTypeEnum.MATERIAL,
      CostoTypeEnum.EQUIPO,
      CostoTypeEnum.SUBCONTRATO,
    ].includes(this._value);
  }

  /**
   * Verificar si es costo directo
   */
  public isDirectCost(): boolean {
    return [CostoTypeEnum.MATERIAL, CostoTypeEnum.MANO_OBRA].includes(
      this._value,
    );
  }

  /**
   * Verificar si es costo indirecto
   */
  public isIndirectCost(): boolean {
    return !this.isDirectCost();
  }

  /**
   * Obtener categoría sugerida
   */
  public getSuggestedCategory(): "DIRECTO" | "INDIRECTO" {
    return this.isDirectCost() ? "DIRECTO" : "INDIRECTO";
  }

  public equals(other: CostoType): boolean {
    if (!other || !(other instanceof CostoType)) {
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
