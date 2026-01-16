/**
 * Domain Event: TemplatePublishedEvent
 *
 * Disparado cuando un template se publica
 */

import { DomainEvent } from '../../../../shared/domain/events/domain-events';

export interface TemplatePublishedEventPayload {
  templateId: string;
  name: string;
  version: string;
}

export class TemplatePublishedEvent extends DomainEvent {
  constructor(public readonly payload: TemplatePublishedEventPayload) {
    super('FormTemplate', payload.templateId);
  }

  get eventName(): string {
    return 'TemplatePublished';
  }
}
