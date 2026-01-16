/**
 * Domain Event: CostDeletedEvent
 *
 * Se publica cuando se elimina un costo
 */

export class CostDeletedEvent {
  public readonly eventName = 'COST_DELETED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId: string;
  public readonly amount: any;
  public readonly deletedBy: string;
  public readonly reason: string;

  constructor(props: {
    costoId: string;
    ordenId: string;
    amount: any;
    deletedBy: string;
    reason: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.costoId;
    this.ordenId = props.ordenId;
    this.amount = props.amount;
    this.deletedBy = props.deletedBy;
    this.reason = props.reason;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      amount: this.amount,
      deletedBy: this.deletedBy,
      reason: this.reason,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
