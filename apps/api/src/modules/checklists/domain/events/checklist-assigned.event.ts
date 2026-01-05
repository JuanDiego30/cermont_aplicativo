/**
 * Domain Event: ChecklistAssignedEvent
 *
 * Se publica cuando un checklist se asigna a una orden o ejecución
 */

export class ChecklistAssignedEvent {
  public readonly eventName = "CHECKLIST_ASSIGNED";
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly templateId?: string;
  public readonly ordenId?: string;
  public readonly ejecucionId?: string;

  constructor(props: {
    checklistId: string;
    templateId?: string;
    ordenId?: string;
    ejecucionId?: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.checklistId;
    this.templateId = props.templateId;
    this.ordenId = props.ordenId;
    this.ejecucionId = props.ejecucionId;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      templateId: this.templateId,
      ordenId: this.ordenId,
      ejecucionId: this.ejecucionId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
