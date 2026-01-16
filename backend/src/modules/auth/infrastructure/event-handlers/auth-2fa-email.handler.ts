import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationsService } from '../../../notifications/notifications.service';

type TwoFactorCodeGeneratedEvent = {
  userId: string;
  email: string;
  name?: string;
  code: string;
  expiresAt: Date;
};

@Injectable()
export class Auth2FAEmailHandler {
  private readonly logger = new Logger(Auth2FAEmailHandler.name);

  constructor(private readonly notifications: NotificationsService) {}

  @OnEvent('auth.2fa.code-generated')
  async handle(event: TwoFactorCodeGeneratedEvent): Promise<void> {
    try {
      // Regla 6: nunca loguear el código
      await this.notifications.enqueueEmail({
        to: event.email,
        subject: 'Tu código de verificación (2FA)',
        template: 'two-factor-code',
        templateData: {
          name: event.name,
          code: event.code,
          expiresAt: event.expiresAt.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Error enviando email de 2FA', error as any);
    }
  }
}
