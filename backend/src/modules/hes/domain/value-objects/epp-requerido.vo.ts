/**
 * Value Object: EPPRequerido
 *
 * Equipo de Protección Personal requerido
 */

import { ValidationError } from "../../../../shared/domain/exceptions";

export enum TipoEPPEnum {
  CASCO = "CASCO",
  GAFAS = "GAFAS",
  GUANTES = "GUANTES",
  BOTAS = "BOTAS",
  ARNES = "ARNES",
  MASCARILLA = "MASCARILLA",
  PROTECCION_AUDITIVA = "PROTECCION_AUDITIVA",
  ROPA_DE_TRABAJO = "ROPA_DE_TRABAJO",
  OTRO = "OTRO",
}

export class EPPRequerido {
  private constructor(
    private readonly _tipo: TipoEPPEnum,
    private readonly _descripcion?: string,
  ) {
    Object.freeze(this);
  }

  public static create(tipo: TipoEPPEnum, descripcion?: string): EPPRequerido {
    return new EPPRequerido(tipo, descripcion);
  }

  public static fromString(value: string, descripcion?: string): EPPRequerido {
    if (!value || value.trim() === "") {
      throw new ValidationError("Tipo de EPP no puede estar vacío");
    }

    const upperValue = value.toUpperCase().replace(/\s+/g, "_");
    const enumValue = TipoEPPEnum[upperValue as keyof typeof TipoEPPEnum];

    if (!enumValue) {
      throw new ValidationError(
        `Tipo de EPP inválido: ${value}. Valores válidos: ${Object.values(TipoEPPEnum).join(", ")}`,
      );
    }

    return new EPPRequerido(enumValue, descripcion);
  }

  public getTipo(): TipoEPPEnum {
    return this._tipo;
  }

  public getDescripcion(): string | undefined {
    return this._descripcion;
  }

  public toString(): string {
    if (this._descripcion) {
      return `${this._tipo.replace(/_/g, " ")} - ${this._descripcion}`;
    }
    return this._tipo.replace(/_/g, " ");
  }

  public equals(other: EPPRequerido): boolean {
    return this._tipo === other._tipo;
  }
}

