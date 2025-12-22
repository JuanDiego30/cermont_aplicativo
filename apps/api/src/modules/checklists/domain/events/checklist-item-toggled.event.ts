/**
 * Domain Event: ChecklistItemToggledEvent
 * 
 * Se publica cuando se togglea un item de checklist
 */

export class ChecklistItemToggledEvent {
  public readonly eventName = 'CHECKLIST_ITEM_TOGGLED';
  public readonly aggregateId: string;
  public readonly timestamp: Date;
  public readonly itemId: string;
  public readonly checked: boolean;
  public readonly userId?: string;

  constructor(props: {
    checklistId: string;
    itemId: string;
    checked: boolean;
    userId?: string;
    timestamp: Date;
  }) {
    this.aggregateId = props.checklistId;
    this.itemId = props.itemId;
    this.checked = props.checked;
    this.userId = props.userId;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  public toJSON(): Record<string, unknown> {
    return {
      eventName: this.eventName,
      aggregateId: this.aggregateId,
      itemId: this.itemId,
      checked: this.checked,
      userId: this.userId,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

