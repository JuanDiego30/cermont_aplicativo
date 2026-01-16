/**
 * @entity OrderEntity
 * @description Entidad de dominio que representa una Order de Trabajo
 * @layer Domain
 */
import {
  OrderNumero,
  Orderstado,
  Prioridad,
  EstadoOrder,
  PrioridadLevel,
} from "../value-objects";

export interface OrderProps {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: EstadoOrder;
  prioridad: PrioridadLevel;
  fechaInicio?: Date;
  fechaFin?: Date;
  fechaFinEstimada?: Date;
  presupuestoEstimado?: number;
  costoReal?: number;
  creadorId?: string;
  asignadoId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreador {
  id: string;
  name: string;
}

export interface OrderAsignado {
  id: string;
  name: string;
}

/**
 * Domain Event interface for Order aggregate
 * Replaces any[] with strongly typed events
 */
export interface OrderDomainEvent {
  eventName:
    | "Order.estado.changed"
    | "Order.created"
    | "Order.assigned"
    | "Order.completed";
  OrderId: string;
  occurredAt: Date;
  fromEstado?: string;
  toEstado?: string;
  metadata?: Record<string, unknown>;
}

export class OrderEntity {
  private _domainEvents: OrderDomainEvent[] = [];

  private constructor(
    private props: OrderProps,
    private _creador?: OrderCreador,
    private _asignado?: OrderAsignado,
  ) {}

  // Getters
  get id(): string {
    return this.props.id;
  }
  get numero(): OrderNumero {
    return OrderNumero.fromString(this.props.numero)!;
  }
  get descripcion(): string {
    return this.props.descripcion;
  }
  get cliente(): string {
    return this.props.cliente;
  }
  get estado(): Orderstado {
    return Orderstado.create(this.props.estado);
  }
  get prioridad(): Prioridad {
    return Prioridad.create(this.props.prioridad);
  }
  get fechaInicio(): Date | undefined {
    return this.props.fechaInicio;
  }
  get fechaFin(): Date | undefined {
    return this.props.fechaFin;
  }
  get fechaFinEstimada(): Date | undefined {
    return this.props.fechaFinEstimada;
  }
  get presupuestoEstimado(): number | undefined {
    return this.props.presupuestoEstimado;
  }
  get creadorId(): string | undefined {
    return this.props.creadorId;
  }
  get asignadoId(): string | undefined {
    return this.props.asignadoId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get creador(): OrderCreador | undefined {
    return this._creador;
  }
  get asignado(): OrderAsignado | undefined {
    return this._asignado;
  }

  get domainEvents(): readonly OrderDomainEvent[] {
    return [...this._domainEvents];
  }

  get costoReal(): number | undefined {
    return this.props.costoReal;
  }

  // Factory Methods
  static create(
    props: Omit<
      OrderProps,
      "id" | "numero" | "estado" | "createdAt" | "updatedAt"
    >,
    sequence: number,
  ): OrderEntity {
    const numero = OrderNumero.create(sequence);
    const now = new Date();

    return new OrderEntity({
      id: "",
      numero: numero.value,
      descripcion: props.descripcion,
      cliente: props.cliente,
      estado: "planeacion",
      prioridad: props.prioridad || "media",
      fechaFinEstimada: props.fechaFinEstimada,
      presupuestoEstimado: props.presupuestoEstimado,
      creadorId: props.creadorId,
      asignadoId: props.asignadoId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(
    props: OrderProps,
    creador?: OrderCreador,
    asignado?: OrderAsignado,
  ): OrderEntity {
    return new OrderEntity(props, creador, asignado);
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
    if (data.fechaFinEstimada)
      this.props.fechaFinEstimada = data.fechaFinEstimada;
    if (data.presupuestoEstimado !== undefined)
      this.props.presupuestoEstimado = data.presupuestoEstimado;
    if (data.asignadoId !== undefined) this.props.asignadoId = data.asignadoId;
    this.props.updatedAt = new Date();
  }

  changeEstado(newEstado: EstadoOrder): void {
    const currentEstado = this.estado;
    const targetEstado = Orderstado.create(newEstado);

    if (!currentEstado.canTransitionTo(newEstado)) {
      throw new Error(
        `Transición inválida de ${currentEstado.value} a ${newEstado}`,
      );
    }

    this.props.estado = newEstado;
    this.props.updatedAt = new Date();

    // Actualizar fechas según el estado
    if (newEstado === "ejecucion" && !this.props.fechaInicio) {
      this.props.fechaInicio = new Date();
    }
    if (newEstado === "completada") {
      this.props.fechaFin = new Date();
    }

    this.addDomainEvent({
      eventName: "Order.estado.changed",
      OrderId: this.id,
      fromEstado: currentEstado.value,
      toEstado: newEstado,
      occurredAt: new Date(),
    });
  }

  iniciarEjecucion(): void {
    this.changeEstado("ejecucion");
  }

  pausar(): void {
    this.changeEstado("pausada");
  }

  reanudar(): void {
    this.changeEstado("ejecucion");
  }

  completar(): void {
    this.changeEstado("completada");
  }

  cancelar(): void {
    this.changeEstado("cancelada");
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

  protected addDomainEvent(event: OrderDomainEvent): void {
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
      costoReal: this.costoReal,
      creadorId: this.creadorId,
      asignadoId: this.asignadoId,
      creador: this.creador,
      asignado: this.asignado,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
