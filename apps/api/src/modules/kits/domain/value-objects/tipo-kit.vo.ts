/**
 * Value Object: TipoKit
 *
 * Tipo de kit (BASICO, COMPLETO, ESPECIALIZADO, EMERGENCIA)
 */
import { ValidationError } from "../../../../common/domain/exceptions";

export enum TipoKitEnum {
  BASICO = "BASICO",
  COMPLETO = "COMPLETO",
  ESPECIALIZADO = "ESPECIALIZADO",
  EMERGENCIA = "EMERGENCIA",
}

export class TipoKit {
  private constructor(private readonly _value: TipoKitEnum) {
    Object.freeze(this);
  }

  public static create(value: string): TipoKit {
    const enumValue =
      TipoKitEnum[value.toUpperCase() as keyof typeof TipoKitEnum];
    if (!enumValue) {
      throw new ValidationError(
        `Tipo de kit inválido: ${value}. Valores válidos: ${Object.keys(TipoKitEnum).join(", ")}`,
        "tipo",
      );
    }
    return new TipoKit(enumValue);
  }

  public static basico(): TipoKit {
    return new TipoKit(TipoKitEnum.BASICO);
  }

  public static completo(): TipoKit {
    return new TipoKit(TipoKitEnum.COMPLETO);
  }

  public static especializado(): TipoKit {
    return new TipoKit(TipoKitEnum.ESPECIALIZADO);
  }

  public static emergencia(): TipoKit {
    return new TipoKit(TipoKitEnum.EMERGENCIA);
  }

  public getValue(): TipoKitEnum {
    return this._value;
  }

  public getDescripcion(): string {
    switch (this._value) {
      case TipoKitEnum.BASICO:
        return "Kit con herramientas básicas para trabajos simples";
      case TipoKitEnum.COMPLETO:
        return "Kit completo para trabajos complejos";
      case TipoKitEnum.ESPECIALIZADO:
        return "Kit especializado para trabajos específicos";
      case TipoKitEnum.EMERGENCIA:
        return "Kit de emergencia para atención inmediata";
    }
  }

  public equals(other: TipoKit): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
