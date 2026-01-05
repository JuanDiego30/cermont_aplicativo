/**
 * @event CierreApprovedEvent
 */
export class CierreApprovedEvent {
  readonly eventName = "cierre.approved";
  readonly occurredAt: Date;

  constructor(
    readonly cierreId: string,
    readonly ordenId: string,
    readonly approvedBy: string,
    readonly totals: Record<string, number>,
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      cierreId: this.cierreId,
      ordenId: this.ordenId,
      approvedBy: this.approvedBy,
      totals: this.totals,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
