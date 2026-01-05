/**
 * @valueObject TecnicoEspecialidad
 * @description Value Object representing technician specialization
 * @layer Domain
 */
export type EspecialidadType =
  | "electrico"
  | "mecanico"
  | "soldadura"
  | "altura"
  | "hes"
  | "general";

export class TecnicoEspecialidad {
  private static readonly VALID_TYPES: EspecialidadType[] = [
    "electrico",
    "mecanico",
    "soldadura",
    "altura",
    "hes",
    "general",
  ];

  private constructor(private readonly _values: EspecialidadType[]) {
    Object.freeze(this);
  }

  get values(): readonly EspecialidadType[] {
    return this._values;
  }

  get primary(): EspecialidadType {
    return this._values[0] || "general";
  }

  static create(values: EspecialidadType[]): TecnicoEspecialidad {
    const validValues = values.filter((v) =>
      TecnicoEspecialidad.VALID_TYPES.includes(v),
    );
    if (validValues.length === 0) {
      return new TecnicoEspecialidad(["general"]);
    }
    return new TecnicoEspecialidad(validValues);
  }

  static general(): TecnicoEspecialidad {
    return new TecnicoEspecialidad(["general"]);
  }

  hasEspecialidad(especialidad: EspecialidadType): boolean {
    return this._values.includes(especialidad);
  }

  canPerform(requiredEspecialidades: EspecialidadType[]): boolean {
    return requiredEspecialidades.every(
      (req) => this._values.includes(req) || this._values.includes("general"),
    );
  }

  addEspecialidad(especialidad: EspecialidadType): TecnicoEspecialidad {
    if (this._values.includes(especialidad)) {
      return this;
    }
    return TecnicoEspecialidad.create([...this._values, especialidad]);
  }

  equals(other: TecnicoEspecialidad): boolean {
    return (
      JSON.stringify(this._values.sort()) ===
      JSON.stringify(other._values.sort())
    );
  }

  toString(): string {
    return this._values.join(", ");
  }
}
