/**
 * @entity TecnicoEntity
 * @description Domain Entity representing a Technician
 * @layer Domain
 */
import {
  TecnicoDisponibilidad,
  DisponibilidadLevel,
  TecnicoEspecialidad,
  EspecialidadType,
} from "../value-objects";

export interface TecnicoProps {
  id: string;
  userId: string;
  nombre: string;
  email: string;
  telefono?: string;
  disponibilidad: DisponibilidadLevel;
  especialidades: EspecialidadType[];
  ordenesActivas: number;
  ordenesCompletadas: number;
  calificacionPromedio?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TecnicoEntity {
  private _domainEvents: any[] = [];

  private constructor(private props: TecnicoProps) {}

  // Getters
  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get nombre(): string {
    return this.props.nombre;
  }
  get email(): string {
    return this.props.email;
  }
  get telefono(): string | undefined {
    return this.props.telefono;
  }
  get disponibilidad(): TecnicoDisponibilidad {
    return TecnicoDisponibilidad.create(this.props.disponibilidad);
  }
  get especialidades(): TecnicoEspecialidad {
    return TecnicoEspecialidad.create(this.props.especialidades);
  }
  get ordenesActivas(): number {
    return this.props.ordenesActivas;
  }
  get ordenesCompletadas(): number {
    return this.props.ordenesCompletadas;
  }
  get calificacionPromedio(): number | undefined {
    return this.props.calificacionPromedio;
  }
  get active(): boolean {
    return this.props.active;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get domainEvents(): readonly any[] {
    return [...this._domainEvents];
  }

  get isAvailableForAssignment(): boolean {
    return (
      this.active &&
      this.disponibilidad.canBeAssigned &&
      this.ordenesActivas < 3
    );
  }

  // Factory Methods
  static create(
    props: Omit<
      TecnicoProps,
      "id" | "ordenesActivas" | "ordenesCompletadas" | "createdAt" | "updatedAt"
    >,
  ): TecnicoEntity {
    const now = new Date();
    return new TecnicoEntity({
      ...props,
      id: "",
      ordenesActivas: 0,
      ordenesCompletadas: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: TecnicoProps): TecnicoEntity {
    return new TecnicoEntity(props);
  }

  // Business Methods
  updateDetails(data: {
    nombre?: string;
    telefono?: string;
    especialidades?: EspecialidadType[];
  }): void {
    if (data.nombre) this.props.nombre = data.nombre;
    if (data.telefono !== undefined) this.props.telefono = data.telefono;
    if (data.especialidades) this.props.especialidades = data.especialidades;
    this.props.updatedAt = new Date();
  }

  changeDisponibilidad(newDisponibilidad: DisponibilidadLevel): void {
    const current = this.disponibilidad;

    if (!current.canTransitionTo(newDisponibilidad)) {
      throw new Error(
        `Transición inválida de ${current.value} a ${newDisponibilidad}`,
      );
    }

    const oldValue = this.props.disponibilidad;
    this.props.disponibilidad = newDisponibilidad;
    this.props.updatedAt = new Date();

    this.addDomainEvent({
      eventName: "tecnico.disponibilidad.changed",
      tecnicoId: this.id,
      fromDisponibilidad: oldValue,
      toDisponibilidad: newDisponibilidad,
      occurredAt: new Date(),
    });
  }

  setDisponible(): void {
    this.changeDisponibilidad("disponible");
  }

  setOcupado(): void {
    this.changeDisponibilidad("ocupado");
  }

  assignOrden(): void {
    if (!this.isAvailableForAssignment) {
      throw new Error("Técnico no disponible para asignación");
    }
    this.props.ordenesActivas += 1;
    if (this.props.ordenesActivas >= 3) {
      this.setOcupado();
    }
    this.props.updatedAt = new Date();
  }

  completeOrden(): void {
    if (this.props.ordenesActivas > 0) {
      this.props.ordenesActivas -= 1;
      this.props.ordenesCompletadas += 1;
    }
    if (
      this.props.ordenesActivas === 0 &&
      this.props.disponibilidad === "ocupado"
    ) {
      this.setDisponible();
    }
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.active = false;
    this.props.updatedAt = new Date();
    this.addDomainEvent({
      eventName: "tecnico.deactivated",
      tecnicoId: this.id,
      occurredAt: new Date(),
    });
  }

  activate(): void {
    this.props.active = true;
    this.props.disponibilidad = "disponible";
    this.props.updatedAt = new Date();
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
      userId: this.userId,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      disponibilidad: this.props.disponibilidad,
      especialidades: this.props.especialidades,
      ordenesActivas: this.ordenesActivas,
      ordenesCompletadas: this.ordenesCompletadas,
      calificacionPromedio: this.calificacionPromedio,
      active: this.active,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
