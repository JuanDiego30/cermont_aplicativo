/**
 * Domain Event: BudgetExceededEvent
 *
 * Se publica cuando un costo excede el límite presupuestal
 */

export class BudgetExceededEvent {
  public readonly eventName = 'BUDGET_EXCEEDED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId: string;
  public readonly budgetLimit: any;
  public readonly currentTotal: any;
  public readonly exceedAmount: any;
  public readonly costoId: string;

  constructor(props: {
    ordenId: string;
    costoId: string;
    budgetLimit: any;
    currentTotal: any;
    exceedAmount: any;
    timestamp: Date;
  }) {
    this.aggregateId = props.ordenId;
    this.ordenId = props.ordenId;
    this.costoId = props.costoId;
    this.budgetLimit = props.budgetLimit;
    this.currentTotal = props.currentTotal;
    this.exceedAmount = props.exceedAmount;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      costoId: this.costoId,
      budgetLimit: this.budgetLimit,
      currentTotal: this.currentTotal,
      exceedAmount: this.exceedAmount,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
