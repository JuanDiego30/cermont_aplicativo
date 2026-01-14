/**
 * @eventHandler UserCreatedHandler
 *
 * Maneja el evento UserCreatedEvent.
 * Responsabilidades: auditoría, notificaciones, etc.
 */

import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserCreatedEvent } from "../../domain/events/user-created.event";
import { PrismaService } from "../../../../prisma/prisma.service";

@Injectable()
export class UserCreatedHandler {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent("UserCreatedEvent")
  async handle(event: UserCreatedEvent): Promise<void> {
    try {
      // Registrar en auditoría
      await this.prisma.auditLog.create({
        data: {
          action: "USER_CREATED",
          userId: event.createdBy ?? "SYSTEM",
          entityType: "User",
          entityId: event.userId,
          changes: {
            email: event.email,
            name: event.name,
            role: event.role,
          },
        },
      });

      this.logger.log(
        `Auditoría registrada para usuario creado: ${event.email}`,
      );

      // Aquí se pueden agregar más acciones:
      // - Enviar email de bienvenida
      // - Notificar a administradores
      // - Sincronizar con sistemas externos
    } catch (error) {
      this.logger.error(
        `Error procesando UserCreatedEvent para ${event.email}`,
        error,
      );
    }
  }
}
