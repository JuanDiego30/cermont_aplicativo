/**
 * @service OrderStateService
 *
 * Servicio de State Machine para gestionar transiciones de estados de órdenes.
 * Implementa validación, historial y triggers automáticos.
 */
import {
  PrioridadAlerta,
  Prisma,
  OrderStatus as PrismaOrderStatus,
  OrderSubState as PrismaOrderSubState,
  TipoAlerta,
} from '@/prisma/client';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  OrderSubState,
  getMainStateFromSubState,
  getNextPossibleStates,
  getStepNumber,
  isValidTransition,
  parseOrderSubState,
} from '../../domain/enums/order-sub-state.enum';

interface TransitionResult {
  success: boolean;
  Order: {
    id: string;
    numero: string;
    estado: string;
    subEstado: string;
    paso: number;
  };
  fromState: string | null;
  toState: string;
  timestamp: Date;
}

@Injectable()
export class OrderStateService {
  private readonly logger = new Logger(OrderStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Transiciona una Order a un nuevo estado
   */
  async transitionTo(
    OrderId: string,
    toState: OrderSubState | string,
    userId?: string,
    notas?: string,
    metadata?: Record<string, unknown>
  ): Promise<TransitionResult> {
    const normalizedToState = typeof toState === 'string' ? parseOrderSubState(toState) : toState;

    if (!normalizedToState) {
      throw new BadRequestException(`Sub-estado inválido: ${String(toState)}`);
    }

    this.logger.log(`Transicionando Order ${OrderId} a ${normalizedToState}`);

    const timestamp = new Date();

    // Update + auditoría en una transacción (no cambiar estado sin historial)
    const { updatedOrder, fromState } = await this.prisma.$transaction(async tx => {
      const Order = await tx.order.findUnique({
        where: { id: OrderId },
        select: {
          id: true,
          numero: true,
          estado: true,
          subEstado: true,
        },
      });

      if (!Order) {
        throw new NotFoundException(`Order ${OrderId} no encontrada`);
      }

      const currentState =
        parseOrderSubState(String(Order.subEstado)) ??
        (Order.subEstado as unknown as OrderSubState);

      if (!isValidTransition(currentState, normalizedToState)) {
        const allowedStates = getNextPossibleStates(currentState);
        throw new BadRequestException(
          `Transición inválida de ${currentState} a ${normalizedToState}. Estados permitidos: ${allowedStates.join(', ')}`
        );
      }

      const newMainState = getMainStateFromSubState(normalizedToState);
      const updatedOrder = await tx.order.update({
        where: { id: OrderId },
        data: {
          subEstado: normalizedToState as unknown as PrismaOrderSubState,
          estado: newMainState as unknown as PrismaOrderStatus,
        },
        select: {
          id: true,
          numero: true,
          estado: true,
          subEstado: true,
        },
      });

      await tx.orderStateHistory.create({
        data: {
          ordenId: OrderId,
          fromState: currentState as unknown as PrismaOrderSubState,
          toState: normalizedToState as unknown as PrismaOrderSubState,
          userId,
          notas,
          metadata: metadata ? (metadata as unknown as Prisma.InputJsonValue) : undefined,
          createdAt: timestamp,
        },
      });

      return { updatedOrder, fromState: currentState };
    });

    this.eventEmitter.emit('order.state.changed', {
      OrderId,
      fromState,
      toState: normalizedToState,
      userId,
      timestamp,
    });

    await this.executeStateTriggers(OrderId, normalizedToState);

    this.logger.log(
      `Order ${updatedOrder.numero} transicionada de ${fromState} a ${normalizedToState}`
    );

    return {
      success: true,
      Order: {
        id: updatedOrder.id,
        numero: updatedOrder.numero,
        estado: updatedOrder.estado,
        subEstado: updatedOrder.subEstado,
        paso: getStepNumber(normalizedToState),
      },
      fromState,
      toState: normalizedToState,
      timestamp,
    };
  }

  /**
   * Obtiene el historial de estados de una Order
   */
  async getStateHistory(OrderId: string) {
    const history = await this.prisma.orderStateHistory.findMany({
      where: { ordenId: OrderId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    return history.map(h => ({
      id: h.id,
      fromState: h.fromState,
      toState: h.toState,
      notas: h.notas,
      usuario: h.user?.name || 'Sistema',
      fecha: h.createdAt.toISOString(),
    }));
  }

  /**
   * Obtiene información del estado actual de una Order
   */
  async getStateInfo(OrderId: string) {
    const Order = await this.prisma.order.findUnique({
      where: { id: OrderId },
      select: {
        id: true,
        numero: true,
        estado: true,
        subEstado: true,
      },
    });

    if (!Order) {
      throw new NotFoundException(`Order ${OrderId} no encontrada`);
    }

    const currentState =
      parseOrderSubState(String(Order.subEstado)) ?? (Order.subEstado as unknown as OrderSubState);

    return {
      ...Order,
      paso: getStepNumber(currentState),
      siguientesEstados: getNextPossibleStates(currentState),
      esFinal: getNextPossibleStates(currentState).length === 0,
    };
  }

  /**
   * Ejecuta triggers automáticos según el estado
   */
  private async executeStateTriggers(OrderId: string, state: OrderSubState) {
    try {
      switch (state) {
        case OrderSubState.PROPUESTA_APROBADA:
          // Auto-crear planeación vacía si no existe
          const existingPlaneacion = await this.prisma.planeacion.findUnique({
            where: { ordenId: OrderId },
          });
          if (!existingPlaneacion) {
            await this.prisma.planeacion.create({
              data: {
                ordenId: OrderId,
                estado: 'borrador',
                cronograma: {},
                manoDeObra: {},
              },
            });
            this.logger.log(`Planeación auto-creada para Order ${OrderId}`);
          }
          break;

        case OrderSubState.ACTA_ELABORADA:
          // Crear alerta si acta no se firma en 7 días
          await this.createAlert(
            OrderId,
            'acta_sin_firmar',
            'warning',
            'Acta pendiente de firma',
            'El acta de entrega lleva más de 7 días sin firmar'
          );
          break;

        case OrderSubState.SES_APROBADA:
          // Calcular comparativa de costos
          await this.calculateCostComparison(OrderId);
          break;

        case OrderSubState.PAGO_RECIBIDO:
          // Marcar Order completada
          await this.prisma.order.update({
            where: { id: OrderId },
            data: {
              estado: PrismaOrderStatus.completada,
              fechaFin: new Date(),
            },
          });
          this.logger.log(`Order ${OrderId} marcada como completada`);
          break;
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error en trigger para estado ${state}: ${err?.message ?? String(error)}`,
        err?.stack
      );
    }
  }

  /**
   * Crea una alerta automática
   */
  private async createAlert(
    OrderId: string,
    tipo: TipoAlerta,
    prioridad: PrioridadAlerta,
    titulo: string,
    mensaje: string
  ) {
    await this.prisma.alertaAutomatica.create({
      data: {
        ordenId: OrderId,
        tipo,
        prioridad,
        titulo,
        mensaje,
      },
    });
    this.logger.log(`Alerta ${tipo} creada para Order ${OrderId}`);
  }

  /**
   * Calcula comparativa de costos estimados vs reales
   */
  private async calculateCostComparison(OrderId: string) {
    const Order = await this.prisma.order.findUnique({
      where: { id: OrderId },
      include: {
        propuesta: true,
        costos: true,
      },
    });

    if (!Order?.propuesta) return;

    const totalReal = Order.costos.reduce((sum: number, c: { monto: number }) => sum + c.monto, 0);
    const totalEstimado = Order.propuesta.total;
    const varianza = totalEstimado > 0 ? ((totalReal - totalEstimado) / totalEstimado) * 100 : 0;

    await this.prisma.comparativaCostos.upsert({
      where: { ordenId: OrderId },
      create: {
        ordenId: OrderId,
        estimadoManoObra: Order.propuesta.costoManoObra,
        estimadoMateriales: Order.propuesta.costoMateriales,
        estimadoEquipos: Order.propuesta.costoEquipos,
        estimadoTransporte: Order.propuesta.costoTransporte,
        estimadoOtros: Order.propuesta.otrosCostos,
        totalEstimado,
        totalReal,
        varianzaPorcentaje: varianza,
        margenRealizado: totalEstimado - totalReal,
      },
      update: {
        totalReal,
        varianzaPorcentaje: varianza,
        margenRealizado: totalEstimado - totalReal,
      },
    });

    this.logger.log(
      `Comparativa de costos calculada para Order ${OrderId}: ${varianza.toFixed(2)}% varianza`
    );
  }
}
