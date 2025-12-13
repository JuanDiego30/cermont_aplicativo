/**
 * @eventHandler PasswordResetHandler
 * 
 * Maneja el evento PasswordResetEvent.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PasswordResetEvent } from '../../domain/events/password-reset.event';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class PasswordResetHandler {
  private readonly logger = new Logger(PasswordResetHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('PasswordResetEvent')
  async handle(event: PasswordResetEvent): Promise<void> {
    try {
      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          action: event.isAdminReset ? 'PASSWORD_RESET_BY_ADMIN' : 'PASSWORD_CHANGED',
          userId: event.resetBy,
          entityType: 'User',
          entityId: event.userId,
          changes: {
            isAdminReset: event.isAdminReset,
          },
        },
      });

      this.logger.log(
        `Auditoría registrada para reset de contraseña: ${event.userEmail}`,
      );

      // Posibles acciones adicionales:
      // - Notificar al usuario por email
      // - Invalidar sesiones existentes
    } catch (error) {
      this.logger.error(
        `Error procesando PasswordResetEvent para ${event.userEmail}`,
        error,
      );
    }
  }
}
