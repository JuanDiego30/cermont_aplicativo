import { Prisma } from '@/prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderEstadoChangedEvent } from '../../domain/events/order-estado-changed.event';
import { OrdersWebhookService } from '../services/orders-webhook.service';

@Injectable()
export class OrdersWebhookHandler {
  private readonly logger = new Logger(OrdersWebhookHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhook: OrdersWebhookService
  ) {}

  @OnEvent('Order.estado.changed')
  async handleOrderEstadoChanged(event: OrderEstadoChangedEvent): Promise<void> {
    try {
      const shouldSend = Boolean(process.env.Orders_WEBHOOK_URL?.trim());
      if (!shouldSend) return;

      const idempotencyKey = `order-status-changed:${event.orderId}:${event.estadoAnterior}:${event.estadoNuevo}`;

      const where: Prisma.AuditLogWhereInput = {
        entityType: 'Order',
        entityId: event.orderId,
        action: 'ORDER_WEBHOOK_SENT',
        // JSON filter (Postgres): si no está soportado en el provider, el fallback es abajo.
        changes: {
          path: ['idempotencyKey'],
          equals: idempotencyKey,
        },
      };

      const existing = await this.prisma.auditLog.findFirst({
        where,
        select: { id: true },
      });

      if (existing) return;

      const result = await this.webhook.sendEstadoChanged({
        orderId: event.orderId,
        numero: event.numero,
        from: event.estadoAnterior,
        to: event.estadoNuevo,
        motivo: event.motivo,
        usuarioId: event.usuarioId,
        timestamp: event.timestamp,
        idempotencyKey,
      });

      await this.prisma.auditLog.create({
        data: {
          entityType: 'Order',
          entityId: event.orderId,
          action: 'ORDER_WEBHOOK_SENT',
          userId: event.usuarioId,
          changes: {
            idempotencyKey,
            event: 'Order.estado.changed',
            from: event.estadoAnterior,
            to: event.estadoNuevo,
            status: result.status,
            url: result.url,
          },
        },
      });
    } catch (error) {
      this.logger.error('Error enviando webhook de cambio de estado', error);
    }
  }
}
