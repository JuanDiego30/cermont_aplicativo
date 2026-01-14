/**
 * Value Object: EstadoHES
 *
 * Estado del ciclo de vida de la HES
 */

import {
  ValidationError,
  BusinessRuleViolationError,
} from "../../../../common/domain/exceptions";

export enum EstadoHESEnum {
  BORRADOR = "BORRADOR",
  COMPLETADO = "COMPLETADO",
  ANULADO = "ANULADO",
}

export class EstadoHES {
  private static readonly VALID_TRANSITIONS: Map<
    EstadoHESEnum,
    EstadoHESEnum[]
  > = new Map([
    [EstadoHESEnum.BORRADOR, [EstadoHESEnum.COMPLETADO, EstadoHESEnum.ANULADO]],
    [EstadoHESEnum.COMPLETADO, [EstadoHESEnum.ANULADO]],
    [EstadoHESEnum.ANULADO, []],
  ]);

  private constructor(private readonly _value: EstadoHESEnum) {
    Object.freeze(this);
  }

  public static borrador(): EstadoHES {
    return new EstadoHES(EstadoHESEnum.BORRADOR);
  }

  public static completado(): EstadoHES {
    return new EstadoHES(EstadoHESEnum.COMPLETADO);
  }

  public static anulado(): EstadoHES {
    return new EstadoHES(EstadoHESEnum.ANULADO);
  }

  public static fromString(value: string): EstadoHES {
    if (!value || value.trim() === "") {
      throw new ValidationError("Estado HES no puede estar vacío");
    }

    const upperValue = value.toUpperCase();
    const enumValue = EstadoHESEnum[upperValue as keyof typeof EstadoHESEnum];

    if (!enumValue) {
      throw new ValidationError(
        `Estado HES inválido: ${value}. Valores válidos: ${Object.values(EstadoHESEnum).join(", ")}`,
      );
    }

    return new EstadoHES(enumValue);
  }

  public getValue(): EstadoHESEnum {
    return this._value;
  }

  public canTransitionTo(newState: EstadoHESEnum): boolean {
    const allowed = EstadoHES.VALID_TRANSITIONS.get(this._value) || [];
    return allowed.includes(newState);
  }

  public transitionTo(newState: EstadoHESEnum): EstadoHES {
    if (!this.canTransitionTo(newState)) {
      throw new BusinessRuleViolationError(
        `No se puede transicionar de ${this._value} a ${newState}`,
      );
    }

    return new EstadoHES(newState);
  }

  public esBorrador(): boolean {
    return this._value === EstadoHESEnum.BORRADOR;
  }

  public esCompletado(): boolean {
    return this._value === EstadoHESEnum.COMPLETADO;
  }

  public esAnulado(): boolean {
    return this._value === EstadoHESEnum.ANULADO;
  }

  public equals(other: EstadoHES): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
