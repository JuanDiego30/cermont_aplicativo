/**
 * @entity OrdenEntity
 * @description Entidad de dominio que representa una Orden de Trabajo
 * @layer Domain
 */
import { OrdenNumero, OrdenEstado, Prioridad, EstadoOrden, PrioridadLevel } from '../value-objects';

export interface OrdenProps {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: EstadoOrden;
  prioridad: PrioridadLevel;
  fechaInicio?: Date;
  fechaFin?: Date;
  fechaFinEstimada?: Date;
  presupuestoEstimado?: number;
  creadorId: string;
  asignadoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrdenCreador {
  id: string;
  name: string;
}

export interface OrdenAsignado {
  id: string;
  name: string;
}

export class OrdenEntity {
  private _domainEvents: any[] = [];

  private constructor(
    private props: OrdenProps,
    private _creador?: OrdenCreador,
    private _asignado?: OrdenAsignado,
  ) {}

  // Getters
  get id(): string { return this.props.id; }
  get numero(): OrdenNumero { return OrdenNumero.fromString(this.props.numero)!; }
  get descripcion(): string { return this.props.descripcion; }
  get cliente(): string { return this.props.cliente; }
  get estado(): OrdenEstado { return OrdenEstado.create(this.props.estado); }
  get prioridad(): Prioridad { return Prioridad.create(this.props.prioridad); }
  get fechaInicio(): Date | undefined { return this.props.fechaInicio; }
  get fechaFin(): Date | undefined { return this.props.fechaFin; }
  get fechaFinEstimada(): Date | undefined { return this.props.fechaFinEstimada; }
  get presupuestoEstimado(): number | undefined { return this.props.presupuestoEstimado; }
  get creadorId(): string { return this.props.creadorId; }
  get asignadoId(): string | undefined { return this.props.asignadoId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get creador(): OrdenCreador | undefined { return this._creador; }
  get asignado(): OrdenAsignado | undefined { return this._asignado; }

  get domainEvents(): readonly any[] {
    return [...this._domainEvents];
  }

  // Factory Methods
  static create(
    props: Omit<OrdenProps, 'id' | 'numero' | 'estado' | 'createdAt' | 'updatedAt'>,
    sequence: number,
  ): OrdenEntity {
    const numero = OrdenNumero.create(sequence);
    const now = new Date();

    return new OrdenEntity({
      id: '',
      numero: numero.value,
      descripcion: props.descripcion,
      cliente: props.cliente,
      estado: 'planeacion',
      prioridad: props.prioridad || 'media',
      fechaFinEstimada: props.fechaFinEstimada,
      presupuestoEstimado: props.presupuestoEstimado,
      creadorId: props.creadorId,
      asignadoId: props.asignadoId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(
    props: OrdenProps,
    creador?: OrdenCreador,
    asignado?: OrdenAsignado,
  ): OrdenEntity {
    return new OrdenEntity(props, creador, asignado);
  }

  // Business Methods
  updateDetails(data: {
    descripcion?: string;
    cliente?: string;
    prioridad?: PrioridadLevel;
    fechaFinEstimada?: Date;
    presupuestoEstimado?: number;
    asignadoId?: string;
  }): void {
    if (data.descripcion) this.props.descripcion = data.descripcion;
    if (data.cliente) this.props.cliente = data.cliente;
    if (data.prioridad) this.props.prioridad = data.prioridad;
    if (data.fechaFinEstimada) this.props.fechaFinEstimada = data.fechaFinEstimada;
    if (data.presupuestoEstimado !== undefined) this.props.presupuestoEstimado = data.presupuestoEstimado;
    if (data.asignadoId !== undefined) this.props.asignadoId = data.asignadoId;
    this.props.updatedAt = new Date();
  }

  changeEstado(newEstado: EstadoOrden): void {
    const currentEstado = this.estado;
    const targetEstado = OrdenEstado.create(newEstado);

    if (!currentEstado.canTransitionTo(newEstado)) {
      throw new Error(
        `Transición inválida de ${currentEstado.value} a ${newEstado}`,
      );
    }

    this.props.estado = newEstado;
    this.props.updatedAt = new Date();

    // Actualizar fechas según el estado
    if (newEstado === 'ejecucion' && !this.props.fechaInicio) {
      this.props.fechaInicio = new Date();
    }
    if (newEstado === 'completada') {
      this.props.fechaFin = new Date();
    }

    this.addDomainEvent({
      eventName: 'orden.estado.changed',
      ordenId: this.id,
      fromEstado: currentEstado.value,
      toEstado: newEstado,
      occurredAt: new Date(),
    });
  }

  iniciarEjecucion(): void {
    this.changeEstado('ejecucion');
  }

  pausar(): void {
    this.changeEstado('pausada');
  }

  reanudar(): void {
    this.changeEstado('ejecucion');
  }

  completar(): void {
    this.changeEstado('completada');
  }

  cancelar(): void {
    this.changeEstado('cancelada');
  }

  asignarTecnico(tecnicoId: string): void {
    this.props.asignadoId = tecnicoId;
    this.props.updatedAt = new Date();
  }

  getDiasDesdeCreacion(): number {
    const diff = Date.now() - this.props.createdAt.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  getDiasHastaVencimiento(): number | null {
    if (!this.props.fechaFinEstimada) return null;
    const diff = this.props.fechaFinEstimada.getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  isVencida(): boolean {
    const dias = this.getDiasHastaVencimiento();
    return dias !== null && dias < 0 && this.estado.isActive;
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  protected addDomainEvent(event: any): void {
    this._domainEvents.push(event);
  }

  toJSON() {
    return {
      id: this.id,
      numero: this.props.numero,
      descripcion: this.descripcion,
      cliente: this.cliente,
      estado: this.props.estado,
      prioridad: this.props.prioridad,
      fechaInicio: this.fechaInicio?.toISOString(),
      fechaFin: this.fechaFin?.toISOString(),
      fechaFinEstimada: this.fechaFinEstimada?.toISOString(),
      presupuestoEstimado: this.presupuestoEstimado,
      creadorId: this.creadorId,
      asignadoId: this.asignadoId,
      creador: this.creador,
      asignado: this.asignado,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
