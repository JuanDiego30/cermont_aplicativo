/**
 * @valueObject TecnicoDisponibilidad
 * @description Value Object representing technician availability status
 * @layer Domain
 */
export type DisponibilidadLevel =
  | "disponible"
  | "ocupado"
  | "vacaciones"
  | "baja";

export class TecnicoDisponibilidad {
  private static readonly VALID_TRANSITIONS: Record<
    DisponibilidadLevel,
    DisponibilidadLevel[]
  > = {
    disponible: ["ocupado", "vacaciones", "baja"],
    ocupado: ["disponible", "vacaciones", "baja"],
    vacaciones: ["disponible", "baja"],
    baja: ["disponible"],
  };

  private constructor(private readonly _value: DisponibilidadLevel) {
    Object.freeze(this);
  }

  get value(): DisponibilidadLevel {
    return this._value;
  }

  get isAvailable(): boolean {
    return this._value === "disponible";
  }

  get canBeAssigned(): boolean {
    return this._value === "disponible";
  }

  static create(value: DisponibilidadLevel): TecnicoDisponibilidad {
    return new TecnicoDisponibilidad(value);
  }

  static disponible(): TecnicoDisponibilidad {
    return new TecnicoDisponibilidad("disponible");
  }

  static ocupado(): TecnicoDisponibilidad {
    return new TecnicoDisponibilidad("ocupado");
  }

  static vacaciones(): TecnicoDisponibilidad {
    return new TecnicoDisponibilidad("vacaciones");
  }

  static baja(): TecnicoDisponibilidad {
    return new TecnicoDisponibilidad("baja");
  }

  canTransitionTo(newState: DisponibilidadLevel): boolean {
    return TecnicoDisponibilidad.VALID_TRANSITIONS[this._value].includes(
      newState,
    );
  }

  transitionTo(newState: DisponibilidadLevel): TecnicoDisponibilidad {
    if (!this.canTransitionTo(newState)) {
      throw new Error(`Transición inválida de ${this._value} a ${newState}`);
    }
    return TecnicoDisponibilidad.create(newState);
  }

  equals(other: TecnicoDisponibilidad): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
