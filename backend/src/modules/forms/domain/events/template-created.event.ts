/**
 * Domain Event: TemplateCreatedEvent
 *
 * Disparado cuando se crea un nuevo template de formulario
 */

import { DomainEvent } from '../../../../shared/domain/events/domain-events';

export interface TemplateCreatedEventPayload {
  templateId: string;
  name: string;
  contextType: string;
  createdBy: string;
}

export class TemplateCreatedEvent extends DomainEvent {
  constructor(public readonly payload: TemplateCreatedEventPayload) {
    super('FormTemplate', payload.templateId);
  }

  get eventName(): string {
    return 'TemplateCreated';
  }
}
