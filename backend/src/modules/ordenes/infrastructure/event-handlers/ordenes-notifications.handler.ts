import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { PrismaService } from "../../../../prisma/prisma.service";
import { NotificationsService } from "../../../notifications/notifications.service";
import { OrdenAsignadaEvent } from "../../domain/events/orden-asignada.event";
import { OrdenEstadoChangedEvent } from "../../domain/events/orden-estado-changed.event";

@Injectable()
export class OrdenesNotificationsHandler {
  private readonly logger = new Logger(OrdenesNotificationsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private buildOrderUrl(ordenId: string): string | undefined {
    const baseUrl = process.env.WEB_BASE_URL?.trim();
    if (!baseUrl) return undefined;
    return `${baseUrl.replace(/\/$/, "")}/ordenes/${ordenId}`;
  }

  @OnEvent("orden.asignada")
  async handleOrdenAsignada(event: OrdenAsignadaEvent): Promise<void> {
    try {
      const orden = await this.prisma.order.findUnique({
        where: { id: event.ordenId },
        include: {
          asignado: { select: { email: true } },
        },
      });

      const recipient = orden?.asignado?.email?.trim();
      if (!recipient) return;

      await this.notifications.enqueueEmail({
        to: recipient,
        subject: `Orden asignada${event.numero ? ` (${event.numero})` : ""}`,
        template: "order-assigned",
        templateData: {
          ordenNumero: event.numero,
          descripcion: orden?.descripcion,
          orderUrl: this.buildOrderUrl(event.ordenId),
        },
      });
    } catch (error) {
      this.logger.error("Error enviando email de orden asignada", error);
    }
  }

  @OnEvent("orden.estado.changed")
  async handleOrdenEstadoChanged(
    event: OrdenEstadoChangedEvent,
  ): Promise<void> {
    try {
      if (String(event.estadoNuevo) !== "completada") return;

      const orden = await this.prisma.order.findUnique({
        where: { id: event.ordenId },
        include: {
          creador: { select: { email: true } },
        },
      });

      const recipient = orden?.creador?.email?.trim();
      if (!recipient) return;

      await this.notifications.enqueueEmail({
        to: recipient,
        subject: `Orden completada${event.numero ? ` (${event.numero})` : ""}`,
        template: "order-completed",
        templateData: {
          ordenNumero: event.numero,
          resumen: event.motivo,
          orderUrl: this.buildOrderUrl(event.ordenId),
        },
      });
    } catch (error) {
      this.logger.error("Error enviando email de orden completada", error);
    }
  }
}
