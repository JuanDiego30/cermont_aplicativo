import { Injectable } from '@nestjs/common';

import { EmailService } from './email/email.service';
import { EmailQueueService } from './email/email-queue.service';
import { renderEmailTemplate, type EmailTemplateName } from './email/email-templates';
import type { SendEmailInput, SendEmailResult } from './email/email.types';

/**
 * Façade del módulo de notificaciones.
 * Mantiene un punto de entrada estable para envío de emails (y futuros canales si aplica).
 */
@Injectable()
export class NotificationsService {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailQueue: EmailQueueService,
  ) {}

  sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    return this.emailService.sendEmail(input);
  }

  async enqueueEmail(input: SendEmailInput): Promise<void> {
    await this.emailQueue.enqueue(input);
  }

  async enqueueEmailBatch(inputs: SendEmailInput[]): Promise<void> {
    await this.emailQueue.enqueueBatch(inputs);
  }

  renderTemplate(name: EmailTemplateName, data: Record<string, unknown>): { html: string; text: string } {
    return renderEmailTemplate(name, data);
  }
}
