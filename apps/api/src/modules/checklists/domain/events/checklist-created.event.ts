/**
 * Domain Event: ChecklistCreatedEvent
 *
 * Se publica cuando se crea una nueva plantilla de checklist
 */

export class ChecklistCreatedEvent {
  public readonly eventName = "CHECKLIST_CREATED";
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly name: string;
  public readonly tipo: string;
  public readonly itemsCount: number;

  constructor(props: {
    checklistId: string;
    name: string;
    tipo: string;
    itemsCount: number;
    timestamp: Date;
  }) {
    this.aggregateId = props.checklistId;
    this.name = props.name;
    this.tipo = props.tipo;
    this.itemsCount = props.itemsCount;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      name: this.name,
      tipo: this.tipo,
      itemsCount: this.itemsCount,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
