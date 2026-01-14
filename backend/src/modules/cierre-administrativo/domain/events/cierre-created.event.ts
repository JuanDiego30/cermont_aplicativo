/**
 * @event CierreCreatedEvent
 */
export class CierreCreatedEvent {
  readonly eventName = "cierre.created";
  readonly occurredAt: Date;

  constructor(
    readonly cierreId: string,
    readonly ordenId: string,
    readonly createdBy: string,
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      cierreId: this.cierreId,
      ordenId: this.ordenId,
      createdBy: this.createdBy,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
