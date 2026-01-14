/**
 * Domain Event: TemplateArchivedEvent
 *
 * Disparado cuando un template se archiva
 */

import { DomainEvent } from "../../../../common/domain/events/domain-events";

export interface TemplateArchivedEventPayload {
  templateId: string;
  name: string;
}

export class TemplateArchivedEvent extends DomainEvent {
  constructor(public readonly payload: TemplateArchivedEventPayload) {
    super("FormTemplate", payload.templateId);
  }

  get eventName(): string {
    return "TemplateArchived";
  }
}
