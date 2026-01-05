import { randomUUID } from "crypto";
import {
  TipoCertificacion,
  TipoCertificacionTecnico,
} from "../value-objects/tipo-certificacion.vo";
import { EstadoVigencia } from "../value-objects/estado-vigencia.vo";

export interface CertificacionTecnicoProps {
  id?: string;
  tecnicoId: string;
  tipo: TipoCertificacionTecnico;
  entidadCertificadora: string;
  numeroCertificado: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  archivoUrl?: string;
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Certificación de Técnico Entity
 * Representa una certificación que posee un técnico
 */
export class CertificacionTecnico {
  private readonly _id: string;
  private readonly _tecnicoId: string;
  private readonly _tipo: TipoCertificacion;
  private readonly _entidadCertificadora: string;
  private readonly _numeroCertificado: string;
  private readonly _fechaEmision: Date;
  private readonly _fechaVencimiento: Date;
  private readonly _archivoUrl?: string;
  private _observaciones?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: {
    id: string;
    tecnicoId: string;
    tipo: TipoCertificacion;
    entidadCertificadora: string;
    numeroCertificado: string;
    fechaEmision: Date;
    fechaVencimiento: Date;
    archivoUrl?: string;
    observaciones?: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this._id = props.id;
    this._tecnicoId = props.tecnicoId;
    this._tipo = props.tipo;
    this._entidadCertificadora = props.entidadCertificadora;
    this._numeroCertificado = props.numeroCertificado;
    this._fechaEmision = props.fechaEmision;
    this._fechaVencimiento = props.fechaVencimiento;
    this._archivoUrl = props.archivoUrl;
    this._observaciones = props.observaciones;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  static create(props: CertificacionTecnicoProps): CertificacionTecnico {
    // Validaciones
    if (!props.tecnicoId) {
      throw new Error("El ID del técnico es requerido");
    }
    if (
      !props.entidadCertificadora ||
      props.entidadCertificadora.trim().length === 0
    ) {
      throw new Error("La entidad certificadora es requerida");
    }
    if (
      !props.numeroCertificado ||
      props.numeroCertificado.trim().length === 0
    ) {
      throw new Error("El número de certificado es requerido");
    }
    if (props.fechaEmision >= props.fechaVencimiento) {
      throw new Error(
        "La fecha de emisión debe ser anterior a la fecha de vencimiento",
      );
    }

    return new CertificacionTecnico({
      id: props.id || randomUUID(),
      tecnicoId: props.tecnicoId,
      tipo: TipoCertificacion.tecnico(props.tipo),
      entidadCertificadora: props.entidadCertificadora.trim(),
      numeroCertificado: props.numeroCertificado.trim(),
      fechaEmision: new Date(props.fechaEmision),
      fechaVencimiento: new Date(props.fechaVencimiento),
      archivoUrl: props.archivoUrl,
      observaciones: props.observaciones,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    });
  }

  static fromPersistence(data: Record<string, any>): CertificacionTecnico {
    return new CertificacionTecnico({
      id: data.id,
      tecnicoId: data.tecnicoId,
      tipo: TipoCertificacion.tecnico(data.tipo as TipoCertificacionTecnico),
      entidadCertificadora: data.entidadCertificadora,
      numeroCertificado: data.numeroCertificado,
      fechaEmision: new Date(data.fechaEmision),
      fechaVencimiento: new Date(data.fechaVencimiento),
      archivoUrl: data.archivoUrl,
      observaciones: data.observaciones,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get tecnicoId(): string {
    return this._tecnicoId;
  }
  get tipo(): TipoCertificacion {
    return this._tipo;
  }
  get entidadCertificadora(): string {
    return this._entidadCertificadora;
  }
  get numeroCertificado(): string {
    return this._numeroCertificado;
  }
  get fechaEmision(): Date {
    return this._fechaEmision;
  }
  get fechaVencimiento(): Date {
    return this._fechaVencimiento;
  }
  get archivoUrl(): string | undefined {
    return this._archivoUrl;
  }
  get observaciones(): string | undefined {
    return this._observaciones;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Obtener estado de vigencia
   */
  getEstadoVigencia(): EstadoVigencia {
    return EstadoVigencia.fromFechaVencimiento(this._fechaVencimiento);
  }

  /**
   * Verificar si está vigente
   */
  isVigente(): boolean {
    return this.getEstadoVigencia().isVigente();
  }

  /**
   * Verificar si requiere alerta
   */
  requiresAlert(): boolean {
    return this.getEstadoVigencia().requiresAlert();
  }

  /**
   * Actualizar observaciones
   */
  updateObservaciones(observaciones: string): void {
    this._observaciones = observaciones;
    this._updatedAt = new Date();
  }

  /**
   * Convertir a persistencia
   */
  toPersistence(): Record<string, unknown> {
    return {
      id: this._id,
      tecnicoId: this._tecnicoId,
      tipo: this._tipo.getValue(),
      entidadCertificadora: this._entidadCertificadora,
      numeroCertificado: this._numeroCertificado,
      fechaEmision: this._fechaEmision.toISOString(),
      fechaVencimiento: this._fechaVencimiento.toISOString(),
      archivoUrl: this._archivoUrl,
      observaciones: this._observaciones,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }

  /**
   * Convertir a DTO
   */
  toDTO(): {
    id: string;
    tecnicoId: string;
    tipo: string;
    tipoDisplay: string;
    entidadCertificadora: string;
    numeroCertificado: string;
    fechaEmision: string;
    fechaVencimiento: string;
    estadoVigencia: string;
    diasRestantes: number;
    mensajeVigencia: string;
    alertLevel: string | null;
    archivoUrl?: string;
    observaciones?: string;
  } {
    const estadoVigencia = this.getEstadoVigencia();
    return {
      id: this._id,
      tecnicoId: this._tecnicoId,
      tipo: this._tipo.getValue(),
      tipoDisplay: this._tipo.getDisplayName(),
      entidadCertificadora: this._entidadCertificadora,
      numeroCertificado: this._numeroCertificado,
      fechaEmision: this._fechaEmision.toISOString(),
      fechaVencimiento: this._fechaVencimiento.toISOString(),
      estadoVigencia: estadoVigencia.getValue(),
      diasRestantes: estadoVigencia.getDiasRestantes(),
      mensajeVigencia: estadoVigencia.getDisplayMessage(),
      alertLevel: estadoVigencia.getAlertLevel(),
      archivoUrl: this._archivoUrl,
      observaciones: this._observaciones,
    };
  }
}
