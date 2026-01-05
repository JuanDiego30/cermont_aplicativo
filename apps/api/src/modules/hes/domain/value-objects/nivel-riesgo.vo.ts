/**
 * Value Object: NivelRiesgo
 *
 * Nivel de riesgo del servicio
 */

import { ValidationError } from "../../../../common/domain/exceptions";

export enum NivelRiesgoEnum {
  BAJO = "BAJO",
  MEDIO = "MEDIO",
  ALTO = "ALTO",
  CRITICO = "CRITICO",
}

export class NivelRiesgo {
  private constructor(private readonly _value: NivelRiesgoEnum) {
    Object.freeze(this);
  }

  public static bajo(): NivelRiesgo {
    return new NivelRiesgo(NivelRiesgoEnum.BAJO);
  }

  public static medio(): NivelRiesgo {
    return new NivelRiesgo(NivelRiesgoEnum.MEDIO);
  }

  public static alto(): NivelRiesgo {
    return new NivelRiesgo(NivelRiesgoEnum.ALTO);
  }

  public static critico(): NivelRiesgo {
    return new NivelRiesgo(NivelRiesgoEnum.CRITICO);
  }

  public static fromString(value: string): NivelRiesgo {
    if (!value || value.trim() === "") {
      throw new ValidationError("Nivel de riesgo no puede estar vacío");
    }

    const upperValue = value.toUpperCase();
    const enumValue =
      NivelRiesgoEnum[upperValue as keyof typeof NivelRiesgoEnum];

    if (!enumValue) {
      throw new ValidationError(
        `Nivel de riesgo inválido: ${value}. Valores válidos: ${Object.values(NivelRiesgoEnum).join(", ")}`,
      );
    }

    return new NivelRiesgo(enumValue);
  }

  public getValue(): NivelRiesgoEnum {
    return this._value;
  }

  public getPuntuacion(): number {
    switch (this._value) {
      case NivelRiesgoEnum.BAJO:
        return 1;
      case NivelRiesgoEnum.MEDIO:
        return 2;
      case NivelRiesgoEnum.ALTO:
        return 3;
      case NivelRiesgoEnum.CRITICO:
        return 4;
    }
  }

  public esBajo(): boolean {
    return this._value === NivelRiesgoEnum.BAJO;
  }

  public esMedio(): boolean {
    return this._value === NivelRiesgoEnum.MEDIO;
  }

  public esAlto(): boolean {
    return this._value === NivelRiesgoEnum.ALTO;
  }

  public esCritico(): boolean {
    return this._value === NivelRiesgoEnum.CRITICO;
  }

  public requiereAutorizacionSupervisor(): boolean {
    return this.esAlto() || this.esCritico();
  }

  public getColor(): string {
    switch (this._value) {
      case NivelRiesgoEnum.BAJO:
        return "#28a745";
      case NivelRiesgoEnum.MEDIO:
        return "#ffc107";
      case NivelRiesgoEnum.ALTO:
        return "#fd7e14";
      case NivelRiesgoEnum.CRITICO:
        return "#dc3545";
    }
  }

  public equals(other: NivelRiesgo): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
