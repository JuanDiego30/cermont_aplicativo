/**
 * @event CierreRejectedEvent
 */
export class CierreRejectedEvent {
  readonly eventName = 'cierre.rejected';
  readonly occurredAt: Date;

  constructor(
    readonly cierreId: string,
    readonly ordenId: string,
    readonly rejectedBy: string,
    readonly reason: Record<string, string>
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      cierreId: this.cierreId,
      ordenId: this.ordenId,
      rejectedBy: this.rejectedBy,
      reason: this.reason,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
