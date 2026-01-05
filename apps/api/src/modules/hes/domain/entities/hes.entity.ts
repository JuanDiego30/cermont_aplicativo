/**
 * Aggregate Root: HES
 *
 * Representa una Hoja de Entrada de Servicio
 *
 * Invariantes:
 * - Nombre no puede estar vacío
 * - Debe tener información del cliente
 * - Solo BORRADOR puede editarse
 * - Solo COMPLETADO puede tener ambas firmas
 * - Checklist de seguridad debe estar completo para completar
 */

import { HESId } from "../value-objects/hes-id.vo";
import { HESNumero } from "../value-objects/hes-numero.vo";
import { TipoServicio } from "../value-objects/tipo-servicio.vo";
import { Prioridad } from "../value-objects/prioridad.vo";
import { EstadoHES, EstadoHESEnum } from "../value-objects/estado-hes.vo";
import { NivelRiesgo } from "../value-objects/nivel-riesgo.vo";
import { ClienteInfo } from "./cliente-info.entity";
import { CondicionesEntrada } from "./condiciones-entrada.entity";
import { DiagnosticoPreliminar } from "./diagnostico-preliminar.entity";
import { RequerimientosSeguridad } from "./requerimientos-seguridad.entity";
import { FirmaDigital } from "./firma-digital.entity";
import {
  ValidationError,
  BusinessRuleViolationError,
} from "../../../../common/domain/exceptions";
import {
  HESCreatedEvent,
  HESCompletedEvent,
  HESSignedEvent,
  HESCancelledEvent,
} from "../events";

export interface CreateHESProps {
  numero?: HESNumero;
  ordenId: string;
  tipoServicio: TipoServicio;
  prioridad: Prioridad;
  clienteInfo: ClienteInfo;
  condicionesEntrada?: CondicionesEntrada;
  diagnosticoPreliminar?: DiagnosticoPreliminar;
  requerimientosSeguridad?: RequerimientosSeguridad;
  creadoPor: string;
  year?: number;
}

export class HES {
  private _domainEvents: any[] = [];

  private constructor(
    private readonly _id: HESId,
    private readonly _numero: HESNumero,
    private readonly _ordenId: string,
    private _estado: EstadoHES,
    private _tipoServicio: TipoServicio,
    private _prioridad: Prioridad,
    private _nivelRiesgo: NivelRiesgo,
    private _clienteInfo: ClienteInfo,
    private readonly _creadoPor: string,
    private readonly _creadoEn: Date,
    private _condicionesEntrada?: CondicionesEntrada,
    private _diagnosticoPreliminar?: DiagnosticoPreliminar,
    private _requerimientosSeguridad?: RequerimientosSeguridad,
    private _firmaCliente?: FirmaDigital,
    private _firmaTecnico?: FirmaDigital,
    private _firmadoClienteAt?: Date,
    private _firmadoTecnicoAt?: Date,
    private _completadoEn?: Date,
    private _anuladoEn?: Date,
    private _anuladoPor?: string,
    private _motivoAnulacion?: string,
    private readonly _version: number = 1,
  ) {}

  public static create(props: CreateHESProps): HES {
    const hes = new HES(
      HESId.generate(),
      props.numero ||
        HESNumero.generate(props.year || new Date().getFullYear(), 1),
      props.ordenId,
      EstadoHES.borrador(),
      props.tipoServicio,
      props.prioridad,
      NivelRiesgo.bajo(), // Se evaluará después
      props.clienteInfo,
      props.creadoPor,
      new Date(),
      props.condicionesEntrada,
      props.diagnosticoPreliminar,
      props.requerimientosSeguridad,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      1,
    );

    // Evaluar nivel de riesgo automáticamente
    hes.evaluarNivelRiesgo();

    hes.addDomainEvent(
      new HESCreatedEvent({
        hesId: hes._id.getValue(),
        numero: hes._numero.getValue(),
        ordenId: hes._ordenId,
      }),
    );

    return hes;
  }

  public actualizarClienteInfo(info: ClienteInfo): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError(
        "No se puede editar HES completada o anulada",
      );
    }
    this._clienteInfo = info;
  }

  public actualizarCondicionesEntrada(condiciones: CondicionesEntrada): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError(
        "No se puede editar HES completada o anulada",
      );
    }
    this._condicionesEntrada = condiciones;
    this.evaluarNivelRiesgo();
  }

  public actualizarDiagnostico(diagnostico: DiagnosticoPreliminar): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError(
        "No se puede editar HES completada o anulada",
      );
    }
    this._diagnosticoPreliminar = diagnostico;
  }

  public establecerRequerimientosSeguridad(
    requerimientos: RequerimientosSeguridad,
  ): void {
    if (!this.puedeEditar()) {
      throw new BusinessRuleViolationError(
        "No se puede editar HES completada o anulada",
      );
    }
    this._requerimientosSeguridad = requerimientos;
    this.evaluarNivelRiesgo();
  }

  public firmarPorCliente(firma: FirmaDigital): void {
    if (this.esAnulado()) {
      throw new BusinessRuleViolationError("No se puede firmar HES anulada");
    }

    if (this._firmaCliente) {
      throw new BusinessRuleViolationError("Cliente ya firmó esta HES");
    }

    this._firmaCliente = firma;
    this._firmadoClienteAt = new Date();

    this.addDomainEvent(
      new HESSignedEvent({
        hesId: this._id.getValue(),
        signedBy: "cliente",
        firmadoPor: firma.getFirmadoPor(),
      }),
    );
  }

  public firmarPorTecnico(firma: FirmaDigital, tecnicoId: string): void {
    if (this.esAnulado()) {
      throw new BusinessRuleViolationError("No se puede firmar HES anulada");
    }

    if (this._firmaTecnico) {
      throw new BusinessRuleViolationError("Técnico ya firmó esta HES");
    }

    this._firmaTecnico = firma;
    this._firmadoTecnicoAt = new Date();

    this.addDomainEvent(
      new HESSignedEvent({
        hesId: this._id.getValue(),
        signedBy: "tecnico",
        firmadoPor: firma.getFirmadoPor(),
      }),
    );
  }

  public completar(): void {
    if (!this.puedeCompletar()) {
      const errores = this.validarCompletitud();
      throw new ValidationError(`HES incompleta: ${errores.join(", ")}`);
    }

    if (!this.tieneFirmas()) {
      throw new BusinessRuleViolationError(
        "Se requieren ambas firmas (cliente y técnico) para completar",
      );
    }

    this._estado = this._estado.transitionTo(EstadoHESEnum.COMPLETADO);
    this._completadoEn = new Date();

    this.addDomainEvent(
      new HESCompletedEvent({
        hesId: this._id.getValue(),
        numero: this._numero.getValue(),
        ordenId: this._ordenId,
      }),
    );
  }

  public anular(motivo: string, anuladoPor: string): void {
    if (this.esAnulado()) {
      throw new BusinessRuleViolationError("HES ya está anulada");
    }

    if (!motivo || motivo.trim() === "") {
      throw new ValidationError("Motivo de anulación es requerido");
    }

    this._estado = this._estado.transitionTo(EstadoHESEnum.ANULADO);
    this._motivoAnulacion = motivo;
    this._anuladoPor = anuladoPor;
    this._anuladoEn = new Date();

    this.addDomainEvent(
      new HESCancelledEvent({
        hesId: this._id.getValue(),
        numero: this._numero.getValue(),
        motivo,
      }),
    );
  }

  private evaluarNivelRiesgo(): void {
    let puntos = 0;

    // Evaluar tipo de servicio
    if (this._tipoServicio.getValue() === "REPARACION") {
      puntos += 2;
    } else if (this._tipoServicio.getValue() === "INSTALACION") {
      puntos += 1;
    }

    // Evaluar requerimientos de seguridad
    if (this._requerimientosSeguridad) {
      if (this._requerimientosSeguridad.tieneRiesgosAltos()) {
        puntos += 2;
      }

      if (!this._requerimientosSeguridad.checklistCompletado()) {
        puntos += 1;
      }
    }

    // Evaluar condiciones de entrada
    if (this._condicionesEntrada) {
      if (this._condicionesEntrada.tieneDanios()) {
        puntos += 1;
      }
    }

    // Asignar nivel según puntos
    if (puntos >= 5) {
      this._nivelRiesgo = NivelRiesgo.critico();
    } else if (puntos >= 3) {
      this._nivelRiesgo = NivelRiesgo.alto();
    } else if (puntos >= 1) {
      this._nivelRiesgo = NivelRiesgo.medio();
    } else {
      this._nivelRiesgo = NivelRiesgo.bajo();
    }
  }

  private puedeEditar(): boolean {
    return this._estado.esBorrador();
  }

  private puedeCompletar(): boolean {
    return this._estado.esBorrador() && this.validarCompletitud().length === 0;
  }

  private validarCompletitud(): string[] {
    const errores: string[] = [];

    if (!this._clienteInfo) {
      errores.push("Falta información del cliente");
    }

    if (!this._condicionesEntrada) {
      errores.push("Falta información de condiciones de entrada");
    } else if (
      this._tipoServicio.requiereFotosEntrada() &&
      !this._condicionesEntrada.tieneFotos()
    ) {
      errores.push("Este tipo de servicio requiere fotos de entrada");
    }

    if (!this._diagnosticoPreliminar) {
      errores.push("Falta diagnóstico preliminar");
    }

    if (!this._requerimientosSeguridad) {
      errores.push("Faltan requerimientos de seguridad");
    } else if (!this._requerimientosSeguridad.checklistCompletado()) {
      errores.push(
        `Checklist de seguridad incompleto (${this._requerimientosSeguridad.getPorcentajeCompletitud()}%)`,
      );
    }

    return errores;
  }

  private tieneFirmas(): boolean {
    return this._firmaCliente !== undefined && this._firmaTecnico !== undefined;
  }

  // Getters
  public getId(): HESId {
    return this._id;
  }

  public getNumero(): string {
    return this._numero.getValue();
  }

  public getOrdenId(): string {
    return this._ordenId;
  }

  public getEstado(): EstadoHES {
    return this._estado;
  }

  public getTipoServicio(): TipoServicio {
    return this._tipoServicio;
  }

  public getPrioridad(): Prioridad {
    return this._prioridad;
  }

  public getNivelRiesgo(): NivelRiesgo {
    return this._nivelRiesgo;
  }

  public getClienteInfo(): ClienteInfo {
    return this._clienteInfo;
  }

  public getCondicionesEntrada(): CondicionesEntrada | undefined {
    return this._condicionesEntrada;
  }

  public getDiagnosticoPreliminar(): DiagnosticoPreliminar | undefined {
    return this._diagnosticoPreliminar;
  }

  public getRequerimientosSeguridad(): RequerimientosSeguridad | undefined {
    return this._requerimientosSeguridad;
  }

  public getFirmaCliente(): FirmaDigital | undefined {
    return this._firmaCliente;
  }

  public getFirmaTecnico(): FirmaDigital | undefined {
    return this._firmaTecnico;
  }

  public clienteFirmo(): boolean {
    return this._firmaCliente !== undefined;
  }

  public tecnicoFirmo(): boolean {
    return this._firmaTecnico !== undefined;
  }

  public esBorrador(): boolean {
    return this._estado.esBorrador();
  }

  public esCompletado(): boolean {
    return this._estado.esCompletado();
  }

  public esAnulado(): boolean {
    return this._estado.esAnulado();
  }

  public requiereAltaSeguridad(): boolean {
    return this._nivelRiesgo.esAlto() || this._nivelRiesgo.esCritico();
  }

  // Domain Events
  public addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  public getDomainEvents(): any[] {
    return [...this._domainEvents];
  }

  public clearDomainEvents(): void {
    this._domainEvents = [];
  }
}
