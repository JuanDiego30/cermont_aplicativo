/**
 * Domain Event: CostoRegisteredEvent
 * 
 * Se publica cuando se registra un nuevo costo
 */

export class CostoRegisteredEvent {
  public readonly eventName = 'COSTO_REGISTERED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId: string;
  public readonly amount: any;
  public readonly type: string;
  public readonly category: string;
  public readonly registeredBy: string;

  constructor(props: {
    costoId: string;
    ordenId: string;
    amount: any;
    type: string;
    category: string;
    registeredBy: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.costoId;
    this.ordenId = props.ordenId;
    this.amount = props.amount;
    this.type = props.type;
    this.category = props.category;
    this.registeredBy = props.registeredBy;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      amount: this.amount,
      type: this.type,
      category: this.category,
      registeredBy: this.registeredBy,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

