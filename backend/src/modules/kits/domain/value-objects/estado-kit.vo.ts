/**
 * Value Object: EstadoKit
 *
 * Estado del kit (ACTIVO, INACTIVO, EN_USO, EN_MANTENIMIENTO)
 */

export enum EstadoKitEnum {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  EN_USO = "EN_USO",
  EN_MANTENIMIENTO = "EN_MANTENIMIENTO",
}

export class EstadoKit {
  private constructor(private readonly _value: EstadoKitEnum) {
    Object.freeze(this);
  }

  public static create(value: string): EstadoKit {
    const enumValue =
      EstadoKitEnum[value.toUpperCase() as keyof typeof EstadoKitEnum];
    if (!enumValue) {
      return EstadoKit.activo(); // Default to active
    }
    return new EstadoKit(enumValue);
  }

  public static activo(): EstadoKit {
    return new EstadoKit(EstadoKitEnum.ACTIVO);
  }

  public static inactivo(): EstadoKit {
    return new EstadoKit(EstadoKitEnum.INACTIVO);
  }

  public static enUso(): EstadoKit {
    return new EstadoKit(EstadoKitEnum.EN_USO);
  }

  public static enMantenimiento(): EstadoKit {
    return new EstadoKit(EstadoKitEnum.EN_MANTENIMIENTO);
  }

  public getValue(): EstadoKitEnum {
    return this._value;
  }

  public esActivo(): boolean {
    return this._value === EstadoKitEnum.ACTIVO;
  }

  public esInactivo(): boolean {
    return this._value === EstadoKitEnum.INACTIVO;
  }

  public esEnUso(): boolean {
    return this._value === EstadoKitEnum.EN_USO;
  }

  public esEnMantenimiento(): boolean {
    return this._value === EstadoKitEnum.EN_MANTENIMIENTO;
  }

  public puedeAsignarse(): boolean {
    return this._value === EstadoKitEnum.ACTIVO;
  }

  public puedeEditarse(): boolean {
    return this._value !== EstadoKitEnum.EN_USO;
  }

  public canTransitionTo(newState: EstadoKitEnum): boolean {
    const transitions: Record<EstadoKitEnum, EstadoKitEnum[]> = {
      [EstadoKitEnum.ACTIVO]: [
        EstadoKitEnum.INACTIVO,
        EstadoKitEnum.EN_USO,
        EstadoKitEnum.EN_MANTENIMIENTO,
      ],
      [EstadoKitEnum.INACTIVO]: [EstadoKitEnum.ACTIVO],
      [EstadoKitEnum.EN_USO]: [
        EstadoKitEnum.ACTIVO,
        EstadoKitEnum.EN_MANTENIMIENTO,
      ],
      [EstadoKitEnum.EN_MANTENIMIENTO]: [
        EstadoKitEnum.ACTIVO,
        EstadoKitEnum.INACTIVO,
      ],
    };
    return transitions[this._value]?.includes(newState) ?? false;
  }

  public equals(other: EstadoKit): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
