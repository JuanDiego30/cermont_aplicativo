/**
 * Domain Event: FormValidatedEvent
 *
 * Disparado cuando un formulario es validado manualmente
 */

import { DomainEvent } from "../../../../shared/domain/events/domain-events";

export interface FormValidatedEventPayload {
  submissionId: string;
  templateId: string;
  validatedBy: string;
}

export class FormValidatedEvent extends DomainEvent {
  constructor(public readonly payload: FormValidatedEventPayload) {
    super("FormSubmission", payload.submissionId);
  }

  get eventName(): string {
    return "FormValidated";
  }
}

