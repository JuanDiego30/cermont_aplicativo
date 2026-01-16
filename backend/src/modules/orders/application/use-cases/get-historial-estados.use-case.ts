/**
 * @useCase GetHistorialEstadosUseCase
 * @description Caso de uso para obtener el historial de cambios de estado de una Order
 * @layer Application
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  getMainStateFromSubState,
  parseOrderSubState,
} from '../../domain/enums/order-sub-state.enum';
import {
  IOrderRepository,
  Order_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { HistorialEstadoDto } from '../dto/order-response.dto';
import { Orderstado } from '../dto/update-order.dto';

function isOrderstadoValue(value: unknown): value is Orderstado {
  return typeof value === 'string' && (Object.values(Orderstado) as string[]).includes(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

@Injectable()
export class GetHistorialEstadosUseCase {
  private readonly logger = new Logger(GetHistorialEstadosUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository
  ) {}

  async execute(OrderId: string): Promise<HistorialEstadoDto[]> {
    try {
      this.logger.log(`Obteniendo historial de estados para Order: ${OrderId}`);

      // Verificar que la Order existe
      const Order = await this.OrderRepository.findById(OrderId);
      if (!Order) {
        return [];
      }

      // Obtener historial de sub-estados (OrderStateHistory)
      const historialSubEstados = await this.prisma.orderStateHistory.findMany({
        where: { ordenId: OrderId },
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      });

      // Convertir a DTOs
      const historial: HistorialEstadoDto[] = historialSubEstados.map(h => {
        const fromSub = h.fromState ? parseOrderSubState(String(h.fromState)) : null;
        const toSub = parseOrderSubState(String(h.toState));

        const estadoAnterior = fromSub
          ? (getMainStateFromSubState(fromSub) as unknown as Orderstado)
          : undefined;

        const estadoNuevo = toSub
          ? (getMainStateFromSubState(toSub) as unknown as Orderstado)
          : ((Order.estado.value || 'pendiente') as unknown as Orderstado);

        return {
          id: h.id,
          OrderId: h.ordenId,
          estadoAnterior,
          estadoNuevo,
          motivo: h.notas || 'Cambio de sub-estado',
          observaciones: h.notas || undefined,
          usuarioId: h.userId || undefined,
          createdAt: h.createdAt.toISOString(),
        };
      });

      // Fallback: si no hay historial en orderStateHistory, intentar desde auditLog
      if (historial.length === 0) {
        const auditEntries = await this.prisma.auditLog.findMany({
          where: {
            entityType: 'Order',
            entityId: OrderId,
            action: 'ORDER_STATUS_CHANGED',
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            userId: true,
            changes: true,
            createdAt: true,
          },
        });

        for (const a of auditEntries) {
          const changes = asRecord(a.changes);

          const fromRaw = changes.from;
          const toRaw = changes.to;
          const motivo = typeof changes.motivo === 'string' ? changes.motivo : undefined;
          const observaciones =
            typeof changes.observaciones === 'string' ? changes.observaciones : undefined;

          const estadoAnterior = isOrderstadoValue(fromRaw) ? fromRaw : undefined;
          const estadoNuevo = isOrderstadoValue(toRaw)
            ? toRaw
            : ((Order.estado.value || 'pendiente') as unknown as Orderstado);

          historial.push({
            id: a.id,
            OrderId,
            estadoAnterior,
            estadoNuevo,
            motivo: motivo || 'Cambio de estado',
            observaciones,
            usuarioId: a.userId || undefined,
            createdAt: a.createdAt.toISOString(),
          });
        }
      }

      // Si a�n no hay historial, crear una entrada inicial con el estado actual
      if (historial.length === 0) {
        historial.push({
          id: Order.id,
          OrderId: Order.id,
          estadoAnterior: undefined,
          estadoNuevo: (Order.estado.value || 'pendiente') as unknown as Orderstado,
          motivo: 'Estado inicial',
          observaciones: undefined,
          usuarioId: Order.creadorId || undefined,
          createdAt: Order.createdAt.toISOString(),
        });
      }

      return historial;
    } catch (error) {
      this.logger.error('Error obteniendo historial de estados', error);
      throw error;
    }
  }
}
