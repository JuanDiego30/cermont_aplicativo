/**
 * Domain Event: BudgetAlertTriggeredEvent
 * 
 * Se publica cuando se alcanza el umbral de alerta presupuestal (>80%)
 */

export class BudgetAlertTriggeredEvent {
  public readonly eventName = 'BUDGET_ALERT_TRIGGERED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId: string;
  public readonly utilizationPercentage: number | any;
  public readonly threshold: number | any;

  constructor(props: {
    ordenId: string;
    utilizationPercentage: number | any;
    threshold: number | any;
    timestamp: Date;
  }) {
    this.aggregateId = props.ordenId;
    this.ordenId = props.ordenId;
    this.utilizationPercentage = props.utilizationPercentage;
    this.threshold = props.threshold;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      utilizationPercentage:
        typeof this.utilizationPercentage === 'number'
          ? this.utilizationPercentage
          : String(this.utilizationPercentage),
      threshold:
        typeof this.threshold === 'number' ? this.threshold : String(this.threshold),
      timestamp: this.timestamp.toISOString(),
    };
  }
}

