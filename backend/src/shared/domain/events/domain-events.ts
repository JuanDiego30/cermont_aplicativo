/**
 * @event DomainEvent
 * @description Base class for all domain events
 * @layer Domain (Shared)
 */
import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  readonly id: string;
  readonly occurredAt: Date;
  readonly aggregateType: string;
  readonly aggregateId: string;

  constructor(aggregateType: string, aggregateId: string) {
    this.id = randomUUID();
    this.occurredAt = new Date();
    this.aggregateType = aggregateType;
    this.aggregateId = aggregateId;
  }

  abstract get eventName(): string;
}

// Orden Events
export class OrdenCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly numero: string,
    public readonly cliente: string
  ) {
    super('Orden', aggregateId);
  }

  get eventName(): string {
    return 'orden.created';
  }
}

export class OrdenEstadoChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly fromEstado: string,
    public readonly toEstado: string
  ) {
    super('Orden', aggregateId);
  }

  get eventName(): string {
    return 'orden.estado.changed';
  }
}

export class OrdenCompletedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly completedAt: Date
  ) {
    super('Orden', aggregateId);
  }

  get eventName(): string {
    return 'orden.completed';
  }
}

// Tecnico Events
export class TecnicoDisponibilidadChangedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly fromDisponibilidad: string,
    public readonly toDisponibilidad: string
  ) {
    super('Tecnico', aggregateId);
  }

  get eventName(): string {
    return 'tecnico.disponibilidad.changed';
  }
}

export class TecnicoAssignedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly ordenId: string
  ) {
    super('Tecnico', aggregateId);
  }

  get eventName(): string {
    return 'tecnico.assigned';
  }
}

export class TecnicoDeactivatedEvent extends DomainEvent {
  constructor(aggregateId: string) {
    super('Tecnico', aggregateId);
  }

  get eventName(): string {
    return 'tecnico.deactivated';
  }
}
