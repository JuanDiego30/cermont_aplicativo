/**
 * Domain Event: ChecklistCompletedEvent
 * 
 * Se publica cuando un checklist se completa
 */

export class ChecklistCompletedEvent {
  public readonly eventName = 'CHECKLIST_COMPLETED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly ordenId?: string;
  public readonly ejecucionId?: string;
  public readonly completedBy?: string;

  constructor(props: {
    checklistId: string;
    ordenId?: string;
    ejecucionId?: string;
    completedBy?: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.checklistId;
    this.ordenId = props.ordenId;
    this.ejecucionId = props.ejecucionId;
    this.completedBy = props.completedBy;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      ordenId: this.ordenId,
      ejecucionId: this.ejecucionId,
      completedBy: this.completedBy,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

