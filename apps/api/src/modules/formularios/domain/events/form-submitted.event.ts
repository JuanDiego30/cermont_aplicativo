/**
 * Domain Event: FormSubmittedEvent
 * 
 * Disparado cuando se envía un formulario
 */

import { DomainEvent } from '../../../../common/domain/events/domain-events';

export interface FormSubmittedEventPayload {
  submissionId: string;
  templateId: string;
  submittedBy: string;
  contextType: string;
  contextId?: string;
}

export class FormSubmittedEvent extends DomainEvent {
  constructor(public readonly payload: FormSubmittedEventPayload) {
    super('FormSubmission', payload.submissionId);
  }

  get eventName(): string {
    return 'FormSubmitted';
  }
}

