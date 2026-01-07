/**
 * @service OrderStateService
 *
 * Servicio de State Machine para gestionar transiciones de estados de órdenes.
 * Implementa validación, historial y triggers automáticos.
 */
import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  Prisma,
  OrderStatus as PrismaOrderStatus,
  OrderSubState as PrismaOrderSubState,
  TipoAlerta,
  PrioridadAlerta,
} from "@prisma/client";
import { PrismaService } from "../../../../prisma/prisma.service";
import {
  OrderSubState,
  isValidTransition,
  getMainStateFromSubState,
  getNextPossibleStates,
  getStepNumber,
  parseOrderSubState,
} from "../../domain/enums/order-sub-state.enum";

/**
 * Type-safe conversions between domain enums and Prisma enums.
 * These casts are safe because both enums use identical string literal values.
 * Domain: OrderSubState.SOLICITUD_RECIBIDA = "solicitud_recibida"
 * Prisma: PrismaOrderSubState.solicitud_recibida = "solicitud_recibida"
 */
function toPrismaSubState(state: OrderSubState): PrismaOrderSubState {
  return state as unknown as PrismaOrderSubState;
}

function toPrismaStatus(status: string): PrismaOrderStatus {
  return status as unknown as PrismaOrderStatus;
}

function fromPrismaSubState(
  state: PrismaOrderSubState | null,
): OrderSubState | null {
  if (!state) return null;
  return parseOrderSubState(String(state));
}
interface TransitionResult {
  success: boolean;
  orden: {
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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Transiciona una orden a un nuevo estado
   */
  async transitionTo(
    ordenId: string,
    toState: OrderSubState | string,
    userId?: string,
    notas?: string,
    metadata?: Record<string, unknown>,
  ): Promise<TransitionResult> {
    const normalizedToState =
      typeof toState === "string" ? parseOrderSubState(toState) : toState;

    if (!normalizedToState) {
      throw new BadRequestException(`Sub-estado inválido: ${String(toState)}`);
    }

    this.logger.log(`Transicionando orden ${ordenId} a ${normalizedToState}`);

    const timestamp = new Date();

    // Update + auditoría en una transacción (no cambiar estado sin historial)
    const { updatedOrden, fromState } = await this.prisma.$transaction(
      async (tx) => {
        const orden = await tx.order.findUnique({
          where: { id: ordenId },
          select: {
            id: true,
            numero: true,
            estado: true,
            subEstado: true,
          },
        });

        if (!orden) {
          throw new NotFoundException(`Orden ${ordenId} no encontrada`);
        }

        const currentState =
          fromPrismaSubState(orden.subEstado) ?? orden.subEstado as OrderSubState;

        if (!isValidTransition(currentState, normalizedToState)) {
          const allowedStates = getNextPossibleStates(currentState);
          throw new BadRequestException(
            `Transición inválida de ${currentState} a ${normalizedToState}. Estados permitidos: ${allowedStates.join(", ")}`,
          );
        }

        const newMainState = getMainStateFromSubState(normalizedToState);
        const updatedOrden = await tx.order.update({
          where: { id: ordenId },
          data: {
            subEstado: toPrismaSubState(normalizedToState),
            estado: toPrismaStatus(newMainState),
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
            ordenId,
            fromState: toPrismaSubState(currentState),
            toState: toPrismaSubState(normalizedToState),
            userId,
            notas,
            metadata: metadata
              ? (metadata as Prisma.InputJsonValue)
              : undefined,
            createdAt: timestamp,
          },
        });

        return { updatedOrden, fromState: currentState };
      },
    );

    this.eventEmitter.emit("order.state.changed", {
      ordenId,
      fromState,
      toState: normalizedToState,
      userId,
      timestamp,
    });

    await this.executeStateTriggers(ordenId, normalizedToState);

    this.logger.log(
      `Orden ${updatedOrden.numero} transicionada de ${fromState} a ${normalizedToState}`,
    );

    return {
      success: true,
      orden: {
        id: updatedOrden.id,
        numero: updatedOrden.numero,
        estado: updatedOrden.estado,
        subEstado: updatedOrden.subEstado,
        paso: getStepNumber(normalizedToState),
      },
      fromState,
      toState: normalizedToState,
      timestamp,
    };
  }

  /**
   * Obtiene el historial de estados de una orden
   */
  async getStateHistory(ordenId: string) {
    const history = await this.prisma.orderStateHistory.findMany({
      where: { ordenId },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
      },
    });

    return history.map(
      (h: {
        id: string;
        fromState: string | null;
        toState: string;
        notas: string | null;
        user: { name: string } | null;
        createdAt: Date;
      }) => ({
        id: h.id,
        fromState: h.fromState,
        toState: h.toState,
        notas: h.notas,
        usuario: h.user?.name || "Sistema",
        fecha: h.createdAt.toISOString(),
      }),
    );
  }

  /**
   * Obtiene información del estado actual de una orden
   */
  async getStateInfo(ordenId: string) {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      select: {
        id: true,
        numero: true,
        estado: true,
        subEstado: true,
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }

    const currentState =
      fromPrismaSubState(orden.subEstado) ?? orden.subEstado as OrderSubState;

    return {
      ...orden,
      paso: getStepNumber(currentState),
      siguientesEstados: getNextPossibleStates(currentState),
      esFinal: getNextPossibleStates(currentState).length === 0,
    };
  }

  /**
   * Ejecuta triggers automáticos según el estado
   */
  private async executeStateTriggers(ordenId: string, state: OrderSubState) {
    try {
      switch (state) {
        case OrderSubState.PROPUESTA_APROBADA:
          // Auto-crear planeación vacía si no existe
          const existingPlaneacion = await this.prisma.planeacion.findUnique({
            where: { ordenId },
          });
          if (!existingPlaneacion) {
            await this.prisma.planeacion.create({
              data: {
                ordenId,
                estado: "borrador",
                cronograma: {},
                manoDeObra: {},
              },
            });
            this.logger.log(`Planeación auto-creada para orden ${ordenId}`);
          }
          break;

        case OrderSubState.ACTA_ELABORADA:
          // Crear alerta si acta no se firma en 7 días
          await this.createAlert(
            ordenId,
            "acta_sin_firmar",
            "warning",
            "Acta pendiente de firma",
            "El acta de entrega lleva más de 7 días sin firmar",
          );
          break;

        case OrderSubState.SES_APROBADA:
          // Calcular comparativa de costos
          await this.calculateCostComparison(ordenId);
          break;

        case OrderSubState.PAGO_RECIBIDO:
          // Marcar orden completada
          await this.prisma.order.update({
            where: { id: ordenId },
            data: {
              estado: PrismaOrderStatus.completada,
              fechaFin: new Date(),
            },
          });
          this.logger.log(`Orden ${ordenId} marcada como completada`);
          break;
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error en trigger para estado ${state}: ${err?.message ?? String(error)}`,
        err?.stack,
      );
    }
  }

  /**
   * Crea una alerta automática
   */
  private async createAlert(
    ordenId: string,
    tipo: TipoAlerta,
    prioridad: PrioridadAlerta,
    titulo: string,
    mensaje: string,
  ) {
    await this.prisma.alertaAutomatica.create({
      data: {
        ordenId,
        tipo,
        prioridad,
        titulo,
        mensaje,
      },
    });
    this.logger.log(`Alerta ${tipo} creada para orden ${ordenId}`);
  }

  /**
   * Calcula comparativa de costos estimados vs reales
   */
  private async calculateCostComparison(ordenId: string) {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
      include: {
        propuesta: true,
        costos: true,
      },
    });

    if (!orden?.propuesta) return;

    const totalReal = orden.costos.reduce(
      (sum: number, c: { monto: number }) => sum + c.monto,
      0,
    );
    const totalEstimado = orden.propuesta.total;
    const varianza =
      totalEstimado > 0
        ? ((totalReal - totalEstimado) / totalEstimado) * 100
        : 0;

    await this.prisma.comparativaCostos.upsert({
      where: { ordenId },
      create: {
        ordenId,
        estimadoManoObra: orden.propuesta.costoManoObra,
        estimadoMateriales: orden.propuesta.costoMateriales,
        estimadoEquipos: orden.propuesta.costoEquipos,
        estimadoTransporte: orden.propuesta.costoTransporte,
        estimadoOtros: orden.propuesta.otrosCostos,
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
      `Comparativa de costos calculada para orden ${ordenId}: ${varianza.toFixed(2)}% varianza`,
    );
  }
}
