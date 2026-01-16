import { Prisma } from '@/prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { PrismaService } from '../../../../prisma/prisma.service';
import { OrdenEstadoChangedEvent } from '../../domain/events/orden-estado-changed.event';
import { OrdenesWebhookService } from '../services/ordenes-webhook.service';

@Injectable()
export class OrdenesWebhookHandler {
  private readonly logger = new Logger(OrdenesWebhookHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhook: OrdenesWebhookService
  ) {}

  @OnEvent('orden.estado.changed')
  async handleOrdenEstadoChanged(event: OrdenEstadoChangedEvent): Promise<void> {
    try {
      const shouldSend = Boolean(process.env.ORDENES_WEBHOOK_URL?.trim());
      if (!shouldSend) return;

      const idempotencyKey = `order-status-changed:${event.ordenId}:${event.estadoAnterior}:${event.estadoNuevo}`;

      const where: Prisma.AuditLogWhereInput = {
        entityType: 'Order',
        entityId: event.ordenId,
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
        ordenId: event.ordenId,
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
          entityId: event.ordenId,
          action: 'ORDER_WEBHOOK_SENT',
          userId: event.usuarioId,
          changes: {
            idempotencyKey,
            event: 'orden.estado.changed',
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
