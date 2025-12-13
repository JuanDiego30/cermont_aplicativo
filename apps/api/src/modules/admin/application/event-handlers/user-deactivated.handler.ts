/**
 * @eventHandler UserDeactivatedHandler
 * 
 * Maneja el evento UserDeactivatedEvent.
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserDeactivatedEvent } from '../../domain/events/user-deactivated.event';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class UserDeactivatedHandler {
  private readonly logger = new Logger(UserDeactivatedHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('UserDeactivatedEvent')
  async handle(event: UserDeactivatedEvent): Promise<void> {
    try {
      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          action: 'USER_DEACTIVATED',
          userId: event.deactivatedBy,
          entityType: 'User',
          entityId: event.userId,
          changes: {
            reason: event.reason ?? 'No especificada',
          },
        },
      });

      this.logger.log(
        `Auditoría registrada para usuario desactivado: ${event.userEmail}`,
      );

      // Posibles acciones adicionales:
      // - Invalidar todas las sesiones del usuario
      // - Revocar tokens
      // - Notificar al usuario
    } catch (error) {
      this.logger.error(
        `Error procesando UserDeactivatedEvent para ${event.userEmail}`,
        error,
      );
    }
  }
}
