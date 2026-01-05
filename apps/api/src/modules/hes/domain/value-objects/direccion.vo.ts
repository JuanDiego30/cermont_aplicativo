/**
 * Value Object: Direccion
 *
 * Dirección completa con validación
 */

import { ValidationError } from "../../../../common/domain/exceptions";

export interface DireccionProps {
  calle: string;
  numero?: string;
  barrio?: string;
  ciudad: string;
  departamento?: string;
  pais?: string;
  codigoPostal?: string;
}

export class Direccion {
  private constructor(
    private readonly _calle: string,
    private readonly _ciudad: string,
    private readonly _pais: string,
    private readonly _numero?: string,
    private readonly _barrio?: string,
    private readonly _departamento?: string,
    private readonly _codigoPostal?: string,
  ) {
    Object.freeze(this);
  }

  public static create(props: DireccionProps): Direccion {
    Direccion.validate(props);
    return new Direccion(
      props.calle,
      props.ciudad,
      props.pais || "Colombia",
      props.numero,
      props.barrio,
      props.departamento,
      props.codigoPostal,
    );
  }

  private static validate(props: DireccionProps): void {
    if (!props.calle || props.calle.trim() === "") {
      throw new ValidationError("Calle es requerida");
    }

    if (props.calle.length < 3) {
      throw new ValidationError("Calle debe tener al menos 3 caracteres");
    }

    if (!props.ciudad || props.ciudad.trim() === "") {
      throw new ValidationError("Ciudad es requerida");
    }

    if (props.ciudad.length < 2) {
      throw new ValidationError("Ciudad debe tener al menos 2 caracteres");
    }
  }

  public getCalle(): string {
    return this._calle;
  }

  public getNumero(): string | undefined {
    return this._numero;
  }

  public getCiudad(): string {
    return this._ciudad;
  }

  public getPais(): string {
    return this._pais;
  }

  public toString(): string {
    const parts: string[] = [];

    parts.push(this._calle);
    if (this._numero) {
      parts.push(`#${this._numero}`);
    }
    if (this._barrio) {
      parts.push(`Barrio ${this._barrio}`);
    }
    parts.push(this._ciudad);
    if (this._departamento) {
      parts.push(this._departamento);
    }
    if (this._pais) {
      parts.push(this._pais);
    }
    if (this._codigoPostal) {
      parts.push(`Código Postal: ${this._codigoPostal}`);
    }

    return parts.join(", ");
  }

  public equals(other: Direccion): boolean {
    return (
      this._calle === other._calle &&
      this._numero === other._numero &&
      this._ciudad === other._ciudad &&
      this._departamento === other._departamento &&
      this._pais === other._pais
    );
  }
}
