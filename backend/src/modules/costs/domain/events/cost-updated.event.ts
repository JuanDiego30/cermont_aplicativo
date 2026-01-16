/**
 * Domain Event: CostUpdatedEvent
 *
 * Se publica cuando se actualiza un costo
 */

export class CostUpdatedEvent {
  public readonly eventName = 'COST_UPDATED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId: string;
  public readonly oldAmount: any;
  public readonly newAmount: any;
  public readonly updatedBy: string;
  public readonly reason: string;

  constructor(props: {
    costoId: string;
    ordenId: string;
    oldAmount: any;
    newAmount: any;
    updatedBy: string;
    reason: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.costoId;
    this.ordenId = props.ordenId;
    this.oldAmount = props.oldAmount;
    this.newAmount = props.newAmount;
    this.updatedBy = props.updatedBy;
    this.reason = props.reason;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      oldAmount: this.oldAmount,
      newAmount: this.newAmount,
      updatedBy: this.updatedBy,
      reason: this.reason,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
