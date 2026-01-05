/**
 * @eventHandler RoleChangedHandler
 *
 * Maneja el evento RoleChangedEvent.
 */

import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RoleChangedEvent } from "../../domain/events/role-changed.event";
import { PrismaService } from "../../../../prisma/prisma.service";

@Injectable()
export class RoleChangedHandler {
  private readonly logger = new Logger(RoleChangedHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent("RoleChangedEvent")
  async handle(event: RoleChangedEvent): Promise<void> {
    try {
      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          action: "ROLE_UPDATED",
          userId: event.changedBy,
          entityType: "User",
          entityId: event.userId,
          changes: {
            rolAnterior: event.oldRole,
            nuevoRol: event.newRole,
          },
        },
      });

      this.logger.log(
        `Auditoría registrada para cambio de rol: ${event.userEmail} (${event.oldRole} -> ${event.newRole})`,
      );

      // Posibles acciones adicionales:
      // - Notificar al usuario afectado
      // - Invalidar sesiones activas
      // - Actualizar permisos en cache
    } catch (error) {
      this.logger.error(
        `Error procesando RoleChangedEvent para ${event.userEmail}`,
        error,
      );
    }
  }
}
