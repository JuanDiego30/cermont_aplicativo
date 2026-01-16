/**
 * Entity: DiagnosticoPreliminar
 *
 * Diagnóstico preliminar realizado por el técnico
 */

import { ValidationError } from "../../../../shared/domain/exceptions";

export interface CreateDiagnosticoProps {
  descripcion: string;
  causaProbable?: string;
  accionesRecomendadas?: string[];
  requiereRepuestos?: boolean;
  repuestosNecesarios?: string[];
  tiempoEstimado?: number; // En horas
}

export class DiagnosticoPreliminar {
  private constructor(
    private readonly _descripcion: string,
    private readonly _accionesRecomendadas: string[],
    private readonly _requiereRepuestos: boolean,
    private readonly _causaProbable?: string,
    private readonly _repuestosNecesarios?: string[],
    private readonly _tiempoEstimado?: number,
  ) {}

  public static create(props: CreateDiagnosticoProps): DiagnosticoPreliminar {
    const diagnostico = new DiagnosticoPreliminar(
      props.descripcion,
      props.accionesRecomendadas || [],
      props.requiereRepuestos || false,
      props.causaProbable,
      props.repuestosNecesarios,
      props.tiempoEstimado,
    );

    diagnostico.validate();
    return diagnostico;
  }

  private validate(): void {
    if (!this._descripcion || this._descripcion.trim() === "") {
      throw new ValidationError("Descripción del diagnóstico es requerida");
    }

    if (this._descripcion.length < 10) {
      throw new ValidationError(
        "Descripción del diagnóstico debe tener al menos 10 caracteres",
      );
    }

    if (
      this._requiereRepuestos &&
      (!this._repuestosNecesarios || this._repuestosNecesarios.length === 0)
    ) {
      throw new ValidationError(
        "Debe especificar los repuestos necesarios si requiere repuestos",
      );
    }

    if (this._tiempoEstimado !== undefined && this._tiempoEstimado < 0) {
      throw new ValidationError("Tiempo estimado no puede ser negativo");
    }
  }

  public getDescripcion(): string {
    return this._descripcion;
  }

  public getCausaProbable(): string | undefined {
    return this._causaProbable;
  }

  public getAccionesRecomendadas(): string[] {
    return [...this._accionesRecomendadas];
  }

  public requiereRepuestos(): boolean {
    return this._requiereRepuestos;
  }

  public getRepuestosNecesarios(): string[] | undefined {
    return this._repuestosNecesarios
      ? [...this._repuestosNecesarios]
      : undefined;
  }

  public getTiempoEstimado(): number | undefined {
    return this._tiempoEstimado;
  }

  public esComplejo(): boolean {
    return (
      this._requiereRepuestos ||
      (this._tiempoEstimado !== undefined && this._tiempoEstimado > 4)
    );
  }
}

