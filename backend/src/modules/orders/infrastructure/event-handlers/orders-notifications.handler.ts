import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { PrismaService } from "../../../../prisma/prisma.service";
import { NotificationsService } from "../../../notifications/notifications.service";
import { OrderAsignadaEvent } from "../../domain/events/order-asignada.event";
import { OrderEstadoChangedEvent } from "../../domain/events/order-estado-changed.event";

@Injectable()
export class OrdersNotificationsHandler {
  private readonly logger = new Logger(OrdersNotificationsHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private buildOrderUrl(orderId: string): string | undefined {
    const baseUrl = process.env.WEB_BASE_URL?.trim();
    if (!baseUrl) return undefined;
    return `${baseUrl.replace(/\/$/, "")}/Orders/${orderId}`;
  }

  @OnEvent("Order.asignada")
  async handleOrderAsignada(event: OrderAsignadaEvent): Promise<void> {
    try {
      const Order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        include: {
          asignado: { select: { email: true } },
        },
      });

      const recipient = Order?.asignado?.email?.trim();
      if (!recipient) return;

      await this.notifications.enqueueEmail({
        to: recipient,
        subject: `Order asignada${event.numero ? ` (${event.numero})` : ""}`,
        template: "order-assigned",
        templateData: {
          OrderNumero: event.numero,
          descripcion: Order?.descripcion,
          orderUrl: this.buildOrderUrl(event.orderId),
        },
      });
    } catch (error) {
      this.logger.error("Error enviando email de Order asignada", error);
    }
  }

  @OnEvent("Order.estado.changed")
  async handleOrderEstadoChanged(
    event: OrderEstadoChangedEvent,
  ): Promise<void> {
    try {
      if (String(event.estadoNuevo) !== "completada") return;

      const Order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        include: {
          creador: { select: { email: true } },
        },
      });

      const recipient = Order?.creador?.email?.trim();
      if (!recipient) return;

      await this.notifications.enqueueEmail({
        to: recipient,
        subject: `Order completada${event.numero ? ` (${event.numero})` : ""}`,
        template: "order-completed",
        templateData: {
          OrderNumero: event.numero,
          resumen: event.motivo,
          orderUrl: this.buildOrderUrl(event.orderId),
        },
      });
    } catch (error) {
      this.logger.error("Error enviando email de Order completada", error);
    }
  }
}
